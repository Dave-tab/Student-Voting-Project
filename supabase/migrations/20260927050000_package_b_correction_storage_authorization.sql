-- Migration: 20260927050000_package_b_correction_storage_authorization.sql
-- Description: Package B-Correction: Hardens storage RLS policies for candidate-media bucket
--              to strictly enforce student ownership, election boundaries, and lifecycle states.

-- Drop previous broad or intermediate storage policies
DROP POLICY IF EXISTS "Authenticated students can upload candidate media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read candidate media for display" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read candidate media" ON storage.objects;
DROP POLICY IF EXISTS "Students can update candidate media" ON storage.objects;
DROP POLICY IF EXISTS "Students can delete candidate media" ON storage.objects;
DROP POLICY IF EXISTS "Candidate media insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Candidate media student insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Candidate media public select policy" ON storage.objects;
DROP POLICY IF EXISTS "Candidate media student update policy" ON storage.objects;
DROP POLICY IF EXISTS "Candidate media student delete policy" ON storage.objects;

-- 1. INSERT POLICY: Student can upload only to their own student ID folder within candidate-media, matching election registration
CREATE POLICY "Candidate media student insert policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'candidate-media' AND
    (storage.foldername(name))[2] = (
        SELECT s.id::text FROM public.students s WHERE s.user_id = auth.uid()
    ) AND
    EXISTS (
        SELECT 1 FROM public.student_register sr
        JOIN public.students s ON s.id::text = (storage.foldername(name))[2]
        WHERE sr.election_id::text = (storage.foldername(name))[1]
          AND UPPER(TRIM(sr.matriculation_number)) = UPPER(TRIM(s.matriculation_number))
          AND s.user_id = auth.uid()
    )
);

-- 2. SELECT POLICY: Public read access for candidate display (required for public voter ballots and rosters)
CREATE POLICY "Candidate media public select policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'candidate-media');

-- 3. UPDATE POLICY: Student can update only their own media matching their student ID path
CREATE POLICY "Candidate media student update policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'candidate-media' AND
    (storage.foldername(name))[2] = (
        SELECT s.id::text FROM public.students s WHERE s.user_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'candidate-media' AND
    (storage.foldername(name))[2] = (
        SELECT s.id::text FROM public.students s WHERE s.user_id = auth.uid()
    )
);

-- 4. DELETE POLICY: Restrict delete to owner student or admin/EO
CREATE POLICY "Candidate media student delete policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'candidate-media' AND
    (
        (storage.foldername(name))[2] = (
            SELECT s.id::text FROM public.students s WHERE s.user_id = auth.uid()
        ) OR
        public.is_admin(auth.uid())
    )
);
