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

**Date:** 22nd July 2026

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

# Sprint 3 – System Workflows

**Date:** 22nd July 2026

## Sprint Goal

Define the complete operational workflows governing the Student Online Voting Platform, ensuring that every election follows a secure, transparent, consistent, and auditable process from election planning to election archiving.

---

## Work Completed

### Part A – Overall System Workflow

Completed the definition of the complete election lifecycle covering:

- Election Planning
- Election Creation
- Election Voter Register Import
- Register Validation
- Student Account Activation
- Candidate Nomination
- Candidate Review and Approval
- Election Preparation
- Election Opening
- Student Voting
- Election Closure
- Vote Counting
- Result Publication
- Election Archiving

Defined the functional requirements and election integrity principles governing the overall workflow.

---

### Part B – Student Workflow

Designed the complete workflow for student interaction with the platform, including:

- Authentication
- Dashboard Access
- Election Participation
- Ballot Submission
- Vote Confirmation
- Logout

Defined participation rules, voting eligibility requirements, and workflow validation for student activities.

---

### Part C – Electoral Officer Workflow

Designed the administrative workflow for Electoral Officers covering:

- Election Creation
- Election Configuration
- Voter Register Import
- Register Validation
- Student Account Activation
- Candidate Review and Approval
- Election Monitoring
- Result Publication
- Election Archiving

Defined administrative rules, functional requirements, and exception handling procedures.

---

### Part D – Super Administrator Workflow

Defined the responsibilities of the Super Administrator, including:

- Institutional Management
- User Management
- Role and Permission Management
- System Configuration
- Audit Log Review
- Security Monitoring
- Notification Management
- System Maintenance

Established administrative integrity requirements for system-wide operations.

---

### Part E – Exception and Alternate Workflows

Documented system behavior during exceptional situations, including:

- Authentication failures
- Election exceptions
- Voting exceptions
- Administrative exceptions
- Network interruptions
- Database failures
- Business continuity procedures
- Data integrity protection

These workflows ensure the platform maintains consistency and reliability under abnormal operating conditions.

---

### Part F – Workflow Validation

Established workflow validation rules governing:

- Workflow sequencing
- Workflow state transitions
- Election integrity validation
- Security validation
- Workflow completion criteria
- Workflow reliability

These validation rules ensure that every workflow follows the approved election lifecycle while preventing invalid or unauthorized operations.

---

## Key Design Decisions

- Defined a complete end-to-end election workflow.
- Adopted workflow state validation before every critical operation.
- Introduced exception and alternate workflows for system resilience.
- Enforced workflow validation to prevent invalid state transitions.
- Ensured one eligible