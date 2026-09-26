# PRE-RESET FORENSIC SNAPSHOT REPORT

**Project:** Student Online Voting Platform  
**Chief Architect:** David Ayantade Tolulope  
**Timestamp:** 2026-09-25T10:04:00Z  
**Target Specification:** v2.3.0-FINAL-CORRECTED  

---

## 1. Live Database Table Probe
- `users`: 0 rows
- `roles`: 0 rows
- `account_statuses`: 4 rows
- `administrators`: 0 rows
- `students`: 0 rows
- `institutional_students`: 0 rows
- `academic_sessions`: 0 rows
- `departments`: 0 rows
- `programmes`: 0 rows
- `levels`: 0 rows
- `elections`: 0 rows
- `election_statuses`: 0 rows
- `student_register`: 0 rows
- `positions`: 0 rows
- `candidate_statuses`: 0 rows
- `candidates`: 0 rows
- `candidate_details`: 0 rows
- `voter_participation`: Permission Denied / RLS Enabled
- `ballot_selections`: Permission Denied / RLS Enabled
- `audit_logs`: 0 rows

## 2. Migration Inventory Pre-Reset
- `database/migrations/005_voting_engine_b75_b81.sql` (485 lines)
- `database/migrations/006_account_auth_b66_b69.sql` (155 lines)
- `database/migrations/007_institutional_students_b67.sql` (64 lines)
- Historical migrations 001–004: Absent

## 3. Retired Entities Identified for Deletion
- `public.institutional_students`
- `public.programmes`
- Legacy `public.ballots` and `public.votes` (already absent)
