# Database Architecture & Migrations

This directory contains the database artifacts, migrations, and verified baselines for the Student Online Voting Platform.

## Historical Migration Status & Integrity Notice

- **Original Migration Files 001–004**: Not present in the current repository. Per project governance rules (Package 8), these files have **NOT** been fabricated or backfilled with reconstructed historical claims. Historical uncertainty is preserved transparently.
- **Verified Current-State Baseline**: Available at `database/baselines/current_schema_baseline.sql`. This file documents the verified live schema observed in the Supabase PostgreSQL database. It is explicitly a baseline of current state, not a claim of historical migration contents.
- **Authoritative Executed Migration**: `005_voting_engine_b75_b81.sql` is present and verified.

---

## Directory Layout

```text
database/
├── baselines/
│   └── current_schema_baseline.sql   # Reconstructed Current-State Schema Baseline (B63)
├── migrations/
│   ├── 005_voting_engine_b75_b81.sql  # Authoritative Voting Engine & Decoupled Model (B75–B81)
│   ├── 006_account_auth_b66_b69.sql   # Account Lifecycle, RBAC Foundation & Super Admin Bootstrap (B66)
│   └── 007_institutional_students_b67.sql # Institutional Student Identity & Register Separation (B67)
└── README.md
```

---

## Artifact Index

| File Path | Classification | Scope / Description | Governance Reference |
| :--- | :--- | :--- | :--- |
| `database/baselines/current_schema_baseline.sql` | Verified Baseline | Comprehensive baseline of verified live PostgreSQL tables, primary keys, foreign keys (`ON DELETE RESTRICT`), unique constraints, and indexes. | B63 / DB-001–DB-006 |
| `database/migrations/005_voting_engine_b75_b81.sql` | Executed Migration | Authoritative Voting Engine: Decoupled anonymous ballot architecture (`voter_participation`, `ballot_selections`), `submit_ballot` authoritative RPC with `SECURITY DEFINER`, `calculate_election_results` anonymous counting foundation, and legacy `ballots`/`votes` retirement. | Decisions A–J, ODR-001, ODR-002, ODR-003, AVI-01–AVI-12 |
| `database/migrations/006_account_auth_b66_b69.sql` | Prepared Migration | Account & Authentication Backend Foundation: `public.account_statuses`, `users.account_status_id`, 5 approved roles seed, self-escalation prevention RLS, and root Super Admin bootstrap. Awaiting Owner execution via Supabase SQL Editor. | B66 / Package 9 Decisions 3, 5, 6, 8 |
| `database/migrations/007_institutional_students_b67.sql` | Prepared Migration | Institutional Student Identity: `public.institutional_students` table, verification indexes, and admin RLS. Decoupled from election-specific `student_register`. Awaiting Owner execution via Supabase SQL Editor. | B67 / Package 9 Decisions 1, 2 |


---

## Authoritative Invariants Enforced in Schema
1. **Decoupled Voting Architecture (ODR-001 / Decision A)**:
   - `public.voter_participation`: Tracks voter turnout (`student_id`, `election_id`, `participated_at`).
   - `public.ballot_selections`: Tracks anonymous candidate selections (`election_id`, `position_id`, `candidate_id`). Zero voter link.
2. **Authoritative Submission Boundary (ODR-003 / Decisions B & C)**:
   - Single database RPC `submit_ballot` (`SECURITY DEFINER`, `search_path = public, pg_temp`).
   - Self-voting prohibition enforced during identity-aware validation before persistence.
3. **Data Integrity (DB-003)**:
   - Core relational links enforce `ON DELETE RESTRICT` to protect auditability and election history.
   - `student_register.election_id` uses `ON DELETE CASCADE` scoped to election lifecycle.
