-- Migration: 20260927010000_add_submit_candidate_application_rpc.sql
-- Description: Adds a secure server-side RPC for student candidate applications.
--              Enforces identity, election registration, and election status rules.

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

    -- 2. Resolve Student Identity
    SELECT s.id, s.matriculation_number INTO v_student_id, v_matric_number
    FROM public.students s WHERE s.user_id = v_auth_uid;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Student profile not found.';
    END IF;

    -- 3. Verify Election Existence and Status
    -- Note: Applications allowed only in Draft or Scheduled states.
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
    -- Insert core candidacy
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

    -- Insert extended candidate details
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
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Candidate application submitted successfully.',
        'candidate_id', v_candidate_id
    );
END;
$$;

-- Grant execution permission to authenticated students
GRANT EXECUTE ON FUNCTION public.submit_candidate_application TO authenticated;
