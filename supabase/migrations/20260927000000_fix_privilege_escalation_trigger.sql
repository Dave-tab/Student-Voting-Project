-- Migration: 20260927000000_fix_privilege_escalation_trigger.sql
-- Description: Hardens the privilege escalation prevention trigger to bypass checks when executed by the system or service_role.
--              This prevents transaction aborts when automated system triggers (such as auth email verification) transition a user's status.

CREATE OR REPLACE FUNCTION public.prevent_user_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Allow system/service_role (e.g. system triggers or Edge functions) to perform any updates without restriction
    IF auth.role() = 'service_role' THEN
        RETURN NEW;
    END IF;

    IF (OLD.role_id IS DISTINCT FROM NEW.role_id) OR (OLD.account_status_id IS DISTINCT FROM NEW.account_status_id) THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON r.id = u.role_id
            WHERE u.id = auth.uid() AND LOWER(r.name) IN ('super_admin', 'admin')
        ) THEN
            RAISE EXCEPTION 'Unauthorized attempt to alter role or account status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;
