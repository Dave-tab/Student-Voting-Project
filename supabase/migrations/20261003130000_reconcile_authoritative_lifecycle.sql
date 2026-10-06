-- ==============================================================================
-- MIGRATION: 20261003130000_reconcile_authoritative_lifecycle.sql
-- Package: Authoritative Election Lifecycle, Ballot Submission & Automatic Results
-- Project Owner & Chief Architect: David Ayantade Tolulope
-- ==============================================================================

-- 1. Ensure 'Results Available' and 'Results Pending' exist in public.election_statuses
INSERT INTO public.election_statuses (name) 
VALUES 
    ('Results Pending'),
    ('Results Available')
ON CONFLICT (name) DO NOTHING;

-- Relax constraint on election_results.lifecycle_status to allow 'RESULTS_AVAILABLE'
ALTER TABLE public.election_results DROP CONSTRAINT IF EXISTS election_results_lifecycle_status_check;
ALTER TABLE public.election_results ADD CONSTRAINT election_results_lifecycle_status_check 
  CHECK (lifecycle_status IN ('CALCULATED', 'REVIEWED', 'PUBLISHED', 'RESULTS_AVAILABLE'));

-- 2. Authoritative Database Function: check_and_advance_election_lifecycle
-- Checks persisted timestamps against database now() and transitions election safely with row-lock.
CREATE OR REPLACE FUNCTION public.check_and_advance_election_lifecycle(p_election_id UUID)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_election RECORD;
    v_current_status VARCHAR(50);
    v_open_status_id UUID;
    v_pending_status_id UUID;
    v_available_status_id UUID;
    v_now TIMESTAMPTZ := now();
    v_calc_res JSONB;
BEGIN
    -- Row-lock the election row for concurrency safety
    SELECT e.*, es.name AS status_name
    INTO v_election
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id
    FOR UPDATE OF e;

    IF v_election.id IS NULL THEN
        RETURN NULL;
    END IF;

    v_current_status := v_election.status_name;

    -- Fetch status UUIDs
    SELECT id INTO v_open_status_id FROM public.election_statuses WHERE name = 'Open';
    SELECT id INTO v_pending_status_id FROM public.election_statuses WHERE name = 'Results Pending';
    SELECT id INTO v_available_status_id FROM public.election_statuses WHERE name = 'Results Available';

    -- Case A: Scheduled and start reached, before end time -> transition Scheduled to Open
    IF v_current_status = 'Scheduled' AND v_now >= v_election.start_datetime AND v_now <= v_election.end_datetime THEN
        UPDATE public.elections
        SET election_status_id = v_open_status_id,
            updated_at = v_now
        WHERE id = p_election_id;
        v_current_status := 'Open';

    -- Case B: Scheduled or Open, and end time has passed -> transition to Results Pending & auto-calculate
    ELSIF v_current_status IN ('Scheduled', 'Open') AND v_now > v_election.end_datetime THEN
        UPDATE public.elections
        SET election_status_id = v_pending_status_id,
            updated_at = v_now
        WHERE id = p_election_id;
        v_current_status := 'Results Pending';

        -- Trigger authoritative calculation immediately
        BEGIN
            v_calc_res := public.calculate_election_results(p_election_id);
            v_current_status := 'Results Available';
        EXCEPTION WHEN OTHERS THEN
            -- If calculation encounters an issue, remains in Results Pending
            RAISE WARNING 'Auto-calculation failed for election %: %', p_election_id, SQLERRM;
        END;

    -- Case C: Already Results Pending -> attempt calculation to advance to Results Available
    ELSIF v_current_status = 'Results Pending' THEN
        BEGIN
            v_calc_res := public.calculate_election_results(p_election_id);
            v_current_status := 'Results Available';
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Calculation retry failed for election %: %', p_election_id, SQLERRM;
        END;
    END IF;

    RETURN v_current_status;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_advance_election_lifecycle TO anon, authenticated;

-- 3. Authoritative calculate_election_results (Election-scoped, deterministic, sets RESULTS_AVAILABLE)
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
    v_cand_json JSONB;
    v_positions_json JSONB := '[]'::jsonb;
    v_pos_item JSONB;
    v_available_status_id UUID;
BEGIN
    SELECT id INTO v_available_status_id 
    FROM public.election_statuses 
    WHERE name = 'Results Available';

    -- Calculate results position by position strictly for this election
    FOR v_pos IN 
        SELECT id, name 
        FROM public.positions 
        WHERE election_id = p_election_id
        ORDER BY created_at ASC, id ASC
    LOOP
        -- Total valid selections strictly scoped to this election and position
        SELECT COUNT(*) INTO v_total_valid
        FROM public.ballot_selections
        WHERE election_id = p_election_id AND position_id = v_pos.id;

        IF v_total_valid = 0 THEN
            v_outcome := 'NO_VALID_SELECTION';
            v_max_votes := 0;
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

        -- Persist election result record
        INSERT INTO public.election_results (
            election_id, position_id, lifecycle_status, outcome_status, calculated_at
        ) VALUES (
            p_election_id, v_pos.id, 'RESULTS_AVAILABLE', v_outcome, now()
        )
        ON CONFLICT (election_id, position_id) DO UPDATE
        SET lifecycle_status = 'RESULTS_AVAILABLE',
            outcome_status = v_outcome,
            calculated_at = now(),
            updated_at = now()
        RETURNING id INTO v_result_id;

        -- Clean and repopulate entries for this result
        DELETE FROM public.election_result_entries WHERE election_result_id = v_result_id;

        v_cand_json := '[]'::jsonb;
        IF v_total_valid > 0 THEN
            FOR v_cand IN 
                SELECT c.id AS candidate_id, COALESCE(COUNT(bs.id), 0) AS vote_count
                FROM public.candidates c
                LEFT JOIN public.ballot_selections bs 
                    ON bs.candidate_id = c.id 
                    AND bs.position_id = v_pos.id 
                    AND bs.election_id = p_election_id
                WHERE c.position_id = v_pos.id 
                  AND c.election_id = p_election_id
                GROUP BY c.id
                ORDER BY vote_count DESC, c.id ASC
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
        ELSE
            -- No votes cast yet for this position, list approved candidates with 0 votes
            FOR v_cand IN 
                SELECT c.id AS candidate_id 
                FROM public.candidates c
                WHERE c.position_id = v_pos.id 
                  AND c.election_id = p_election_id
                ORDER BY c.id ASC
            LOOP
                INSERT INTO public.election_result_entries (
                    election_result_id, candidate_id, vote_count, vote_percentage
                ) VALUES (
                    v_result_id,
                    v_cand.candidate_id,
                    0,
                    0.00
                );

                v_cand_json := v_cand_json || jsonb_build_object(
                    'candidate_id', v_cand.candidate_id,
                    'votes', 0,
                    'percentage', 0.00,
                    'is_winner', false
                );
            END LOOP;
        END IF;

        v_pos_item := jsonb_build_object(
            'position_id', v_pos.id,
            'position_name', v_pos.name,
            'total_valid_selections', v_total_valid,
            'status', CASE WHEN v_outcome = 'WINNER' THEN 'Decided' WHEN v_outcome = 'TIED' THEN 'Tied' ELSE 'No Selections' END,
            'winner_candidate_id', CASE WHEN v_outcome = 'WINNER' THEN (SELECT candidate_id FROM public.election_result_entries WHERE election_result_id = v_result_id ORDER BY vote_count DESC LIMIT 1) ELSE NULL END,
            'candidates', v_cand_json
        );

        v_positions_json := v_positions_json || v_pos_item;
    END LOOP;

    -- Advance election status to Results Available if configured
    IF v_available_status_id IS NOT NULL THEN
        UPDATE public.elections
        SET election_status_id = v_available_status_id,
            updated_at = now()
        WHERE id = p_election_id;
    END IF;

    RETURN jsonb_build_object(
        'election_id', p_election_id,
        'calculated_at', now(),
        'positions', v_positions_json
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_election_results TO anon, authenticated;

-- 4. Authoritative submit_ballot with upfront lifecycle reconciliation
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
    v_normalized_selections JSONB := '[]'::JSONB;
    v_item JSONB;
    v_key TEXT;
    v_val TEXT;
    v_pos_id UUID;
    v_cand_id UUID;
    v_cand_record RECORD;
    v_seen_positions UUID[] := ARRAY[]::UUID[];
BEGIN
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Step 1: Upfront authoritative lifecycle reconciliation
    PERFORM public.check_and_advance_election_lifecycle(p_election_id);

    -- Step 2: Normalize selections if passed as an object {pos_id: cand_id} or array
    IF jsonb_typeof(p_selections) = 'object' THEN
        FOR v_key, v_val IN SELECT key, value#>>'{}' FROM jsonb_each(p_selections)
        LOOP
            IF v_val IS NOT NULL AND v_val != '' THEN
                v_normalized_selections := v_normalized_selections || jsonb_build_object('position_id', v_key, 'candidate_id', v_val);
            END IF;
        END LOOP;
    ELSIF jsonb_typeof(p_selections) = 'array' THEN
        v_normalized_selections := p_selections;
    ELSE
        v_normalized_selections := '[]'::JSONB;
    END IF;

    -- Step 3: Verify student identity
    SELECT s.id, s.matriculation_number INTO v_student_id, v_matric_number
    FROM public.students s WHERE s.user_id = v_auth_uid;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Student profile not found.';
    END IF;

    -- Step 4: Verify authoritative election state
    SELECT es.name, e.start_datetime, e.end_datetime 
    INTO v_election_status, v_start_time, v_end_time
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id;

    IF v_election_status IS NULL OR v_election_status != 'Open' OR now() < v_start_time OR now() > v_end_time THEN
        RAISE EXCEPTION 'Election is not open for voting.';
    END IF;

    -- Step 5: Verify voter registration
    IF NOT EXISTS (
        SELECT 1 FROM public.student_register sr
        WHERE sr.election_id = p_election_id
        AND UPPER(TRIM(sr.matriculation_number)) = UPPER(TRIM(v_matric_number))
    ) THEN
        RAISE EXCEPTION 'Student is not registered for this election.';
    END IF;

    -- Step 6: Verify single participation
    IF EXISTS (
        SELECT 1 FROM public.voter_participation vp
        WHERE vp.election_id = p_election_id AND vp.student_id = v_student_id
    ) THEN
        RAISE EXCEPTION 'Already Voted: You have already submitted a ballot for this election.';
    END IF;

    -- Step 7: Validate selections, duplicate positions, and self-voting
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_normalized_selections)
    LOOP
        v_pos_id := (v_item->>'position_id')::UUID;
        v_cand_id := (v_item->>'candidate_id')::UUID;

        IF v_pos_id IS NOT NULL THEN
            IF v_pos_id = ANY(v_seen_positions) THEN
                RAISE EXCEPTION 'Duplicate selection for the same elective position is prohibited.';
            END IF;
            v_seen_positions := array_append(v_seen_positions, v_pos_id);
        END IF;

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

    -- Step 8: Atomic persistence (Preserve anonymous separation)
    INSERT INTO public.voter_participation (election_id, student_id, participated_at)
    VALUES (p_election_id, v_student_id, now());

    FOR v_item IN SELECT * FROM jsonb_array_elements(v_normalized_selections)
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

-- 5. Authoritative get_published_election_results (supports Results Available & Published)
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
    -- Reconcile lifecycle first
    PERFORM public.check_and_advance_election_lifecycle(p_election_id);

    SELECT es.name INTO v_election_status
    FROM public.elections e
    JOIN public.election_statuses es ON es.id = e.election_status_id
    WHERE e.id = p_election_id;

    IF v_election_status IS NULL THEN
        RAISE EXCEPTION 'Election not found.';
    END IF;

    IF v_election_status NOT IN ('Results Available', 'Published') THEN
        IF v_election_status = 'Results Pending' THEN
            RAISE EXCEPTION 'Results are currently being calculated.';
        ELSE
            RAISE EXCEPTION 'Official results are not available until voting concludes.';
        END IF;
    END IF;

    SELECT MAX(calculated_at) INTO v_published_at
    FROM public.election_results
    WHERE election_id = p_election_id 
      AND lifecycle_status IN ('RESULTS_AVAILABLE', 'PUBLISHED');

    FOR v_pos IN 
        SELECT id, name 
        FROM public.positions 
        WHERE election_id = p_election_id
        ORDER BY created_at ASC, id ASC
    LOOP
        SELECT * INTO v_result
        FROM public.election_results
        WHERE election_id = p_election_id 
          AND position_id = v_pos.id 
          AND lifecycle_status IN ('RESULTS_AVAILABLE', 'PUBLISHED');

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

-- 6. Secure and retire obsolete publish_election_results
CREATE OR REPLACE FUNCTION public.publish_election_results(p_election_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- No-op with informative message: publication is now automatic upon election conclusion
    PERFORM public.check_and_advance_election_lifecycle(p_election_id);
    RETURN jsonb_build_object('success', true, 'message', 'Results publication is automatic under the approved lifecycle.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_election_results TO authenticated;

-- 7. Update RLS policies to permit viewing of 'RESULTS_AVAILABLE'
DROP POLICY IF EXISTS election_results_select_published ON public.election_results;
CREATE POLICY election_results_select_published ON public.election_results
FOR SELECT TO anon, authenticated
USING (lifecycle_status IN ('RESULTS_AVAILABLE', 'PUBLISHED'));

DROP POLICY IF EXISTS election_result_entries_select_published ON public.election_result_entries;
CREATE POLICY election_result_entries_select_published ON public.election_result_entries
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.election_results er
        WHERE er.id = election_result_id 
          AND er.lifecycle_status IN ('RESULTS_AVAILABLE', 'PUBLISHED')
    )
);
