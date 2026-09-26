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
    v_seen_positions UUID[] := ARRAY[]::UUID[];
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

    -- Validate selections, position duplicates, and self-voting prohibition
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_selections)
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
