-- ==============================================================================
-- PACKAGE 12 RECONCILIATION MIGRATION: RESULTS & ADMINISTRATION BACKEND
-- Reconciles B94–B100, ODR-002, and OD-12.1
-- ==============================================================================

-- 1. Hardened calculate_election_results (B94, OD-12.1)
-- Strictly restricted to Electoral Officer assigned to the specific election.
-- Fails if election is not Closed or if already Published.
CREATE OR REPLACE FUNCTION public.calculate_election_results(p_election_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_auth_uid UUID := auth.uid();
    v_user_role VARCHAR(50);
    v_is_assigned BOOLEAN := false;
    v_election_status VARCHAR(50);
    v_pos RECORD;
    v_total_valid INTEGER;
    v_max_votes INTEGER;
    v_top_count INTEGER;
    v_outcome VARCHAR(50);
    v_result_id UUID;
    v_cand RECORD;
    v_cand_json JSONB;
    v_positions_json JSONB := '[]'::jsonb;
    v_pos_item JSONB;
BEGIN
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Query caller role
    SELECT LOWER(r.name) INTO v_user_role
    FROM public.users u
    JOIN public.roles r ON r.id = u.role_id
    WHERE u.id = v_auth_uid;

    IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    -- Check Electoral Officer assignment (OD-12.1)
    SELECT EXISTS (
        SELECT 1 FROM public.election_officer_assignments
        WHERE election_id = p_election_id AND user_id = v_auth_uid
    ) INTO v_is_assigned;

    IF v_user_role != 'electoral_officer' OR NOT v_is_assigned THEN
        RAISE EXCEPTION 'Unauthorized: Only the Electoral Officer assigned to this specific election may calculate results (OD-12.1).';
    END IF;

    -- Check election status
    SELECT es.name INTO v_election_status
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id;

    IF v_election_status IS NULL THEN
        RAISE EXCEPTION 'Election not found.';
    END IF;

    IF v_election_status = 'Published' THEN
        RAISE EXCEPTION 'Published election results are immutable and cannot be recalculated.';
    END IF;

    IF v_election_status NOT IN ('Open', 'Closed') THEN
        RAISE EXCEPTION 'Election results can only be calculated when the election has commenced (Open or Closed status).';
    END IF;

    -- Calculation logic
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

        v_cand_json := '[]'::jsonb;
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

                v_cand_json := v_cand_json || jsonb_build_object(
                    'candidate_id', v_cand.candidate_id,
                    'votes', v_cand.vote_count,
                    'percentage', ROUND((v_cand.vote_count::NUMERIC / v_total_valid::NUMERIC) * 100, 2),
                    'is_winner', (v_outcome = 'WINNER' AND v_cand.vote_count = v_max_votes)
                );
            END LOOP;
        END IF;

        v_pos_item := jsonb_build_object(
            'position_id', v_pos.id,
            'position_name', v_pos.name,
            'total_valid_selections', v_total_valid,
            'status', CASE WHEN v_outcome = 'WINNER' THEN 'Decided' WHEN v_outcome = 'TIED' THEN 'Tied' ELSE 'No Selections' END,
            'winner_candidate_id', (SELECT candidate_id FROM public.election_result_entries WHERE election_result_id = v_result_id AND v_outcome = 'WINNER' ORDER BY vote_count DESC LIMIT 1),
            'candidates', v_cand_json
        );

        v_positions_json := v_positions_json || v_pos_item;
    END LOOP;

    RETURN jsonb_build_object(
        'election_id', p_election_id,
        'calculated_at', now(),
        'positions', v_positions_json
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_election_results TO authenticated;


-- 2. Hardened review_election_results (B96, OD-12.1)
-- Strictly restricted to Electoral Officer assigned to the specific election (NO admin bypass).
-- Persists REVIEWED state, reviewed_at, and reviewed_by.
CREATE OR REPLACE FUNCTION public.review_election_results(p_election_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_auth_uid UUID := auth.uid();
    v_user_role VARCHAR(50);
    v_status_name VARCHAR(50);
    v_is_assigned BOOLEAN := false;
    v_calc_res JSONB;
BEGIN
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Query caller role
    SELECT LOWER(r.name) INTO v_user_role
    FROM public.users u
    JOIN public.roles r ON r.id = u.role_id
    WHERE u.id = v_auth_uid;

    IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    -- Strict assignment check (OD-12.1, Section 9: NO admin bypass)
    SELECT EXISTS (
        SELECT 1 FROM public.election_officer_assignments
        WHERE election_id = p_election_id AND user_id = v_auth_uid
    ) INTO v_is_assigned;

    IF v_user_role != 'electoral_officer' OR NOT v_is_assigned THEN
        RAISE EXCEPTION 'Unauthorized: Only the Electoral Officer assigned to this specific election may review results (OD-12.1).';
    END IF;

    -- Check election status
    SELECT es.name INTO v_status_name
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id;

    IF v_status_name IS NULL THEN
        RAISE EXCEPTION 'Election not found.';
    END IF;

    IF v_status_name NOT IN ('Open', 'Closed', 'Published') THEN
        RAISE EXCEPTION 'Election results can only be reviewed when the election has commenced (Open, Closed, or Published status).';
    END IF;

    -- If in Closed status, calculate/refresh results
    IF v_status_name = 'Closed' THEN
        v_calc_res := public.calculate_election_results(p_election_id);

        -- Persist REVIEWED state in election_results if currently CALCULATED
        UPDATE public.election_results
        SET lifecycle_status = 'REVIEWED',
            reviewed_at = now(),
            reviewed_by = v_auth_uid,
            updated_at = now()
        WHERE election_id = p_election_id AND lifecycle_status = 'CALCULATED';
    ELSE
        -- If already published, retrieve official published results
        v_calc_res := public.get_published_election_results(p_election_id);
    END IF;

    RETURN v_calc_res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_election_results TO authenticated;


-- 3. Hardened publish_election_results (B97, OD-12.1, ODR-002)
-- Strictly restricted to Electoral Officer assigned to the specific election (NO admin bypass).
-- Requires all positions to have lifecycle_status = 'REVIEWED'.
CREATE OR REPLACE FUNCTION public.publish_election_results(p_election_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_auth_uid UUID := auth.uid();
    v_user_role VARCHAR(50);
    v_election_status VARCHAR(50);
    v_published_status_id UUID;
    v_total_positions INTEGER;
    v_reviewed_positions INTEGER;
    v_is_assigned BOOLEAN := false;
BEGIN
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Query caller role
    SELECT LOWER(r.name) INTO v_user_role
    FROM public.users u
    JOIN public.roles r ON r.id = u.role_id
    WHERE u.id = v_auth_uid;

    IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    -- Enforce Electoral Officer assignment check strictly (OD-12.1, Section 11: NO admin bypass)
    SELECT EXISTS (
        SELECT 1 FROM public.election_officer_assignments
        WHERE election_id = p_election_id AND user_id = v_auth_uid
    ) INTO v_is_assigned;

    IF v_user_role != 'electoral_officer' OR NOT v_is_assigned THEN
        RAISE EXCEPTION 'Unauthorized: Only the Electoral Officer assigned to this specific election may publish official election results (OD-12.1).';
    END IF;

    -- Check election status
    SELECT es.name INTO v_election_status
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id;

    IF v_election_status IS NULL THEN
        RAISE EXCEPTION 'Election not found.';
    END IF;

    IF v_election_status = 'Published' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Election results are already published.');
    END IF;

    IF v_election_status != 'Closed' THEN
        RAISE EXCEPTION 'Election results can only be published when the election is in Closed status.';
    END IF;

    -- Enforce REVIEWED prerequisite (ODR-002, B97)
    SELECT COUNT(*) INTO v_total_positions
    FROM public.positions
    WHERE election_id = p_election_id;

    IF v_total_positions = 0 THEN
        RAISE EXCEPTION 'No positions found for this election.';
    END IF;

    SELECT COUNT(*) INTO v_reviewed_positions
    FROM public.election_results
    WHERE election_id = p_election_id AND lifecycle_status = 'REVIEWED';

    IF v_reviewed_positions < v_total_positions THEN
        RAISE EXCEPTION 'Unauthorized or Incomplete: All election results must be reviewed by the assigned Electoral Officer prior to publication (ODR-002).';
    END IF;

    -- Fetch Published election_status_id
    SELECT id INTO v_published_status_id
    FROM public.election_statuses
    WHERE name = 'Published';

    -- Atomic transition: Update election_results lifecycle_status to PUBLISHED
    UPDATE public.election_results
    SET lifecycle_status = 'PUBLISHED',
        published_at = now(),
        published_by = v_auth_uid,
        updated_at = now()
    WHERE election_id = p_election_id;

    -- Transition election status to Published
    UPDATE public.elections
    SET election_status_id = v_published_status_id,
        updated_at = now()
    WHERE id = p_election_id;

    RETURN jsonb_build_object('success', true, 'message', 'Election results successfully published and finalized as official.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_election_results TO authenticated;


-- 4. Read-Only get_published_election_results RPC (B98)
-- Accessible to public and students to view official published results without triggering privileged calculation.
CREATE OR REPLACE FUNCTION public.get_published_election_results(p_election_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_election_status VARCHAR(50);
    v_published_at TIMESTAMPTZ;
    v_positions_json JSONB := '[]'::jsonb;
    v_pos RECORD;
    v_cand_json JSONB;
    v_cand RECORD;
    v_total_valid INTEGER;
    v_winner_id UUID;
    v_result RECORD;
BEGIN
    SELECT es.name INTO v_election_status
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id;

    IF v_election_status IS NULL THEN
        RAISE EXCEPTION 'Election not found.';
    END IF;

    IF v_election_status != 'Published' THEN
        RAISE EXCEPTION 'Official results are not yet published for this election.';
    END IF;

    SELECT MAX(published_at) INTO v_published_at
    FROM public.election_results
    WHERE election_id = p_election_id AND lifecycle_status = 'PUBLISHED';

    FOR v_pos IN SELECT id, name FROM public.positions WHERE election_id = p_election_id
    LOOP
        SELECT * INTO v_result
        FROM public.election_results
        WHERE election_id = p_election_id AND position_id = v_pos.id AND lifecycle_status = 'PUBLISHED';

        v_cand_json := '[]'::jsonb;
        v_total_valid := 0;
        v_winner_id := NULL;

        IF v_result.id IS NOT NULL THEN
            SELECT COALESCE(SUM(vote_count), 0) INTO v_total_valid
            FROM public.election_result_entries
            WHERE election_result_id = v_result.id;

            IF v_result.outcome_status = 'WINNER' THEN
                SELECT candidate_id INTO v_winner_id
                FROM public.election_result_entries
                WHERE election_result_id = v_result.id
                ORDER BY vote_count DESC, candidate_id ASC
                LIMIT 1;
            END IF;

            FOR v_cand IN
                SELECT candidate_id, vote_count, vote_percentage
                FROM public.election_result_entries
                WHERE election_result_id = v_result.id
                ORDER BY vote_count DESC, candidate_id ASC
            LOOP
                v_cand_json := v_cand_json || jsonb_build_object(
                    'candidate_id', v_cand.candidate_id,
                    'votes', v_cand.vote_count,
                    'percentage', v_cand.vote_percentage,
                    'is_winner', (v_result.outcome_status = 'WINNER' AND v_cand.candidate_id = v_winner_id)
                );
            END LOOP;
        END IF;

        v_positions_json := v_positions_json || jsonb_build_object(
            'position_id', v_pos.id,
            'position_name', v_pos.name,
            'total_valid_selections', v_total_valid,
            'status', CASE WHEN v_result.outcome_status = 'WINNER' THEN 'Decided' WHEN v_result.outcome_status = 'TIED' THEN 'Tied' ELSE 'No Selections' END,
            'winner_candidate_id', v_winner_id,
            'candidates', v_cand_json
        );
    END LOOP;

    RETURN jsonb_build_object(
        'election_id', p_election_id,
        'calculated_at', v_published_at,
        'positions', v_positions_json
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_election_results TO anon, authenticated;

-- 5. RLS Policies on election_results and entries for published state
GRANT SELECT ON public.election_results TO anon, authenticated;
GRANT SELECT ON public.election_result_entries TO anon, authenticated;

DROP POLICY IF EXISTS election_results_select_published ON public.election_results;
CREATE POLICY election_results_select_published ON public.election_results
FOR SELECT TO anon, authenticated
USING (lifecycle_status = 'PUBLISHED');

DROP POLICY IF EXISTS election_result_entries_select_published ON public.election_result_entries;
CREATE POLICY election_result_entries_select_published ON public.election_result_entries
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.election_results er
        WHERE er.id = election_result_id AND er.lifecycle_status = 'PUBLISHED'
    )
);
