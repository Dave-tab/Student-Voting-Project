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