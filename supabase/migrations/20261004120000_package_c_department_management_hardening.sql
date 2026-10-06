-- Migration: 20261004120000_package_c_department_management_hardening.sql
-- Description: Hardens RLS policies on public.departments to restrict INSERT, UPDATE, DELETE operations
--              strictly to Super Admin and System Administrator roles.

-- 1. Drop the previous overly broad admin policy for departments
DROP POLICY IF EXISTS departments_admin_policy ON public.departments;

-- 2. Create select policy (allow all authenticated users to read departments)
DROP POLICY IF EXISTS departments_select_policy ON public.departments;
CREATE POLICY departments_select_policy ON public.departments
  FOR SELECT TO authenticated USING (true);

-- 3. Create write policy for Super Admin and System Administrator only
CREATE POLICY departments_write_policy ON public.departments
  FOR ALL TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.roles r ON r.id = u.role_id
        WHERE u.id = auth.uid() AND LOWER(r.name) IN ('super_admin', 'system_administrator')
    )
  )
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.roles r ON r.id = u.role_id
        WHERE u.id = auth.uid() AND LOWER(r.name) IN ('super_admin', 'system_administrator')
    )
  );
