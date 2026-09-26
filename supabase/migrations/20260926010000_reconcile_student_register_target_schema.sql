-- ==============================================================================
-- Migration: 20260926010000_reconcile_student_register_target_schema.sql
-- Package: QA-PREP-03 (Batch B109)
-- Project: Design and Development of a Web-Based Student Online Voting Platform
-- Owner / Chief Architect: David Ayantade Tolulope
--
-- Objective:
-- Reconcile public.student_register table with the approved target architecture:
--   1. Rename admission_year to year_of_admission and set type to INTEGER.
--   2. Drop retired programme_id column and its index.
--   3. Set election_id to NOT NULL.
--   4. Reconcile foreign keys (elections, departments, levels) to ON DELETE RESTRICT.
--   5. Add year check constraint chk_register_year (2000..2100).
--   6. Drop legacy matriculation-only uniqueness (student_register_matriculation_number_unique).
--   7. Add approved composite unique constraint uq_student_register_election_matric (election_id, matriculation_number).
--   8. Ensure supporting indexes exist.
-- ==============================================================================

BEGIN;

-- 1. Rename admission_year to year_of_admission and cast to INTEGER
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'student_register' 
          AND column_name = 'admission_year'
    ) THEN
        ALTER TABLE public.student_register RENAME COLUMN admission_year TO year_of_admission;
    END IF;
END $$;

ALTER TABLE public.student_register 
    ALTER COLUMN year_of_admission TYPE INTEGER;

-- 2. Drop retired programme_id column and index
DROP INDEX IF EXISTS public.student_register_programme_id_idx;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'student_register' 
          AND column_name = 'programme_id'
    ) THEN
        ALTER TABLE public.student_register DROP COLUMN programme_id;
    END IF;
END $$;

-- 3. Set election_id to NOT NULL
ALTER TABLE public.student_register 
    ALTER COLUMN election_id SET NOT NULL;

-- 4. Reconcile foreign keys to ON DELETE RESTRICT
-- 4a. election_id FK
ALTER TABLE public.student_register 
    DROP CONSTRAINT IF EXISTS student_register_election_id_fkey;

ALTER TABLE public.student_register 
    ADD CONSTRAINT student_register_election_id_fkey 
    FOREIGN KEY (election_id) REFERENCES public.elections(id) ON DELETE RESTRICT;

-- 4b. department_id FK
ALTER TABLE public.student_register 
    DROP CONSTRAINT IF EXISTS student_register_department_id_fk;

ALTER TABLE public.student_register 
    ADD CONSTRAINT student_register_department_id_fk 
    FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE RESTRICT;

-- 4c. level_id FK
ALTER TABLE public.student_register 
    DROP CONSTRAINT IF EXISTS student_register_level_id_fk;

ALTER TABLE public.student_register 
    ADD CONSTRAINT student_register_level_id_fk 
    FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE RESTRICT;

-- 5. Restore year range check constraint (2000 to 2100)
ALTER TABLE public.student_register 
    DROP CONSTRAINT IF EXISTS chk_register_year;

ALTER TABLE public.student_register 
    ADD CONSTRAINT chk_register_year 
    CHECK (year_of_admission >= 2000 AND year_of_admission <= 2100);

-- 6. Replace legacy matriculation-only uniqueness with election-scoped composite uniqueness
ALTER TABLE public.student_register 
    DROP CONSTRAINT IF EXISTS student_register_matriculation_number_unique;

DROP INDEX IF EXISTS public.student_register_matriculation_number_unique;

ALTER TABLE public.student_register 
    DROP CONSTRAINT IF EXISTS uq_student_register_election_matric;

ALTER TABLE public.student_register 
    ADD CONSTRAINT uq_student_register_election_matric 
    UNIQUE (election_id, matriculation_number);

-- 7. Ensure supporting indexes
CREATE INDEX IF NOT EXISTS idx_student_register_election_matric 
    ON public.student_register (election_id, matriculation_number);

CREATE INDEX IF NOT EXISTS idx_student_register_lookup 
    ON public.student_register (election_id, LOWER(email), UPPER(matriculation_number));

CREATE INDEX IF NOT EXISTS student_register_department_id_idx 
    ON public.student_register (department_id);

CREATE INDEX IF NOT EXISTS student_register_level_id_idx 
    ON public.student_register (level_id);

COMMIT;
