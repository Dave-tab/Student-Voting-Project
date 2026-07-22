# Development Journal

---

## Sprint 1 — Software Requirements Specification

**Date:** 22 July 2026

### Objective
Develop the Software Requirements Specification (SRS) for the Secure Web-Based Student Voting Platform.

### Completed Tasks

- Defined the project vision.
- Documented the problem statement.
- Specified the proposed solution.
- Defined the project aim and objectives.
- Identified stakeholders.
- Established project scope.
- Listed functional boundaries.
- Defined guiding principles.
- Added the "Election Integrity Above All" engineering principle.

### Challenges

None.

### Outcome

Sprint 1 completed successfully.
The Software Requirements Specification now serves as the foundation for all future architecture, database, backend, frontend, and security decisions.

---

# Sprint 2 – User Roles, Permissions & Business Rules

**Date:** _(Enter today's date)_

## Sprint Goal

Define the access control model, permission architecture, and operational business rules governing the Student Online Voting Platform.

---

## Work Completed

### Part A – User Roles & Permission Architecture

Completed the definition of all system user roles:

- Super Administrator
- Electoral Officer
- Student
- Candidate
- Auditor

Defined:

- Responsibilities
- Restrictions
- Role hierarchy
- Permission categories
- Permission levels
- Principle of Least Privilege (PoLP)

---

### Part B – Permission Matrix

Designed a complete Role-Based Access Control (RBAC) matrix covering:

- Authentication & Account Management
- Student Management
- Election Register Management
- Election Management
- Candidate Management
- Position Management
- Voting Engine
- Results & Analytics
- Reports & Audit Logs
- System Administration

This permission matrix will serve as the implementation guide for frontend route protection, backend authorization, and PostgreSQL Row Level Security (RLS).

---

### Part C – Business Rules

Defined forty-three (43) business rules covering:

- Student account activation
- Election voter register management
- Candidate eligibility
- Voting process
- Anonymous ballot handling
- Result publication
- Election lifecycle
- Security
- Audit logging
- Data integrity
- Backup strategy

These rules will later be implemented through PostgreSQL constraints, triggers, functions, and application validation.

---

## Key Design Decisions

- Adopted Role-Based Access Control (RBAC).
- Added Permission Categories for logical grouping.
- Added Permission Levels for layered authorization.
- Applied the Principle of Least Privilege.
- Designed election-specific voter registers.
- Enforced anonymous voting through separation of voter identity and ballot records.
- Introduced a structured Election Lifecycle.
- Defined audit logging as a mandatory security requirement.

---

## Deliverables

- Updated Software Requirements Specification.
- Completed Permission Matrix.
- Completed Business Rules documentation.
- Reviewed system security architecture.

---

## Sprint Outcome

Sprint 2 successfully established the authorization model and operational policies for the Student Online Voting Platform.

These documents provide the foundation for database engineering, Row Level Security (RLS), API authorization, and frontend access control.

---

