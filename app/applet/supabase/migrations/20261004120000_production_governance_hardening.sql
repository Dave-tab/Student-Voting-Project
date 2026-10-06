-- ==============================================================================
-- Production Governance & Candidate Integrity Hardening Migration
-- Project: Student Online Voting Platform
-- Owner / Chief Architect: David Ayantade Tolulope
-- ==============================================================================

-- 1. Add department_id to elections table
ALTER TABLE public.elections
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- 2. Seed standard departments
INSERT INTO public.departments (id, name) VALUES
  ('66385a43-3c59-4514-94c4-2859955d5667', 'Computer Science'),
  ('a1b2c3d4-e5f6-7890-abcd-ef0123456789', 'Business Administration'),
  ('b2c3d4e5-f6a7-8901-bcde-f0123456789a', 'Accounting'),
  ('c3d4e5f6-a7b8-9012-cdef-0123456789ab', 'Electrical Engineering'),
  ('d4e5f6a7-b8c9-0123-def0-123456789abc', 'Mechanical Engineering'),
  ('e5f6a7b8-c9d0-1234-ef01-23456789abcd', 'Mass Communication'),
  ('f6a7b8c9-d0e1-2345-f012-3456789abcde', 'Public Administration'),
  ('a7b8c9d0-e1f2-3456-0123-456789abcdef', 'Marketing'),
  ('b8c9d0e1-f2a3-4678-1234-56789abcdef0', 'Banking and Finance')
ON CONFLICT (id) DO NOTHING;

-- Ensure any existing elections without department_id get Computer Science
UPDATE public.elections
SET department_id = '66385a43-3c59-4514-94c4-2859955d5667'
WHERE department_id IS NULL;

-- 3. Enforce Candidate Application Freeze Trigger once election is OPEN or beyond
CREATE OR REPLACE FUNCTION public.enforce_candidate_freeze()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_election_id UUID;
    v_status_name VARCHAR(50);
BEGIN
    IF TG_TABLE_NAME = 'candidates' THEN
        v_election_id := NEW.election_id;
    ELSIF TG_TABLE_NAME = 'candidate_details' THEN
        SELECT election_id INTO v_election_id FROM public.candidates WHERE id = NEW.candidate_id;
    END IF;

    IF v_election_id IS NOT NULL THEN
        SELECT es.name INTO v_status_name
        FROM public.elections e
        JOIN public.election_statuses es ON es.id = e.election_status_id
        WHERE e.id = v_election_id;

        IF v_status_name IS NOT NULL AND LOWER(v_status_name) NOT IN ('draft', 'scheduled', 'upcoming', 'planning') THEN
            RAISE EXCEPTION 'Candidate applications and modifications are permanently frozen once an election is open.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_candidate_freeze_candidates ON public.candidates;
CREATE TRIGGER trg_enforce_candidate_freeze_candidates
    BEFORE INSERT OR UPDATE ON public.candidates
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_candidate_freeze();

DROP TRIGGER IF EXISTS trg_enforce_candidate_freeze_details ON public.candidate_details;
CREATE TRIGGER trg_enforce_candidate_freeze_details
    BEFORE INSERT OR UPDATE ON public.candidate_details
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_candidate_freeze();
