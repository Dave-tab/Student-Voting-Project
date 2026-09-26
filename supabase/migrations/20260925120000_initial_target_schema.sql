-- ==============================================================================
-- TARGET DATABASE SCHEMA BASELINE (v2.3.0-FINAL-CORRECTED)
-- Project: Design and Development of a Web-Based Student Online Voting Platform
-- Project Owner & Chief Architect: David Ayantade Tolulope
-- Total Physical Tables: 21
-- Permanently Retired Tables: public.institutional_students, public.programmes, public.ballots, public.votes
-- ==============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- GROUP A — IDENTITY & ACCESS
-- ------------------------------------------------------------------------------

-- 1. public.roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. public.account_statuses
CREATE TABLE IF NOT EXISTS public.account_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. public.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    account_status_id UUID NOT NULL REFERENCES public.account_statuses(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (LOWER(email));

-- 4. public.students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT,
    matriculation_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_matric_upper ON public.students (UPPER(matriculation_number));

-- 5. public.administrators
CREATE TABLE IF NOT EXISTS public.administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- GROUP B — ACADEMIC REFERENCE DATA
-- ------------------------------------------------------------------------------

-- 6. public.departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. public.levels
CREATE TABLE IF NOT EXISTS public.levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. public.academic_sessions
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- GROUP C — ELECTIONS & VOTER REGISTRATION
-- ------------------------------------------------------------------------------

-- 9. public.election_statuses
CREATE TABLE IF NOT EXISTS public.election_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. public.elections
CREATE TABLE IF NOT EXISTS public.elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    election_status_id UUID NOT NULL REFERENCES public.election_statuses(id) ON DELETE RESTRICT,
    academic_session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_election_dates CHECK (end_datetime > start_datetime)
);

-- 11. public.student_register
CREATE TABLE IF NOT EXISTS public.student_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    matriculation_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE RESTRICT,
    year_of_admission INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_register_election_matric UNIQUE (election_id, matriculation_number),
    CONSTRAINT chk_register_year CHECK (year_of_admission >= 2000 AND year_of_admission <= 2100)
);

CREATE INDEX IF NOT EXISTS idx_student_register_lookup ON public.student_register (election_id, LOWER(email), UPPER(matriculation_number));

-- 12. public.election_officer_assignments
CREATE TABLE IF NOT EXISTS public.election_officer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    assigned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    CONSTRAINT uq_election_officer_assignment UNIQUE (election_id, user_id)
);

-- ------------------------------------------------------------------------------
-- GROUP D — CANDIDATES & POSITIONS
-- ------------------------------------------------------------------------------

-- 13. public.positions
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_positions_election_name UNIQUE (election_id, name)
);

-- 14. public.candidate_statuses
CREATE TABLE IF NOT EXISTS public.candidate_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. public.candidates
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    candidate_status_id UUID NOT NULL REFERENCES public.candidate_statuses(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_candidates_position_student UNIQUE (position_id, student_id)
);

-- 16. public.candidate_details
CREATE TABLE IF NOT EXISTS public.candidate_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL UNIQUE REFERENCES public.candidates(id) ON DELETE CASCADE,
    campaign_slogan TEXT,
    manifesto TEXT,
    photo_path TEXT,
    approval_remarks TEXT,
    withdrawal_reason TEXT,
    is_profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- GROUP E — VOTING ENGINE (LOCKED)
-- ------------------------------------------------------------------------------

-- 17. public.voter_participation (Turnout - Identity Bearing)
CREATE TABLE IF NOT EXISTS public.voter_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    participated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_voter_participation_election_student UNIQUE (election_id, student_id)
);

-- 18. public.ballot_selections (Anonymous Choices - NO Voter Link)
CREATE TABLE IF NOT EXISTS public.ballot_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ballot_selections_candidate ON public.ballot_selections (candidate_id);

-- ------------------------------------------------------------------------------
-- GROUP F — TWO-LEVEL RESULTS PERSISTENCE MODEL
-- ------------------------------------------------------------------------------

-- 19. public.election_results (Position-Level Outcome & Lifecycle State)
CREATE TABLE IF NOT EXISTS public.election_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
    lifecycle_status VARCHAR(50) NOT NULL CHECK (lifecycle_status IN ('CALCULATED', 'REVIEWED', 'PUBLISHED')),
    outcome_status VARCHAR(50) NOT NULL CHECK (outcome_status IN ('WINNER', 'TIED', 'NO_VALID_SELECTION')),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_election_results_position UNIQUE (election_id, position_id)
);

-- 20. public.election_result_entries (Candidate-Level Vote Tallies & Percentages)
CREATE TABLE IF NOT EXISTS public.election_result_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_result_id UUID NOT NULL REFERENCES public.election_results(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE RESTRICT,
    vote_count INTEGER NOT NULL CHECK (vote_count >= 0),
    vote_percentage NUMERIC(5,2) NOT NULL CHECK (vote_percentage >= 0 AND vote_percentage <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_result_entries_candidate UNIQUE (election_result_id, candidate_id)
);

-- ------------------------------------------------------------------------------
-- GROUP G — AUDIT
-- ------------------------------------------------------------------------------

-- 21. public.audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- SEED APPROVED REFERENCE DATA
-- ------------------------------------------------------------------------------

INSERT INTO public.roles (name) VALUES
    ('student'),
    ('super_admin'),
    ('admin'),
    ('administrator'),
    ('electoral_officer')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.account_statuses (name, description) VALUES
    ('Pending Activation', 'Account created but institutional email verification pending'),
    ('Active', 'Account fully activated and verified'),
    ('Suspended', 'Account administratively suspended'),
    ('Deactivated', 'Account permanently deactivated')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.election_statuses (name) VALUES
    ('Draft'),
    ('Scheduled'),
    ('Open'),
    ('Closed'),
    ('Published')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.candidate_statuses (name) VALUES
    ('Nominated'),
    ('Pending_Approval'),
    ('Approved'),
    ('Rejected'),
    ('Withdrawn')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & GRANTS
-- ------------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_officer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ballot_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_result_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read reference tables
GRANT SELECT ON public.roles TO anon, authenticated;
GRANT SELECT ON public.account_statuses TO anon, authenticated;
GRANT SELECT ON public.election_statuses TO anon, authenticated;
GRANT SELECT ON public.candidate_statuses TO anon, authenticated;
GRANT SELECT ON public.departments TO anon, authenticated;
GRANT SELECT ON public.levels TO anon, authenticated;
GRANT SELECT ON public.academic_sessions TO anon, authenticated;

-- RLS Policies
DROP POLICY IF EXISTS roles_select_policy ON public.roles;
CREATE POLICY roles_select_policy ON public.roles FOR SELECT USING (true);

DROP POLICY IF EXISTS account_statuses_select_policy ON public.account_statuses;
CREATE POLICY account_statuses_select_policy ON public.account_statuses FOR SELECT USING (true);

DROP POLICY IF EXISTS election_statuses_select_policy ON public.election_statuses;
CREATE POLICY election_statuses_select_policy ON public.election_statuses FOR SELECT USING (true);

DROP POLICY IF EXISTS candidate_statuses_select_policy ON public.candidate_statuses;
CREATE POLICY candidate_statuses_select_policy ON public.candidate_statuses FOR SELECT USING (true);

DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users FOR SELECT TO authenticated
USING (
    auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.roles r ON r.id = u.role_id
        WHERE u.id = auth.uid() AND LOWER(r.name) IN ('super_admin', 'admin', 'administrator', 'electoral_officer')
    )
);

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS students_select_policy ON public.students;
CREATE POLICY students_select_policy ON public.students FOR SELECT TO authenticated
USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.roles r ON r.id = u.role_id
        WHERE u.id = auth.uid() AND LOWER(r.name) IN ('super_admin', 'admin', 'administrator', 'electoral_officer')
    )
);

DROP POLICY IF EXISTS voter_participation_select_own ON public.voter_participation;
CREATE POLICY voter_participation_select_own ON public.voter_participation FOR SELECT TO authenticated
USING (student_id IN (SELECT s.id FROM public.students s WHERE s.user_id = auth.uid()));

-- Revoke direct writes to protected operational tables
REVOKE INSERT, UPDATE, DELETE ON public.voter_participation FROM public, anon, authenticated;
REVOKE ALL ON public.ballot_selections FROM public, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.student_register FROM public, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.election_results FROM public, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.election_result_entries FROM public, anon, authenticated;

-- ------------------------------------------------------------------------------
-- TRIGGERS
-- ------------------------------------------------------------------------------

-- 1. Anti Privilege Escalation Trigger
CREATE OR REPLACE FUNCTION public.prevent_user_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (OLD.role_id IS DISTINCT FROM NEW.role_id) OR (OLD.account_status_id IS DISTINCT FROM NEW.account_status_id) THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON r.id = u.role_id
            WHERE u.id = auth.uid() AND LOWER(r.name) IN ('super_admin', 'admin')
        ) THEN
            RAISE EXCEPTION 'Unauthorized attempt to alter role or account status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_user_privilege_escalation ON public.users;
CREATE TRIGGER trg_prevent_user_privilege_escalation
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_user_privilege_escalation();

-- 2. Auth Email Synchronization Trigger
CREATE OR REPLACE FUNCTION public.sync_auth_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (OLD.email IS DISTINCT FROM NEW.email) THEN
        UPDATE public.users SET email = NEW.email, updated_at = now() WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_auth_user_email ON auth.users;
CREATE TRIGGER trg_sync_auth_user_email
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_auth_user_email();

-- 3. Post-Verification Activation Trigger Boundary
CREATE OR REPLACE FUNCTION public.on_auth_user_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_active_status_id UUID;
BEGIN
    IF (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL) THEN
        SELECT id INTO v_active_status_id FROM public.account_statuses WHERE name = 'Active';
        IF v_active_status_id IS NOT NULL THEN
            UPDATE public.users 
            SET account_status_id = v_active_status_id, updated_at = now() 
            WHERE id = NEW.id AND account_status_id = (SELECT id FROM public.account_statuses WHERE name = 'Pending Activation');
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_verified ON auth.users;
CREATE TRIGGER trg_on_auth_user_verified
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.on_auth_user_verified();

-- 4. Electoral Officer Role Enforcement Trigger
CREATE OR REPLACE FUNCTION public.enforce_electoral_officer_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role_name VARCHAR;
BEGIN
    SELECT r.name INTO v_role_name FROM public.users u JOIN public.roles r ON r.id = u.role_id WHERE u.id = NEW.user_id;
    IF LOWER(v_role_name) != 'electoral_officer' THEN
        RAISE EXCEPTION 'Assigned user must possess the electoral_officer role.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_electoral_officer_role ON public.election_officer_assignments;
CREATE TRIGGER trg_enforce_electoral_officer_role
    BEFORE INSERT OR UPDATE ON public.election_officer_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_electoral_officer_role();

-- 5. Results Immutability Trigger on Parent (election_results)
CREATE OR REPLACE FUNCTION public.enforce_results_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (OLD.lifecycle_status = 'PUBLISHED') THEN
        RAISE EXCEPTION 'Published election results are immutable and cannot be modified or deleted.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_results_immutability ON public.election_results;
CREATE TRIGGER trg_enforce_results_immutability
    BEFORE UPDATE OR DELETE ON public.election_results
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_results_immutability();

-- 6. Child Result Entries Immutability Trigger (election_result_entries)
CREATE OR REPLACE FUNCTION public.enforce_result_entries_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lifecycle_status VARCHAR;
    v_result_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_result_id := OLD.election_result_id;
    ELSE
        v_result_id := NEW.election_result_id;
    END IF;

    SELECT lifecycle_status INTO v_lifecycle_status FROM public.election_results WHERE id = v_result_id;

    IF (v_lifecycle_status = 'PUBLISHED') THEN
        RAISE EXCEPTION 'Child result entries of a published election result are immutable against INSERT, UPDATE, and DELETE.';
    END IF;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_result_entries_immutability ON public.election_result_entries;
CREATE TRIGGER trg_enforce_result_entries_immutability
    BEFORE INSERT OR UPDATE OR DELETE ON public.election_result_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_result_entries_immutability();

-- ------------------------------------------------------------------------------
-- AUTHORITATIVE RPC BOUNDARIES
-- ------------------------------------------------------------------------------

-- RPC 1: submit_ballot
CREATE OR REPLACE FUNCTION public.submit_ballot(
    p_election_id UUID,
    p_selections JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_auth_uid UUID := auth.uid();
    v_student_id UUID;
    v_matric_number VARCHAR(50);
    v_election_status VARCHAR(50);
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_item JSONB;
    v_pos_id UUID;
    v_cand_id UUID;
    v_cand_record RECORD;
BEGIN
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT s.id, s.matriculation_number INTO v_student_id, v_matric_number
    FROM public.students s WHERE s.user_id = v_auth_uid;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Student profile not found.';
    END IF;

    SELECT es.name, e.start_datetime, e.end_datetime 
    INTO v_election_status, v_start_time, v_end_time
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id;

    IF v_election_status IS NULL OR v_election_status != 'Open' OR now() < v_start_time OR now() > v_end_time THEN
        RAISE EXCEPTION 'Election is not open for voting.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.student_register sr
        WHERE sr.election_id = p_election_id
        AND UPPER(TRIM(sr.matriculation_number)) = UPPER(TRIM(v_matric_number))
    ) THEN
        RAISE EXCEPTION 'Student is not registered for this election.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.voter_participation vp
        WHERE vp.election_id = p_election_id AND vp.student_id = v_student_id
    ) THEN
        RAISE EXCEPTION 'Already Voted: You have already submitted a ballot for this election.';
    END IF;

    -- Validate selections and self-voting prohibition
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_selections)
    LOOP
        v_pos_id := (v_item->>'position_id')::UUID;
        v_cand_id := (v_item->>'candidate_id')::UUID;

        IF v_cand_id IS NOT NULL THEN
            SELECT c.id, c.student_id, c.election_id, c.position_id, cs.name AS status_name
            INTO v_cand_record
            FROM public.candidates c
            JOIN public.candidate_statuses cs ON cs.id = c.candidate_status_id
            WHERE c.id = v_cand_id;

            IF v_cand_record.id IS NULL OR v_cand_record.election_id != p_election_id OR v_cand_record.position_id != v_pos_id THEN
                RAISE EXCEPTION 'Invalid candidate selection for position.';
            END IF;

            IF v_cand_record.status_name != 'Approved' THEN
                RAISE EXCEPTION 'Candidate is not approved for voting.';
            END IF;

            IF v_cand_record.student_id = v_student_id THEN
                RAISE EXCEPTION 'Self-voting is strictly prohibited.';
            END IF;
        END IF;
    END LOOP;

    -- Atomic persistence
    INSERT INTO public.voter_participation (election_id, student_id, participated_at)
    VALUES (p_election_id, v_student_id, now());

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_selections)
    LOOP
        v_pos_id := (v_item->>'position_id')::UUID;
        v_cand_id := (v_item->>'candidate_id')::UUID;

        IF v_cand_id IS NOT NULL THEN
            INSERT INTO public.ballot_selections (election_id, position_id, candidate_id, created_at)
            VALUES (p_election_id, v_pos_id, v_cand_id, now());
        END IF;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'message', 'Ballot submitted successfully.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_ballot TO authenticated;

-- RPC 2: calculate_election_results
CREATE OR REPLACE FUNCTION public.calculate_election_results(p_election_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_pos RECORD;
    v_total_valid INTEGER;
    v_max_votes INTEGER;
    v_top_count INTEGER;
    v_outcome VARCHAR(50);
    v_result_id UUID;
    v_cand RECORD;
BEGIN
    FOR v_pos IN SELECT id, name FROM public.positions WHERE election_id = p_election_id
    LOOP
        SELECT COUNT(*) INTO v_total_valid
        FROM public.ballot_selections
        WHERE election_id = p_election_id AND position_id = v_pos.id;

        IF v_total_valid = 0 THEN
            v_outcome := 'NO_VALID_SELECTION';
        ELSE
            SELECT MAX(cnt) INTO v_max_votes
            FROM (
                SELECT COUNT(*) as cnt
                FROM public.ballot_selections
                WHERE election_id = p_election_id AND position_id = v_pos.id
                GROUP BY candidate_id
            ) t;

            SELECT COUNT(*) INTO v_top_count
            FROM (
                SELECT candidate_id
                FROM public.ballot_selections
                WHERE election_id = p_election_id AND position_id = v_pos.id
                GROUP BY candidate_id
                HAVING COUNT(*) = v_max_votes
            ) t2;

            IF v_top_count > 1 THEN
                v_outcome := 'TIED';
            ELSE
                v_outcome := 'WINNER';
            END IF;
        END IF;

        INSERT INTO public.election_results (
            election_id, position_id, lifecycle_status, outcome_status, calculated_at
        ) VALUES (
            p_election_id, v_pos.id, 'CALCULATED', v_outcome, now()
        )
        ON CONFLICT (election_id, position_id) DO UPDATE
        SET lifecycle_status = 'CALCULATED',
            outcome_status = v_outcome,
            calculated_at = now(),
            updated_at = now()
        RETURNING id INTO v_result_id;

        DELETE FROM public.election_result_entries WHERE election_result_id = v_result_id;

        IF v_total_valid > 0 THEN
            FOR v_cand IN 
                SELECT c.id AS candidate_id, COALESCE(COUNT(bs.id), 0) AS vote_count
                FROM public.candidates c
                LEFT JOIN public.ballot_selections bs ON bs.candidate_id = c.id AND bs.position_id = v_pos.id
                WHERE c.position_id = v_pos.id
                GROUP BY c.id
            LOOP
                INSERT INTO public.election_result_entries (
                    election_result_id, candidate_id, vote_count, vote_percentage
                ) VALUES (
                    v_result_id,
                    v_cand.candidate_id,
                    v_cand.vote_count,
                    ROUND((v_cand.vote_count::NUMERIC / v_total_valid::NUMERIC) * 100, 2)
                );
            END LOOP;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'message', 'Results calculated successfully.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_election_results TO authenticated;

-- RPC 3: import_student_register
CREATE OR REPLACE FUNCTION public.import_student_register(
    p_election_id UUID,
    p_students JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_status_name VARCHAR(50);
    v_item JSONB;
    v_dept_id UUID;
    v_level_id UUID;
    v_inserted_count INTEGER := 0;
BEGIN
    SELECT es.name INTO v_status_name
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id;

    IF v_status_name IS NULL OR v_status_name NOT IN ('Draft', 'Scheduled') THEN
        RAISE EXCEPTION 'Voter register import is permitted only when election is in Draft or Scheduled status.';
    END IF;

    DELETE FROM public.student_register WHERE election_id = p_election_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_students)
    LOOP
        SELECT id INTO v_dept_id FROM public.departments WHERE LOWER(name) = LOWER(TRIM(v_item->>'department'));
        IF v_dept_id IS NULL THEN
            INSERT INTO public.departments (name) VALUES (TRIM(v_item->>'department')) RETURNING id INTO v_dept_id;
        END IF;

        SELECT id INTO v_level_id FROM public.levels WHERE LOWER(name) = LOWER(TRIM(v_item->>'level'));
        IF v_level_id IS NULL THEN
            INSERT INTO public.levels (name) VALUES (TRIM(v_item->>'level')) RETURNING id INTO v_level_id;
        END IF;

        INSERT INTO public.student_register (
            election_id, matriculation_number, email, full_name, department_id, level_id, year_of_admission
        ) VALUES (
            p_election_id,
            UPPER(TRIM(v_item->>'matriculation_number')),
            LOWER(TRIM(v_item->>'email')),
            TRIM(v_item->>'full_name'),
            v_dept_id,
            v_level_id,
            (v_item->>'year_of_admission')::INTEGER
        );

        v_inserted_count := v_inserted_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'count', v_inserted_count, 'message', 'Voter register imported successfully.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_student_register TO authenticated;
