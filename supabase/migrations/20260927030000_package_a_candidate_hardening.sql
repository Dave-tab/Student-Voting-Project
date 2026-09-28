-- Migration: 20260927030000_package_a_candidate_hardening.sql
-- Description: Package A Hardening: Active account validation in submit_candidate_application,
--              resubmit_candidate_application RPC for rejected candidates, and status safeguards.

-- 1. Update submit_candidate_application with Active account validation
CREATE OR REPLACE FUNCTION public.submit_candidate_application(
    p_election_id UUID,
    p_position_id UUID,
    p_campaign_slogan TEXT,
    p_manifesto TEXT,
    p_photo_path TEXT
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
    v_pending_status_id UUID;
    v_candidate_id UUID;
BEGIN
    -- 1. Authentication Check
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 1.b. Active Account Status Check
    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.account_statuses ast ON ast.id = u.account_status_id
        WHERE u.id = v_auth_uid AND LOWER(ast.name) = 'active'
    ) THEN
        RAISE EXCEPTION 'Account is not active. Candidate application requires an active account.';
    END IF;

    -- 2. Resolve Student Identity
    SELECT s.id, s.matriculation_number INTO v_student_id, v_matric_number
    FROM public.students s WHERE s.user_id = v_auth_uid;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Student profile not found.';
    END IF;

    -- 3. Verify Election Existence and Status (Draft or Scheduled only)
    SELECT es.name INTO v_election_status
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id;

    IF v_election_status IS NULL THEN
        RAISE EXCEPTION 'Election not found.';
    END IF;

    IF v_election_status NOT IN ('Draft', 'Scheduled') THEN
        RAISE EXCEPTION 'Candidate applications are closed for this election.';
    END IF;

    -- 4. Verify Election Registration Eligibility
    IF NOT EXISTS (
        SELECT 1 FROM public.student_register sr
        WHERE sr.election_id = p_election_id
        AND UPPER(TRIM(sr.matriculation_number)) = UPPER(TRIM(v_matric_number))
    ) THEN
        RAISE EXCEPTION 'Student is not registered for this election.';
    END IF;

    -- 5. Verify Position belongs to Election
    IF NOT EXISTS (
        SELECT 1 FROM public.positions
        WHERE id = p_position_id AND election_id = p_election_id
    ) THEN
        RAISE EXCEPTION 'Invalid position selection for this election.';
    END IF;

    -- 6. Prevent Duplicate Applications for the same election
    IF EXISTS (
        SELECT 1 FROM public.candidates
        WHERE election_id = p_election_id AND student_id = v_student_id
    ) THEN
        RAISE EXCEPTION 'You have already submitted a candidate application for this election.';
    END IF;

    -- 7. Get 'Pending_Approval' Status ID
    SELECT id INTO v_pending_status_id FROM public.candidate_statuses WHERE name = 'Pending_Approval';
    IF v_pending_status_id IS NULL THEN
        RAISE EXCEPTION 'Candidate status system error: Pending_Approval status missing.';
    END IF;

    -- 8. Atomic Persistence
    INSERT INTO public.candidates (
        election_id,
        position_id,
        student_id,
        candidate_status_id
    ) VALUES (
        p_election_id,
        p_position_id,
        v_student_id,
        v_pending_status_id
    ) RETURNING id INTO v_candidate_id;

    INSERT INTO public.candidate_details (
        candidate_id,
        campaign_slogan,
        manifesto,
        photo_path,
        is_profile_complete
    ) VALUES (
        v_candidate_id,
        p_campaign_slogan,
        p_manifesto,
        p_photo_path,
        TRUE
    )
    ON CONFLICT (candidate_id) DO UPDATE
    SET campaign_slogan = EXCLUDED.campaign_slogan,
        manifesto = EXCLUDED.manifesto,
        photo_path = EXCLUDED.photo_path,
        updated_at = now();

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Candidate application submitted successfully.',
        'candidate_id', v_candidate_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_candidate_application TO authenticated;


-- 2. Create resubmit_candidate_application RPC for rejected candidates
CREATE OR REPLACE FUNCTION public.resubmit_candidate_application(
    p_candidate_id UUID,
    p_campaign_slogan TEXT,
    p_manifesto TEXT,
    p_photo_path TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_auth_uid UUID := auth.uid();
    v_student_id UUID;
    v_candidate_record RECORD;
    v_pending_status_id UUID;
    v_election_status VARCHAR(50);
BEGIN
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Check Active Account Status
    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.account_statuses ast ON ast.id = u.account_status_id
        WHERE u.id = v_auth_uid AND LOWER(ast.name) = 'active'
    ) THEN
        RAISE EXCEPTION 'Account is not active.';
    END IF;

    SELECT s.id INTO v_student_id
    FROM public.students s WHERE s.user_id = v_auth_uid;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Student profile not found.';
    END IF;

    SELECT c.*, cs.name as status_name INTO v_candidate_record
    FROM public.candidates c
    JOIN public.candidate_statuses cs ON cs.id = c.candidate_status_id
    WHERE c.id = p_candidate_id;

    IF v_candidate_record.id IS NULL THEN
        RAISE EXCEPTION 'Candidate application not found.';
    END IF;

    IF v_candidate_record.student_id <> v_student_id THEN
        RAISE EXCEPTION 'Unauthorized: You can only edit your own candidacy.';
    END IF;

    IF LOWER(v_candidate_record.status_name) <> 'rejected' THEN
        RAISE EXCEPTION 'Only rejected candidate applications can be edited and resubmitted.';
    END IF;

    -- Verify election is still in Draft or Scheduled
    SELECT es.name INTO v_election_status
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = v_candidate_record.election_id;

    IF v_election_status NOT IN ('Draft', 'Scheduled') THEN
        RAISE EXCEPTION 'Candidate applications are closed for this election.';
    END IF;

    SELECT id INTO v_pending_status_id FROM public.candidate_statuses WHERE name = 'Pending_Approval';
    IF v_pending_status_id IS NULL THEN
        RAISE EXCEPTION 'Candidate status Pending_Approval not found.';
    END IF;

    -- Update status to Pending_Approval and update details
    UPDATE public.candidates
    SET candidate_status_id = v_pending_status_id,
        updated_at = now()
    WHERE id = p_candidate_id;

    INSERT INTO public.candidate_details (
        candidate_id,
        campaign_slogan,
        manifesto,
        photo_path,
        is_profile_complete
    ) VALUES (
        p_candidate_id,
        p_campaign_slogan,
        p_manifesto,
        p_photo_path,
        TRUE
    )
    ON CONFLICT (candidate_id) DO UPDATE
    SET campaign_slogan = EXCLUDED.campaign_slogan,
        manifesto = EXCLUDED.manifesto,
        photo_path = EXCLUDED.photo_path,
        updated_at = now();

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Candidate application resubmitted successfully for review.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.resubmit_candidate_application TO authenticated;
