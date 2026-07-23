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

---

# Sprint 4 – Security Architecture

**Date:** 23rd July 2026

## Sprint Goal

Design the complete security architecture for the Student Online Voting Platform by defining authentication, authorization, data protection, audit logging, monitoring, and threat protection requirements that will guide secure implementation throughout the system lifecycle.

---

## Work Completed

### Part A – Authentication Architecture

Designed the authentication framework for the platform.

Defined:

- Authentication objectives
- User authentication workflow
- Account lifecycle
- Account activation process
- Login requirements
- Session management principles
- Authentication security requirements

Updated the authentication model to support students using their personal email addresses registered with the institution.

---

### Part B – Authentication Methods

Completed the authentication method specification covering:

- Personal email verification
- Secure password creation
- Account activation workflow
- Password requirements
- Password reset process
- Account status validation
- Secure authentication policies

Refined the activation process so students create their own passwords after successful email verification.

---

### Part C – Authorization and Access Control

Designed the authorization architecture using Role-Based Access Control (RBAC).

Defined:

- Authorization model
- Role-Based Access Control (RBAC)
- Permission evaluation
- Access control requirements
- Protected system resources
- Authorization principles
- Authorization business rules

Prepared the architecture for future integration with PostgreSQL Row Level Security (RLS).

---

### Part D – Data Protection and Encryption

Defined the platform's data protection strategy.

Covered:

- Password protection
- Encryption in transit
- Encryption at rest
- Sensitive data classification
- Environment variable management
- Data retention requirements
- Data protection security requirements

Established the security principles for protecting confidential election information.

---

### Part E – Audit Logging and Monitoring

Designed the audit logging architecture.

Defined:

- Authentication audit logs
- Administrative audit logs
- Voting audit logs
- System monitoring
- Audit log retention
- Audit log security requirements

Ensured that audit logging supports accountability while preserving ballot anonymity.

---

### Part F – Threat Protection and Security Validation

Completed the threat protection architecture.

Documented security controls for:

- Input validation
- SQL Injection prevention
- Cross-Site Scripting (XSS) protection
- Cross-Site Request Forgery (CSRF) protection
- Brute-force protection
- Session security
- Secure error handling
- Security validation requirements

Completed the overall security architecture for the Student Online Voting Platform.

---

## Key Design Decisions

- Adopted personal email authentication instead of institutional email authentication.
- Students shall create their own passwords after successful email verification.
- Adopted Role-Based Access Control (RBAC) as the authorization model.
- Deferred Attribute-Based Access Control (ABAC)-style policies for implementation through PostgreSQL Row Level Security (RLS) during Database Engineering.
- Defined encryption and data protection requirements as mandatory security controls.
- Designed a comprehensive audit logging architecture while preserving voter anonymity.
- Established security validation requirements against common application threats.

---

## Deliverables

- Updated Software Requirements Specification.
- Completed Security Architecture documentation.
- Completed Authentication Architecture.
- Completed Authorization Architecture.
- Completed Data Protection requirements.
- Completed Audit Logging requirements.
- Completed Threat Protection requirements.

---

## Sprint Outcome

Sprint 4 successfully established the complete security architecture for the Student Online Voting Platform.

The security requirements defined in this sprint will serve as the foundation for implementing secure authentication, authorization, database protection, Row Level Security (RLS), audit logging, and application security throughout subsequent development milestones.

---

# Sprint 5 – Software Architecture & Technical Design

**Date:** 23rd July 2026

## Sprint Goal

Design the complete software architecture for the Student Online Voting Platform by defining the technical architecture, technology stack, frontend and backend architecture, system components, project folder structure, and engineering standards that will guide implementation throughout the project lifecycle.

---

## Work Completed

### Part A – System Architecture Overview

Defined the overall software architecture of the platform.

Documented:

- Architecture purpose
- Architectural goals
- High-level architecture
- Architectural principles
- System layers
- Expected architectural benefits

Established the architecture-first approach that will guide subsequent development phases.

---

### Part B – Technology Stack

Documented the complete technology stack for the platform.

Defined:

- Frontend technologies
- Backend technologies
- Development tools
- Supporting libraries
- Technology selection principles
- Technology compatibility

Added a Technology Selection Justification table explaining the purpose and rationale behind each major technology adopted in the project.

---

### Part C – Frontend Architecture

Designed the frontend architecture.

Defined:

- Frontend objectives
- Component-Based Architecture
- Application layouts
- Routing architecture
- Component architecture
- State management
- Form management
- Responsive design
- Frontend security
- Frontend design principles

Established the architectural foundation for a scalable and maintainable React application.

---

### Part D – Backend Architecture

Designed the backend architecture.

Defined:

- Backend objectives
- Backend-as-a-Service (BaaS) architecture
- Authentication service
- Authorization service
- Business logic layer
- Database communication
- API communication
- Backend security
- Backend design principles

Prepared the system for secure integration with Supabase and PostgreSQL.

---

### Part E – System Components

Identified and documented the major system components.

Completed the architecture for:

- Authentication Component
- Student Management Component
- Election Management Component
- Candidate Management Component
- Position Management Component
- Voting Component
- Results Component
- Reporting Component
- Audit and Monitoring Component

Defined component interactions and component design principles.

---

### Part F – Project Folder Structure

Designed the standardized project directory structure.

Documented:

- Root project structure
- Documentation directory
- Database directory
- Public directory
- Source directory
- Source subdirectories
- Folder responsibilities
- Folder structure principles

Established a consistent organization that supports maintainability and future scalability.

---

### Part G – Architecture Principles & Engineering Standards

Defined the engineering standards governing the project.

Documented:

- Software engineering principles
- Security principles
- Database design principles
- User interface principles
- Coding standards
- Documentation standards
- Version control standards
- Quality assurance principles
- Maintainability principles
- Scalability principles
- Engineering philosophy

Confirmed the Architecture-First development approach for the project.

---

## Key Design Decisions

- Adopted a layered software architecture.
- Selected a modern technology stack centered on React, Type