-- Migration: 20260926040000_add_missing_rls_policies.sql
-- Description: Establishes target RLS policies for elections, positions, candidates, and referencing entities,
--              enabling authenticated operations securely and solving "new row violates row-level security policy" errors.

-- 1. academic_sessions Policies
DROP POLICY IF EXISTS academic_sessions_select_policy ON public.academic_sessions;
CREATE POLICY academic_sessions_select_policy ON public.academic_sessions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS academic_sessions_admin_policy ON public.academic_sessions;
CREATE POLICY academic_sessions_admin_policy ON public.academic_sessions
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 2. departments Policies
DROP POLICY IF EXISTS departments_select_policy ON public.departments;
CREATE POLICY departments_select_policy ON public.departments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS departments_admin_policy ON public.departments;
CREATE POLICY departments_admin_policy ON public.departments
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 3. levels Policies
DROP POLICY IF EXISTS levels_select_policy ON public.levels;
CREATE POLICY levels_select_policy ON public.levels
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS levels_admin_policy ON public.levels;
CREATE POLICY levels_admin_policy ON public.levels
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 4. elections Policies
DROP POLICY IF EXISTS elections_select_policy ON public.elections;
CREATE POLICY elections_select_policy ON public.elections
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS elections_admin_policy ON public.elections;
CREATE POLICY elections_admin_policy ON public.elections
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 5. positions Policies
DROP POLICY IF EXISTS positions_select_policy ON public.positions;
CREATE POLICY positions_select_policy ON public.positions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS positions_admin_policy ON public.positions;
CREATE POLICY positions_admin_policy ON public.positions
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 6. candidates Policies
DROP POLICY IF EXISTS candidates_select_policy ON public.candidates;
CREATE POLICY candidates_select_policy ON public.candidates
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS candidates_admin_policy ON public.candidates;
CREATE POLICY candidates_admin_policy ON public.candidates
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 7. candidate_details Policies
DROP POLICY IF EXISTS candidate_details_select_policy ON public.candidate_details;
CREATE POLICY candidate_details_select_policy ON public.candidate_details
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS candidate_details_admin_policy ON public.candidate_details;
CREATE POLICY candidate_details_admin_policy ON public.candidate_details
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 8. student_register Policies
DROP POLICY IF EXISTS student_register_select_policy ON public.student_register;
CREATE POLICY student_register_select_policy ON public.student_register
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS student_register_admin_policy ON public.student_register;
CREATE POLICY student_register_admin_policy ON public.student_register
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 9. election_officer_assignments Policies
DROP POLICY IF EXISTS election_officer_assignments_select_policy ON public.election_officer_assignments;
CREATE POLICY election_officer_assignments_select_policy ON public.election_officer_assignments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS election_officer_assignments_admin_policy ON public.election_officer_assignments;
CREATE POLICY election_officer_assignments_admin_policy ON public.election_officer_assignments
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
