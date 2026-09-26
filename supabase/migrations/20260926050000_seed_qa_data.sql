-- Migration: 20260926050000_seed_qa_data.sql
-- Description: Seeds Lookup, Department, Level, Election, and Student Register data for verification tests

-- Seed Academic Session
INSERT INTO public.academic_sessions (name) 
VALUES ('2025/2026') 
ON CONFLICT (name) DO NOTHING;

-- Seed Department
INSERT INTO public.departments (name) 
VALUES ('Computer Science') 
ON CONFLICT (name) DO NOTHING;

-- Seed Level
INSERT INTO public.levels (name) 
VALUES ('ND I') 
ON CONFLICT (name) DO NOTHING;

-- Declare variables to hold IDs and execute transactional logic
DO $$
DECLARE
    v_session_id UUID;
    v_status_id UUID;
    v_dept_id UUID;
    v_level_id UUID;
    v_election_id UUID;
BEGIN
    SELECT id INTO v_session_id FROM public.academic_sessions WHERE name = '2025/2026';
    SELECT id INTO v_status_id FROM public.election_statuses WHERE name = 'Draft';
    SELECT id INTO v_dept_id FROM public.departments WHERE name = 'Computer Science';
    SELECT id INTO v_level_id FROM public.levels WHERE name = 'ND I';

    -- Seed Election if not exists
    SELECT id INTO v_election_id FROM public.elections WHERE name = 'QA Election One';
    IF v_election_id IS NULL THEN
        INSERT INTO public.elections (name, start_datetime, end_datetime, election_status_id, academic_session_id)
        VALUES ('QA Election One', now(), now() + interval '7 days', v_status_id, v_session_id)
        RETURNING id INTO v_election_id;
    END IF;

    -- Seed Student Register for sundayifeoluwarichard@gmail.com
    INSERT INTO public.student_register (election_id, matriculation_number, email, full_name, department_id, level_id, year_of_admission)
    VALUES (
        v_election_id, 
        '2019235020403', 
        'sundayifeoluwarichard@gmail.com', 
        'Sunday Ifeoluwa Richard', 
        v_dept_id, 
        v_level_id, 
        2025
    )
    ON CONFLICT (election_id, matriculation_number) DO NOTHING;
END $$;
