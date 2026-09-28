-- Migration: 20260927060000_package_b_correction_2_publication_boundary.sql
-- Description: Package B-Correction 2: Enforces strict publication boundary on candidate-media storage objects.
--              Unpublished (Pending_Approval and Rejected) candidate photos are denied for unauthenticated / unauthorized requests.
--              Approved candidate photos are publicly retrievable for voter display.

-- 1. Ensure bucket exists and is configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'candidate-media',
    'candidate-media',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Drop existing SELECT policies on candidate-media to replace with strict boundary rules
DROP POLICY IF EXISTS "Candidate media public select policy" ON storage.objects;
DROP POLICY IF EXISTS "Public read for approved candidate media" ON storage.objects;
DROP POLICY IF EXISTS "Student owner read candidate media" ON storage.objects;
DROP POLICY IF EXISTS "EO read candidate media for assigned election" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to candidate media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on candidate-media" ON storage.objects;

-- 3. Create strict SELECT policies

-- A. Public read ONLY for Approved candidates (path structure: {election_id}/{student_id}/{filename})
CREATE POLICY "Public read approved candidate media only"
ON storage.objects FOR SELECT
TO public
USING (
    bucket_id = 'candidate-media'
    AND EXISTS (
        SELECT 1 FROM public.candidates c
        JOIN public.candidate_statuses cs ON cs.id = c.candidate_status_id
        JOIN public.students s ON s.id = c.student_id
        WHERE c.election_id::text = (storage.foldername(name))[1]
          AND s.id::text = (storage.foldername(name))[2]
          AND LOWER(cs.name) = 'approved'
    )
);

-- B. Authenticated student owner read (can read their own pending/rejected/approved media)
CREATE POLICY "Student owner read own candidate media"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'candidate-media'
    AND EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.user_id = auth.uid()
          AND s.id::text = (storage.foldername(name))[2]
    )
);

-- C. Assigned Electoral Officer read for assigned election
CREATE POLICY "Assigned EO read election candidate media"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'candidate-media'
    AND EXISTS (
        SELECT 1 FROM public.election_officer_assignments eoa
        WHERE eoa.user_id = auth.uid()
          AND eoa.election_id::text = (storage.foldername(name))[1]
    )
);
