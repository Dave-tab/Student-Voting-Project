# Supabase Edge Functions — Package 9 Provisioning Architecture

This directory contains the authoritative Supabase Edge Functions for **Package 9: Account & Authentication Backend** (Batches B67 & B68) of the Student Online Voting Platform.

Project Owner & Chief Architect: **David Ayantade Tolulope**

---

## 1. Edge Function Inventory

| Function Name | Batch | Responsibility | Invocation Context | Caller Auth Required? |
| :--- | :--- | :--- | :--- | :--- |
| `student-activation` | B67 | Verifies institutional student identity in `public.institutional_students`, prevents replay/duplicate registration, creates Supabase Auth user via Auth Admin API, provisions `public.users` (Active status) and `public.students` profile, and executes compensating recovery on partial failure. | Public (invoked from `/activate`) | No (Public unauthenticated invocation) |
| `admin-provisioning` | B68 | Trusted administrative account creation. Verifies caller has database-authoritative `super_admin` or `admin` role, validates target role (`super_admin`, `admin`, `administrator`, `electoral_officer`), provisions Auth user and `public.administrators` record. | Privileged (invoked from Admin Portal) | Yes (Bearer JWT required) |

---

## 2. Invariants Enforced

1. **Least-Privilege Client (AVI-08 & Decision 1)**:
   - The React browser client NEVER receives `SUPABASE_SERVICE_ROLE_KEY`.
   - Browser cannot perform `supabase.auth.admin` operations.
2. **Pre-Verification Requirement (Decision 3)**:
   - Student Auth identity is created ONLY AFTER `public.institutional_students` identity verification passes.
3. **Compensating Recovery**:
   - Because Supabase Auth and PostgreSQL application tables are separate boundaries, any failure during `public.users` or `public.students` insertion automatically invokes `supabaseAdmin.auth.admin.deleteUser()` to prevent orphaned auth identities.
4. **No Public Admin Signup (Decision 7)**:
   - `admin-provisioning` strictly requires a valid Bearer token from a database-verified `super_admin` or `admin`.

---

## 3. Deployment Instructions (Owner-Side)

Using the Supabase CLI on your local machine or CI/CD pipeline:

```bash
# 1. Link project (if not already linked)
supabase link --project-ref <your-project-id>

# 2. Deploy student-activation function
supabase functions deploy student-activation --no-verify-jwt

# 3. Deploy admin-provisioning function
supabase functions deploy admin-provisioning
```

*Note: `--no-verify-jwt` is passed to `student-activation` because prospective students activating their account do not have an active session yet. Inside `student-activation`, verification is enforced against `public.institutional_students`.*
