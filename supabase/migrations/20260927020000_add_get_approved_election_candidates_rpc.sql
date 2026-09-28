-- Migration: 20260927020000_add_get_approved_election_candidates_rpc.sql
-- Description: Adds a controlled SECURITY DEFINER read RPC for approved candidates in an election,
--              joining candidates with student_register to securely expose display names and details
--              without bypassing students table RLS.

CREATE OR REPLACE FUNCTION public.get_approved_election_candidates(p_election_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_auth_uid UUID := auth.uid();
    v_result JSONB;
BEGIN
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', c.id,
        'election_id', c.election_id,
        'position_id', c.position_id,
        'student_id', c.student_id,
        'candidate_status_id', c.candidate_status_id,
        'status', jsonb_build_object('id', cs.id, 'name', cs.name),
        'candidate_details', jsonb_build_object(
            'manifesto', cd.manifesto,
            'campaign_slogan', cd.campaign_slogan,
            'photo_path', cd.photo_path
        ),
        'student', jsonb_build_object(
            'id', s.id,
            'matriculation_number', sr.matriculation_number,
            'matric_number', sr.matriculation_number,
            'full_name', sr.full_name,
            'first_name', split_part(sr.full_name, ' ', 1),
            'last_name', ltrim(substr(sr.full_name, length(split_part(sr.full_name, ' ', 1)) + 1)),
            'department', d.name,
            'level', l.name
        )
    )), '[]'::jsonb) INTO v_result
    FROM public.candidates c
    JOIN public.candidate_statuses cs ON cs.id = c.candidate_status_id
    JOIN public.students s ON s.id = c.student_id
    JOIN public.student_register sr ON sr.election_id = c.election_id AND UPPER(TRIM(sr.matriculation_number)) = UPPER(TRIM(s.matriculation_number))
    LEFT JOIN public.candidate_details cd ON cd.candidate_id = c.id
    LEFT JOIN public.departments d ON d.id = sr.department_id
    LEFT JOIN public.levels l ON l.id = sr.level_id
    WHERE c.election_id = p_election_id
      AND LOWER(cs.name) = 'approved';

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_approved_election_candidates TO authenticated;
