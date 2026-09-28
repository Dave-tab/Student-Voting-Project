-- Migration: 20260927040000_package_b_candidate_media_hardening.sql
-- Description: Package B Media Hardening: Creates/configures the secure 'candidate-media' storage bucket
--              with strict MIME type constraints (JPEG, PNG, WEBP), 5MB size limit, and robust RLS storage policies.

-- 1. Ensure storage bucket 'candidate-media' exists and is configured securely
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'candidate-media',
    'candidate-media',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage RLS Policies for candidate-media bucket
DROP POLICY IF EXISTS "Authenticated students can upload candidate media" ON storage.objects;
CREATE POLICY "Authenticated students can upload candidate media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'candidate-media' AND
    auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Anyone can read candidate media for display" ON storage.objects;
CREATE POLICY "Anyone can read candidate media for display" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'candidate-media');

DROP POLICY IF EXISTS "Authenticated users can read candidate media" ON storage.objects;
CREATE POLICY "Authenticated users can read candidate media" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'candidate-media');

DROP POLICY IF EXISTS "Students can update candidate media" ON storage.objects;
CREATE POLICY "Students can update candidate media" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'candidate-media');

DROP POLICY IF EXISTS "Students can delete candidate media" ON storage.objects;
CREATE POLICY "Students can delete candidate media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'candidate-media');
