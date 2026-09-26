-- Migration: 20260926030000_fix_users_rls_recursion.sql
-- Description: Replaces self-referential recursive RLS policies on public.users and public.administrators
--              with clean, non-recursive policies backed by a SECURITY DEFINER helper.
-- Invariants: Preserves RLS, self-access (auth.uid() = id), administrative least privilege, zero metadata trust.

-- 1. Create a minimal SECURITY DEFINER helper to check administrative status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.administrators WHERE user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, service_role;

-- 2. Correct public.users SELECT policies
DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS users_admin_select_policy ON public.users;
DROP POLICY IF EXISTS users_select_own_policy ON public.users;

-- Self-access: users can read their own record (for profile and role resolution)
CREATE POLICY users_select_own_policy ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Admin access: verified administrators can read all user records
CREATE POLICY users_admin_select_policy ON public.users
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3. Correct public.administrators policies to prevent mutual or self-recursion
DROP POLICY IF EXISTS administrators_select_policy ON public.administrators;
DROP POLICY IF EXISTS administrators_admin_select_policy ON public.administrators;
DROP POLICY IF EXISTS administrators_self_select_policy ON public.administrators;

-- Self-access: administrators can read their own record
CREATE POLICY administrators_self_select_policy ON public.administrators
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin access: verified administrators can view all administrator records
CREATE POLICY administrators_admin_select_policy ON public.administrators
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
