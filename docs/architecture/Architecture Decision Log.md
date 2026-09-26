# Architecture Decision Log (ADL)

## Purpose

The Architecture Decision Log (ADL) records significant architectural decisions made during the design and development of the Student Online Voting Platform.

Each decision includes the problem being addressed, the selected solution, and the justification for the decision.

The ADL provides a permanent record that helps future developers understand why important architectural choices were made.

---

# Decision 001

## Title

Architecture-First Development Approach

### Decision

The project shall adopt an Architecture-First development methodology.

### Justification

Designing the architecture before implementation reduces technical debt, minimizes design inconsistencies, and provides a stable foundation for development.

### Status

Approved

---

# Decision 002

## Title

Frontend Framework

### Decision

React shall be used as the frontend framework.

### Justification

React provides a component-based architecture, excellent ecosystem support, strong community adoption, and scalability suitable for large web applications.

### Status

Approved

---

# Decision 003

## Title

Programming Language

### Decision

TypeScript shall be used instead of JavaScript.

### Justification

TypeScript improves code quality through static type checking, enhances maintainability, and reduces runtime errors.

### Status

Approved

---

# Decision 004

## Title

Build Tool

### Decision

Vite shall be used as the frontend build tool.

### Justification

Vite provides fast development startup, efficient builds, and excellent support for modern frontend technologies.

### Status

Approved

---

# Decision 005

## Title

CSS Framework

### Decision

Tailwind CSS shall be adopted as the styling framework.

### Justification

Tailwind CSS promotes rapid UI development, design consistency, responsiveness, and maintainable styling.

### Status

Approved

---

# Decision 006

## Title

Backend Platform

### Decision

Supabase shall be used as the Backend-as-a-Service (BaaS) platform.

### Justification

Supabase provides authentication, PostgreSQL, Row Level Security, storage, and API services in a unified platform suitable for secure production applications.

### Status

Approved

---

# Decision 007

## Title

Database Management System

### Decision

PostgreSQL shall be used as the primary relational database.

### Justification

PostgreSQL offers excellent reliability, ACID compliance, advanced indexing, constraints, triggers, functions, and security features required for election systems.

### Status

Approved

---

# Decision 008

## Title

Authorization Model

### Decision

Role-Based Access Control (RBAC) shall be adopted for authorization.

### Justification

RBAC simplifies permission management while ensuring users only access resources appropriate to their assigned roles.

### Status

Approved

---

# Decision 009

## Title

Election-Specific Voter Register

### Decision

Each election shall maintain its own voter register.

### Justification

Election-specific voter registers improve flexibility, prevent unauthorized participation, and allow different elections to define different eligibility requirements.

### Status

Approved

---

# Decision 010

## Title

Anonymous Voting Model

### Decision

The system shall separate voter identity from ballot records.

### Justification

Separating voter identity from stored ballots preserves ballot secrecy while maintaining election integrity.

### Status

Approved

---

# Decision 011

## Title

Project Documentation Structure

### Decision

The project shall maintain a structured documentation hierarchy under the `docs/` directory.

### Justification

Organized documentation improves maintainability, onboarding, collaboration, and long-term project management.

### Status

Approved

---

# Decision 012

## Title

Version Control Strategy

### Decision

Git and GitHub shall be used for version control and project collaboration.

### Justification

Version control provides traceability, change history, rollback capability, and structured collaboration throughout the project lifecycle.

### Status

Approved

---

# Decision 013

## Title

Incremental Development Strategy

### Decision

The system shall be developed using milestone-based and sprint-based implementation.

### Justification

Breaking the project into manageable milestones and sprints improves quality assurance, simplifies testing, and reduces implementation risks.

### Status

Approved

---

# Decision 014

## Title

Definition of Done (DoD)

### Decision

Every sprint shall have a clearly defined Definition of Done before being considered complete.

### Justification

The Definition of Done ensures that documentation, implementation, testing, version control, and quality standards are consistently satisfied before progressing to subsequent work.

### Status

Approved

---

# Decision 015

## Title

Election Integrity Above All

### Decision

Election integrity shall take precedence over convenience, performance optimizations, or rapid feature delivery.

### Justification

The primary objective of the Student Online Voting Platform is to conduct secure, fair, transparent, and trustworthy elections. All architectural and implementation decisions shall prioritize the protection of election integrity.

### Status

Approved

---

# Approved Architectural Decisions (A–J)

The following decisions (A–J) have been formally approved by the Project Owner & Architect, David Ayantade Tolulope (DAYAN). They establish the authoritative architecture and behavior of the voting engine, result processing, and security boundaries. They do NOT define exact physical implementation. The architectural direction is approved. Exact physical implementation remains subject to B75–B81 architecture review and owner approval.

---

## Decision A: Anonymous Ballot Structure

### Decision
Store anonymous candidate selections independently, grouped conceptually by election rather than by a persistent ballot identifier, while recording voter participation separately through an identity-bearing participation record.

### Conceptual Model
- `voter_participation`: Records identity-bearing turnout (`student_id`, `election_id`, `participated_at`, etc.).
- `ballot_selections`: Records anonymous ballot choices (`election_id`, `position_id`, `candidate_id`, etc.).
- **NO PERSISTENT LINK**: There is no foreign key, persistent ballot identifier, or reconstructable application-level link connecting voter participation records to specific ballot selections.

### Requirements
- `ballot_selections` must not contain voter identity.
- There must be no persistent ballot identifier connecting identity to selections.
- The application must not provide a persistent reconstructable identity-to-specific-selection relationship (preserving WHO PARTICIPATED ≠ WHAT WAS SELECTED).
- Exact physical schema remains OPEN.

### Status
OWNER-APPROVED

---

## Decision B: Authoritative Voting Submission Mechanism

### Decision
Use a single authoritative database RPC/function as the voting submission boundary.

### Conceptual Flow
Authenticated request → Voting RPC → identify student → validate eligibility → validate election → validate candidates/selections → enforce participation rules → record participation → store anonymous selections → COMMIT.

### Requirements
- The voting transaction must be atomic.
- Frontend direct writes must not be the authoritative voting transaction.
- Exact RPC name, parameters, return type, SQL, transaction implementation, and related mechanisms remain OPEN.

### Status
OWNER-APPROVED

---

## Decision C: Voting RPC Security

### Decision
Use a tightly controlled `SECURITY DEFINER` PostgreSQL RPC as the authoritative voting submission boundary.

### Requirements
The RPC shall:
- derive identity from `auth.uid()`;
- never trust caller-supplied identity;
- use a controlled search path;
- have narrowly scoped privileges;
- restrict execution to the intended application role;
- validate voting rules server-side;
- operate consistently with RLS and function privileges;
- prevent students from having direct authoritative write access to participation/anonymous ballot tables.
- Note: `SECURITY DEFINER` is not itself considered sufficient security; defense in depth must be maintained.
- Exact SQL, ownership, grants, search path, RLS, and physical mechanisms remain OPEN.

### Status
OWNER-APPROVED

---

## Decision D: Vote Reference

### Decision
There is NO Vote Reference. After successful submission, the system displays:
*"Vote submitted successfully. Your participation has been recorded."*
Actions: Return to Dashboard | View Election Overview.

### Requirements
The system must not expose:
- Vote Reference Code;
- Vote Reference Number;
- Ballot ID;
- Submission ID;
- ballot retrieval mechanism.

The previous SRS Vote Reference requirement (BR-015) is therefore SUPERSEDED.

### Status
OWNER-APPROVED

---

## Decision E: Logging

### Decision
Use separated audit and operational logging.

### Requirements
- Identity-bearing participation events may contain: student, election, event/status, necessary timestamp/audit information.
- Anonymous ballot records contain: election, position, candidate, without voter identity.
- Operational logs may contain necessary execution/error information.
- The system must never persist an identifiable voter together with their specific ballot selections through logs.
- Never log combinations such as:
  - `auth.uid() + candidate_id`
  - `student_id + full ballot submission payload`
  - `matric_number + candidate selections`
  - `authenticated user + position -> candidate mapping`
- The rule is semantic, not merely based on field names.

### Status
OWNER-APPROVED

---

## Decision F: Abstention / Percentages / Winner Semantics

### Decision
1. **Abstention**:
   - A participant may leave a position unselected.
   - No artificial "Abstain" candidate is created.
   - No fake abstention candidate ID is stored.
   - Abstention counts toward election participation/turnout; does not count toward candidate vote totals; is excluded from the candidate-percentage denominator; may be presented as a derived position-level statistic.
   - Distinguish nonparticipant/absent student from participant who leaves a position blank (abstention).
2. **Percentage Denominator**:
   - $\text{Percentage} = \frac{\text{Candidate Valid Votes}}{\text{Total Valid Candidate Selections for that Position}} \times 100$
   - If there are zero valid candidate selections, do not produce a meaningless percentage or divide by zero.
3. **Winner**:
   - Winner = candidate with the highest valid vote total for the position.
   - Do not automatically resolve ties.

### Status
OWNER-APPROVED

---

## Decision G: Tie Handling

### Decision
The system detects and records a tie when multiple candidates have the same highest valid vote total. It does NOT automatically select a winner or determine the resolution.

### Requirements
- Example: Candidate A → 40, Candidate B → 40. Result status → Tied. Winner → none.
- The electoral body/election committee determines the resolution according to the applicable institutional process.
- Do NOT invent automatic tie-breakers, random selection, nomination order, runoffs, automatic new elections, or automatic winner selection.

### Status
OWNER-APPROVED

---

## Decision H: Result Percentage

### Decision
Candidate result percentages use the total number of valid candidate selections for that position as the denominator. Abstentions are excluded from that denominator. Abstentions may be presented separately as a derived position-level statistic.

### Status
OWNER-APPROVED

---

## Decision I: Result Publication

### Decision
After an election closes:
1. System calculates aggregate results.
2. Results remain unpublished.
3. Authorized administrator reviews calculated results.
4. Administrator publishes results.
5. Published results become read-only and immutable.

### Requirements
- Calculate from authoritative anonymous ballot-selection data.
- Preserve aggregate-only results.
- Support explicit calculated/reviewed/published lifecycle.
- Prevent ordinary modification of published results.
- Administrator review does NOT mean the administrator manually chooses the winner or arbitrarily edits calculated vote totals.
- For a tie: publish the tied result; do not manufacture a winner.
- Any post-publication correction, recount, or replacement-result procedure must follow an explicitly approved institutional process.
- Exact persisted results schema remains OPEN.

### Status
OWNER-APPROVED

---

## Decision J: Voting Engine Security & Technical Contract (Invariants AVI-01–AVI-12)

### Decision
Decision J establishes the formal security and technical contract for B75–B81 based on the 12 Authoritative Voting Invariants:
- **AVI-01 (Identity Separation)**: Voter identity must not be stored in the same ballot-selection record as candidate choice.
- **AVI-02 (No Persistent Identity–Ballot Link)**: No persistent application-level relationship may allow reconstruction of student identity to specific ballot selections.
- **AVI-03 (Eligibility)**: Only authenticated eligible students may submit votes.
- **AVI-04 (Election State)**: Voting is allowed only during the authorized voting period/state.
- **AVI-05 (One Participation Per Election)**: A student may participate at most once per election.
- **AVI-06 (Atomic Submission)**: Participation and anonymous selections must be processed atomically.
- **AVI-07 (Anonymous Counting)**: Results must be calculated from anonymous selections.
- **AVI-08 (Least Privilege)**: Access must follow least-privilege principles.
- **AVI-09 (Audit Separation)**: Audit information must not reveal voter choices.
- **AVI-10 (Correlation Minimization)**: The system must minimize opportunities to correlate voter identity with selections.
- **AVI-11 (Frontend Untrusted)**: Frontend validation cannot be treated as authoritative security enforcement.
- **AVI-12 (No Absolute Claims)**: Do not make absolute claims such as "100% secure," "perfect anonymity," or equivalent guarantees.

Decision J does NOT approve the exact physical SQL or schema.

### Status
OWNER-APPROVED

---

# Owner Decision Records (ODR)

The following Owner Decision Records are formally approved by the Project Owner & Architect, David Ayantade Tolulope (DAYAN). They establish authoritative architectural policy. They do NOT define implementation specifications or exact SQL.

---

## ODR-001: Retirement of Legacy Identity-Linked Voting Model

### Decision
Replace/retire the legacy identity-linked `ballots`/`votes` voting model after dependency and data-safety verification. The approved anonymous `voter_participation` + `ballot_selections` architecture becomes authoritative.

### Alternatives Considered
- *Alternative 1 — Keep the existing model*: Not approved because it conflicts with the anonymous voting architecture.
- *Alternative 2 — Keep both models*: Not approved because it creates competing sources of truth and increases privacy/security ambiguity.
- *Alternative 3 — Retire/replace the legacy model*: OWNER-APPROVED.

### Rationale
The legacy model permits an identity-to-selection relationship. The approved architecture requires persistent separation between WHO PARTICIPATED and WHAT WAS SELECTED.

### Safeguard
Before any destructive or structural database operation, inspect application references, database dependencies, foreign keys, indexes, triggers, functions/RPCs, views, RLS, grants, actual data presence, and migration history.

### Scope of Approval
- **APPROVED**: Retire/replace the old identity-linked voting architecture; make the anonymous participation/selections architecture authoritative; preserve identity/selection separation.
- **NOT APPROVED**: This ODR does NOT approve exact SQL, exact migration sequence, drop vs rename implementation, table definitions, constraints, indexes, RLS policies, grants, destructive execution, archival mechanisms, or unrelated schema changes.

### Status
OWNER-APPROVED

---

## ODR-002: Persisted Results and Publication Model

### Decision
Use a dedicated persisted results/publication model derived from anonymous ballot selections.
The lifecycle is:
$$\text{Calculated} \longrightarrow \text{Reviewed} \longrightarrow \text{Published} \longrightarrow \text{Immutable}$$

### Alternatives Considered
- *Dynamic results only*: Not selected as the overall architecture.
- *Persisted results/publication model*: OWNER-APPROVED.
- *Preserve existing `vw_election_results` as authority*: NOT APPROVED.

### Rationale
The system requires explicit calculation state, administrative review, official publication, stable published results, and immutability after publication.

### Locked Result Behavior
- Aggregate anonymous selections.
- Valid-selection denominator; abstentions excluded from candidate percentages.
- Highest valid votes determines winner; ties produce no automatic winner.
- Calculated → reviewed → published lifecycle; published results immutable.
- Administrator cannot arbitrarily edit calculated totals.

### Scope of Approval
- **APPROVED**: Dedicated persisted result architecture; results derived from anonymous selections; explicit publication lifecycle; immutable published state; aggregate-only results.
- **NOT APPROVED**: This ODR does NOT approve exact table names, exact columns, status enums, one table vs multiple tables, publication mechanisms, calculation functions, triggers, RLS, grants, SQL, or migrations.

### Status
OWNER-APPROVED

---

## ODR-003: Self-Voting Enforcement

### Decision
Self-voting remains prohibited. It shall be enforced inside the authoritative voting RPC during identity-aware validation, before anonymous selections are persisted.

### Conceptual Flow
Authenticated request → `auth.uid()` → identify student → identify candidate ownership → validate self-voting → reject or proceed → record participation + anonymous selections → COMMIT.

Identity may be used during validation. Identity must NOT be persisted with the anonymous selection.

### Alternatives Considered
- *Frontend-only enforcement*: NOT APPROVED as authoritative.
- *Store identity with selection*: NOT APPROVED because it violates anonymous ballot architecture.
- *RPC validation before anonymous persistence*: OWNER-APPROVED.

### Scope of Approval
- **APPROVED**: Self-voting remains prohibited; enforcement occurs in the authoritative RPC; identity may be used during validation; validation occurs before anonymous selection persistence; final anonymous selections contain no voter identity; no persistent identity-selection relationship is created.
- **NOT APPROVED**: This ODR does NOT approve exact SQL queries, exact lookup mechanisms, exact RPC code, exact constraints, exact RLS mechanisms, logging implementations, or new schema structures invented solely for self-voting.

### Status
OWNER-APPROVED

---

The Architecture Decision Log shall be reviewed whenever significant architectural changes are proposed.

New architectural decisions shall be documented before implementation.

Deprecated decisions shall remain in the log for historical reference but shall be clearly marked as superseded.

---

## Document Ownership

The Software Architect shall approve all architecture decisions.

The Chief Architect shall review, challenge, and recommend improvements before implementation.

Implementation shall only proceed after architectural decisions have been approved and documented.