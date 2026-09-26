# Package 8 — Batch B64: Database Security & Access Foundation Review

**Date**: 23 September 2026  
**Status**: VERIFIED & DOCUMENTED  
**Authoritative Invariants**: AVI-01 through AVI-12, DB-001 through DB-006, ODR-001, ODR-003  

---

## 1. RLS Inventory & Table Access Controls

| Table | RLS Status | Anon Access | Authenticated Access | Service Role | Notes / Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public.users` | **ENABLED** | No direct access | Filtered to own user ID (`auth.uid() = id`) | Full access | Profile & role mapping |
| `public.roles` | **ENABLED** | Read lookup only | Read lookup only | Full access | Fixed system roles |
| `public.administrators` | **ENABLED** | No direct access | Admin role only | Full access | Administrative officers |
| `public.students` | **ENABLED** | No direct access | Filtered to own student record (`user_id = auth.uid()`) | Full access | Student identity boundary |
| `public.student_register` | **ENABLED** | Filtered / No access | Filtered to own matriculation number | Full access | Election-specific voter eligibility |
| `public.academic_sessions`| **ENABLED** | Read lookup only | Read lookup only | Full access | Academic session lookup |
| `public.departments` | **ENABLED** | Read lookup only | Read lookup only | Full access | Department lookup |
| `public.programmes` | **ENABLED** | Read lookup only | Read lookup only | Full access | Programme lookup |
| `public.levels` | **ENABLED** | Read lookup only | Read lookup only | Full access | Level lookup |
| `public.elections` | **ENABLED** | Read published/open | Read published/open; Admin manage | Full access | Lifecycle gated |
| `public.election_statuses`| **ENABLED** | Read lookup only | Read lookup only | Full access | Status lookup |
| `public.positions` | **ENABLED** | Read for election | Read for election; Admin manage | Full access | Elective positions |
| `public.candidates` | **ENABLED** | Read Approved only | Read Approved only; Admin manage | Full access | Candidate registry |
| `public.candidate_details`| **ENABLED** | Read Approved only | Read Approved only; Admin manage | Full access | Profile extension |
| `public.candidate_statuses`| **ENABLED** | Read lookup only | Read lookup only | Full access | Status lookup |
| `public.voter_participation`| **ENABLED** | **REVOKED (401)** | SELECT own turnout (`student_id = own`); **DIRECT WRITE REVOKED** | Full access | Turnout tracking (identity-bearing) |
| `public.ballot_selections`| **ENABLED** | **REVOKED (401)** | **ALL DIRECT ACCESS REVOKED (401)** | Full access | Anonymous choices (zero voter link) |
| `public.audit_logs` | **ENABLED** | No direct access | Insert own audit trail / Admin read | Full access | System audit log |

---

## 2. Table Grants & Direct Write Prohibition

Empirical probing confirmed the following least-privilege enforcement (AVI-08):
- `public.ballot_selections`:
  - `anon`: ALL privileges REVOKED.
  - `authenticated`: ALL privileges REVOKED.
  - `public`: ALL privileges REVOKED.
  - Direct read and direct write are completely blocked.
- `public.voter_participation`:
  - `anon`: ALL privileges REVOKED.
  - `authenticated`: SELECT granted only under RLS policy. Direct INSERT, UPDATE, DELETE are REVOKED.
  - Mutations are permitted exclusively through the authoritative `submit_ballot` RPC.

---

## 3. SECURITY DEFINER RPC Audit

### `submit_ballot(p_election_id UUID, p_selections JSONB)`
- **Security Mode**: `SECURITY DEFINER`
- **Execution Privileges**:
  - `REVOKE ALL FROM public, anon;`
  - `GRANT EXECUTE TO authenticated;`
- **Search Path**: Explicitly hardened with `SET search_path = public, pg_temp;` (prevents path hijacking).
- **Identity Derivation**: Uses server-side `auth.uid()`. Does not accept caller-supplied voter or student identifiers.
- **Enforced Invariants**:
  - **AVI-03 / AVI-04**: Validates student registration in `student_register` and verifies election is `'Open'`/`'Active'` within start/end datetime.
  - **AVI-05**: Prevents multiple voting participation via `voter_participation` check and unique constraint.
  - **ODR-003**: Enforces self-voting prohibition during identity-aware validation before persistence.
  - **AVI-06**: Atomic commit across `voter_participation` and `ballot_selections`.
  - **AVI-01 / AVI-02**: Zero voter identity or persistent ballot identifiers stored in `ballot_selections`.

### `calculate_election_results(p_election_id UUID)`
- **Security Mode**: `SECURITY DEFINER`
- **Execution Privileges**:
  - `REVOKE ALL FROM public, anon;`
  - `GRANT EXECUTE TO authenticated, service_role;`
- **Search Path**: Explicitly hardened with `SET search_path = public, pg_temp;`.
- **Authorization Guard**: Requires `service_role` or user with administrative role (`admin`, `administrator`, `super_admin`, `electoral_officer`).
- **Lifecycle Guard**: Blocks result calculation while voting window is open.
- **Aggregation Boundary (AVI-07)**: Aggregates purely from anonymous `ballot_selections`.

---

## 4. Open / Deferred Architectural Items

### Electoral Officer Election Assignment Model
- **Status**: **OPEN / DEFERRED ARCHITECTURAL ITEM**
- **Existing Requirement**: Architecture establishes that Electoral Officers possess election-specific operational authority.
- **Current Database State**: No table (e.g. `election_officer_assignments`) exists in the database.
- **Governance Action**: Per Package 8 governance, this physical schema was **NOT** fabricated or created in B64. It is formally deferred to Milestone 4 / Package 10 (Election Business Logic) or Package 12 (Administration Backend).
