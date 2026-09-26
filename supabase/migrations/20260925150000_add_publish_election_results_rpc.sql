-- RPC: publish_election_results
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
    v_results_count INTEGER;
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

    -- Enforce Electoral Officer assignment check (OD-12.1)
    IF v_user_role = 'electoral_officer' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.election_officer_assignments
            WHERE election_id = p_election_id AND user_id = v_auth_uid
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Electoral Officer is not assigned to this specific election.';
        END IF;
    ELSIF v_user_role NOT IN ('super_admin', 'admin', 'administrator') THEN
        RAISE EXCEPTION 'Unauthorized: Insufficient privileges to publish election results.';
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

    -- Check results exist
    SELECT COUNT(*) INTO v_results_count
    FROM public.election_results
    WHERE election_id = p_election_id;

    IF v_results_count = 0 THEN
        RAISE EXCEPTION 'No calculated results found for this election. Calculate results prior to publishing.';
    END IF;

    -- Fetch Published election_status_id
    SELECT id INTO v_published_status_id
    FROM public.election_statuses
    WHERE name = 'Published';

    -- Update election_results lifecycle_status to PUBLISHED
    UPDATE public.election_results
    SET lifecycle_status = 'PUBLISHED',
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
