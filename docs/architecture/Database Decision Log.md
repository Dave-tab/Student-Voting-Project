# Part E – Database Decision Log

# Architecture Review Checkpoint

## What are we validating?

This part establishes the official process for documenting significant database architectural decisions made throughout the Student Online Voting Platform project.

---

## Why is it important?

Architectural decisions influence every subsequent implementation.

Recording them ensures that future development remains consistent, traceable, and understandable, preventing undocumented changes and repeated discussions.

---

## Which approved documents govern this work?

This document shall remain consistent with:

- Software Requirements Specification (SRS)
- Software Architecture
- Database Architecture
- Business Rule Mapping
- AI Implementation Guide
- Sprint Implementation Template

---

## What must not change during this part?

This part documents approved decisions only.

It shall not introduce architectural changes or modify previously approved requirements.

Only approved decisions shall be recorded.

---

# Purpose

The Database Decision Log serves as the permanent record of significant database architectural decisions.

Its purpose is to preserve the reasoning behind important design choices, support future maintenance, and ensure that every implementation remains aligned with approved architecture.

---

# Decision Record Structure

Every decision recorded in this document shall follow the standard structure below.

## Decision ID

A unique identifier assigned to each architectural decision.

Example:

- DB-001
- DB-002
- DB-003

---

## Title

A short descriptive name for the decision.

---

## Date

The date on which the decision was approved.

---

## Status

Each decision shall have one of the following statuses:

- Proposed
- Approved
- Superseded

---

## Decision

A concise statement describing the approved architectural decision.

---

## Context

The background or problem that required the decision.

---

## Alternatives Considered

Other viable approaches evaluated before approval.

---

## Rationale

The reasons why the approved option was selected.

---

## Consequences

The expected impact of the decision on implementation, maintenance, performance, security, or scalability.

---

## Related Documents

References to the project documents influenced by the decision.

Examples include:

- Software Requirements Specification (SRS)
- Software Architecture
- Database Architecture
- Business Rule Mapping
- API Specification

---

## Related Business Rules

The Business Rule IDs associated with the decision.

If none apply, record:

- Not Applicable

---

## Implementation Sprint

The milestone and sprint where the decision is first implemented.

Example:

- Milestone 2 – Sprint 2

---

## Approved By

Record the approving authority for the decision.

For this project:

- Software Architect (Dayan)
- AI Architecture Reviewer (ChatGPT)

---

# Decision Management Principles

The Database Decision Log shall follow these principles:

- Every significant architectural decision shall be recorded.
- Every decision shall include its rationale.
- Superseded decisions shall remain in the log for historical reference.
- Implementation shall always follow approved decisions.
- Documentation shall be updated whenever a new decision is approved.

---

# Initial Decision Records

## DB-001

**Title**

Database Architecture-First Implementation Workflow

**Date**

23 July 2026

**Status**

Approved

**Decision**

The project shall follow the engineering workflow:

**Design → Review → Approve → Execute**

No SQL shall be generated or executed before architectural review and approval.

**Context**

To prevent premature implementation and preserve architectural consistency throughout database development.

**Alternatives Considered**

- Implement immediately without review.
- Review after SQL execution.

**Rationale**

Architecture-first implementation reduces redesign, improves quality, and ensures every implementation remains traceable to approved documentation.

**Consequences**

- All SQL requires review before execution.
- Documentation precedes implementation.
- Consistent engineering workflow throughout Milestone 2.

**Related Documents**

- AI Implementation Guide
- Sprint Implementation Template
- Database Architecture

**Related Business Rules**

Not Applicable

**Implementation Sprint**

Milestone 2 – Sprint 1

**Approved By**

- Software Architect (Dayan)
- AI Architecture Reviewer (ChatGPT)

---

## DB-002

**Title**

Single Email Authentication Strategy

**Date**

23 July 2026

**Status**

Approved

**Decision**

The system shall use a single `email` field for user authentication.

Students shall authenticate using their personal email address, which must match the email stored in the approved student register.

Institutional email addresses shall not be required.

**Context**

The institution already uses students' personal email addresses for academic and administrative processes.

Introducing institutional email addresses would add unnecessary complexity and conflict with existing workflows.

**Alternatives Considered**

- Institutional email authentication.
- Separate personal and institutional email fields.
- Username-based authentication.

**Rationale**

Using a single `email` field aligns with existing institutional practice, simplifies the data model, reduces redundancy, and improves usability.

**Consequences**

- User authentication uses one email field.
- Student register imports must include the approved email address.
- All authentication and account activation processes shall validate against this field.
- Future SQL and documentation shall use `email` consistently.

**Related Documents**

- Software Requirements Specification (SRS)
- Software Architecture
- Database Architecture
- Business Rule Mapping

**Related Business Rules**

Authentication and User Management business rules.

**Implementation Sprint**

Milestone 2 – Sprint 2

**Approved By**

- Software Architect (Dayan)
- AI Architecture Reviewer (ChatGPT)

---

Decision ID: DB-003

Title:
Foreign Key Deletion Strategy

Status:
Approved

Decision:
All foreign key relationships from Users to Students and Administrators shall use ON DELETE RESTRICT.

Context:
The Student Online Voting Platform maintains historical records and auditability. Automatic deletion of related records could compromise election integrity and historical data.

Alternatives Considered:
- CASCADE
- SET NULL

Rationale:
Historical records shall be preserved. Future requirements for removing users shall be addressed through archival or deactivation rather than deletion.

Consequences:
- Prevents accidental data loss.
- Preserves referential integrity.
- Supports future audit requirements.

Implementation Sprint:
Milestone 2 – Sprint 2

---

## Historical Record Qualification (Sprint 6 Entry)

The historical entry below recorded Sprint 6 completion during earlier Milestone 2 planning, referencing `005_voting_engine_schema.sql`. An authoritative repository inspection revealed that the file `005_voting_engine_schema.sql` is not present in the repository, and the legacy identity-linked schema concept (`ballots` linked to `votes`) has been formally SUPERSEDED by Owner Decision Record ODR-001. No voting engine migration shall be claimed as executed until formally verified in the live database during the future B75–B81 backend architecture review.

```text
[HISTORICAL / SUPERSEDED ENTRY]
Sprint 6 — Voting Engine Schema
Status: ✅ Completed (Historical Record — Superseded by ODR-001)
Migration: 005_voting_engine_schema.sql (Not present in repository; superseded)
Execution: Historical reference only
Review: Five-Layer Review Passed
```

---

## DB-004

**Title**  
Anonymous Participation and Selections Architecture (Supersession of Legacy Identity-Linked Voting Model)

**Date**  
16 September 2026

**Status**  
Approved (ODR-001 / Decision A)

**Decision**  
The database shall permanently separate voter identity from ballot selections by replacing/retiring the legacy identity-linked model (`students` → `ballots.student_id` → `votes.ballot_id`) with a two-tier decoupled architecture:
1. `voter_participation`: Records voter turnout (`student_id`, `election_id`, `participated_at`) without ballot choices.
2. `ballot_selections`: Records anonymous candidate selections (`election_id`, `position_id`, `candidate_id`) without voter identity or persistent ballot identifiers.

There shall be no foreign key, persistent ballot identifier, or application-level reconstructable relationship linking a voter's identity to their specific selections.

**Context**  
The legacy model created an indirect but reconstructable join path from student identity to candidate choices via `ballots.id`. To guarantee ballot secrecy (WHO PARTICIPATED ≠ WHAT WAS SELECTED), the identity-linked model must be retired.

**Alternatives Considered**  
- *Alternative 1 — Keep legacy model*: Rejected due to privacy violation.
- *Alternative 2 — Keep both models*: Rejected due to competing sources of truth and ambiguity.
- *Alternative 3 — Retire/replace legacy model*: OWNER-APPROVED (ODR-001).

**Rationale**  
Ensures mathematical and architectural ballot secrecy while preserving voter turnout accountability.

**Consequences**  
- The legacy `ballots` and `votes` tables are superseded.
- Implementation details (table definitions, constraints, indexes, RLS, grants, and drop vs. rename migration strategy) remain subject to B75–B81 architecture review and owner approval.

**Related Documents**  
- Architecture Decision Log (Decision A, Decision J, ODR-001)
- Software Architecture
- Database Architecture
- Software Requirements Specification (BR-014)

---

## DB-005

**Title**  
Authoritative Database RPC Voting Submission Boundary & Security Definer Direction

**Date**  
16 September 2026

**Status**  
Approved (ODR-003 / Decisions B, C, J)

**Decision**  
Vote submission shall be executed solely through a single authoritative database RPC configured with `SECURITY DEFINER` and a tightly controlled `search_path`.
The RPC shall:
1. Derive caller identity strictly from `auth.uid()`, never trusting caller-supplied identity parameters.
2. Validate voter eligibility against `student_register` and verify the election time window.
3. Enforce self-voting prohibition (ODR-003 / BR-016) during identity-aware validation before anonymous selections are persisted.
4. Execute atomically within a single database transaction: record participation in `voter_participation` and anonymous choices in `ballot_selections`.
5. Prohibit students from having direct write access to participation or ballot tables.

**Context**  
Client-side direct writes to database tables cannot be trusted to enforce ballot atomicity, eligibility, and anonymity.

**Alternatives Considered**  
- *Frontend-orchestrated multiple table writes*: Rejected; vulnerable to tampering and partial failures.
- *Direct table inserts with RLS*: Insufficient to decouple identity validation from anonymous insertion atomically.
- *Authoritative RPC*: OWNER-APPROVED.

**Consequences**  
- Direct write access to voting tables by client roles is denied.
- Exact RPC signature, SQL implementation, error codes, and grants remain OPEN, subject to B75–B81 review.

**Related Documents**  
- Architecture Decision Log (Decisions B, C, J, ODR-003)
- Software Architecture

---

## DB-006

**Title**  
Dedicated Persisted Results Model & Publication Lifecycle

**Date**  
16 September 2026

**Status**  
Approved (ODR-002 / Decisions F, G, H, I)

**Decision**  
Election results shall be managed through a dedicated persisted results and publication model derived from aggregate anonymous ballot selections.
The lifecycle is:
$$\text{Calculated} \longrightarrow \text{Reviewed} \longrightarrow \text{Published} \longrightarrow \text{Immutable}$$

Key Rules:
1. Aggregate calculations derive solely from `ballot_selections`.
2. Candidate percentages use the total valid candidate selections for that position as the denominator (excluding abstentions).
3. Ties are recorded with result status `Tied` and winner `none` (no automatic tie-breaking).
4. Published results become read-only and immutable.
5. Administrators may review and publish results, but cannot arbitrarily modify calculated vote counts.

**Context**  
The previously referenced dynamic view (`vw_election_results`) does not support an explicit administrative review and publication lifecycle, nor does it guarantee post-publication immutability.

**Alternatives Considered**  
- *Dynamic calculation views only*: Rejected; lacks publication audit trail and state immutability.
- *Dedicated persisted results model*: OWNER-APPROVED (ODR-002).

**Consequences**  
- A dedicated results schema will be introduced during backend development.
- Exact table schema, column definitions, status representations, and calculation functions remain OPEN, subject to B75–B81 review.

**Related Documents**  
- Architecture Decision Log (Decisions F, G, H, I, ODR-002)
- Software Requirements Specification (BR-020, BR-021, BR-022, BR-023)