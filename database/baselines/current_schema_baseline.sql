-- ============================================================================
-- VERIFIED CURRENT-STATE DATABASE BASELINE
-- 
-- Project: Student Online Voting Platform
-- Package: Package 8 — Backend Foundation (Batch B63)
-- Authority: Empirically Verified Live PostgreSQL Schema Cache
-- 
-- MANDATORY HISTORICAL GOVERNANCE NOTICE:
-- Original migration files 001–004 are NOT present in the current repository.
-- This file represents the verified current-state database baseline reconstructed
-- from empirical inspection of the live PostgreSQL database.
-- It does NOT recreate, backfill, or establish the exact historical contents,
-- filenames, authorship, or execution dates of migrations 001–004.
-- 
-- Locked Architectural Invariants Included:
-- 1. ODR-001: Legacy tables (ballots, votes) are retired and dropped.
-- 2. Decoupled Voting: voter_participation (identity-bearing) and
--    ballot_selections (anonymous choices) are permanently decoupled.
-- 3. ODR-003: Authoritative RPC submission boundary with self-voting prevention.
-- 4. DB-002: Single email authentication strategy.
-- 5. DB-003: Referential integrity with ON DELETE RESTRICT on core entities.
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ROLES & USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. ACADEMIC STRUCTURE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.programmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. STUDENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT,
    matriculation_number VARCHAR(50) NOT NULL UNIQUE,
    department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT,
    programme_id UUID REFERENCES public.programmes(id) ON DELETE RESTRICT,
    academic_session_id UUID REFERENCES public.academic_sessions(id) ON DELETE RESTRICT,
    level_id UUID REFERENCES public.levels(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. ELECTIONS & STATUSES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.election_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    election_status_id UUID NOT NULL REFERENCES public.election_statuses(id) ON DELETE RESTRICT,
    academic_session_id UUID REFERENCES public.academic_sessions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. STUDENT REGISTER (ELECTION-SPECIFIC ELIGIBILITY)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
    matriculation_number VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT,
    programme_id UUID REFERENCES public.programmes(id) ON DELETE RESTRICT,
    level_id UUID REFERENCES public.levels(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_register_election_matric UNIQUE (election_id, matriculation_number)
);

CREATE INDEX IF NOT EXISTS idx_student_register_lookup 
ON public.student_register(election_id, matriculation_number);

-- ----------------------------------------------------------------------------
-- 6. POSITIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_positions_election_name UNIQUE (election_id, name)
);

CREATE INDEX IF NOT EXISTS idx_positions_election_id 
ON public.positions(election_id);

-- ----------------------------------------------------------------------------
-- 7. CANDIDATES & DETAILS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidate_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    candidate_status_id UUID NOT NULL REFERENCES public.candidate_statuses(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_candidates_position_student UNIQUE (position_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_candidates_election_position 
ON public.candidates(election_id, position_id);

CREATE TABLE IF NOT EXISTS public.candidate_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL UNIQUE REFERENCES public.candidates(id) ON DELETE CASCADE,
    campaign_slogan TEXT,
    manifesto TEXT,
    photo_path TEXT,
    approval_remarks TEXT,
    withdrawal_reason TEXT,
    is_profile_complete BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. AUTHORITATIVE DECOUPLED VOTING ARCHITECTURE (ODR-001, ODR-003)
-- ----------------------------------------------------------------------------
-- Participation tracking: identity-bearing, records WHO voted and WHEN.
CREATE TABLE IF NOT EXISTS public.voter_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    participated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_voter_participation_election_student UNIQUE (election_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_voter_participation_election 
ON public.voter_participation(election_id);

-- Anonymous ballot selections: zero identity link, records WHAT was voted.
CREATE TABLE IF NOT EXISTS public.ballot_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ballot_selections_counting 
ON public.ballot_selections(election_id, position_id, candidate_id);

-- ----------------------------------------------------------------------------
-- 9. AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ============================================================================
-- END OF VERIFIED CURRENT-STATE DATABASE BASELINE
-- ============================================================================
