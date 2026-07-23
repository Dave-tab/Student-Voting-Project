# Software Requirements Specification (SRS)

## Student Online Voting System

**version**: 1.0

**Project:** 
Design and Development of Web-Based Student Voting Platform

**Author:**
Ayantade David Tolulope

**Institution:**
The Polytechnic, Ibadan

**Department:**
Computer Science

**Date:** 
22nd July 2026

---
# Document Purpose

This Software Requirements Specification (SRS) defines the functional and the non-functional requirements for the Secure Web-Based Student Voting Platform. It serves as the primary reference for yje design, development, testing, deployment, and maintenance of the system.

This document ensures that all stakeholders have a shared understanding of the system's objectives, expected functionality, security requirements, constraints, and scope before implementation begins.

---
# Sprint 1

---

# 1. Introduction

## 1.1 Background

Student elections are an essential part of academic governance. They allow students to elect representatives who will speak on their behalf and contribute to decision-making within their departments, faculties, and the institution.

Many departmental elections are still conducted manually using paper ballots or basic online forms. These approaches often suffer from several challenges, including slow vote counting, human error, lack of transparency, unauthorized participation, duplicate voting, and difficulties in maintaining voter confidentiality.

To address these challenges, this project proposes the development of a Secure Web-Based Student Voting Platform that digitizes the entire election lifecycle while maintaining election integrity, voter eligibility, ballot secrecy, accountability, and transparency.

The system is designed to support departmental elections initially while remaining scalable enough to accommodate faculty-wide and institution-wide elections in the future.

---

## 1.2 Problem Statement

The current election process used in many departments presents several challenges, including:

- Manual vote counting.
- Delayed announcement of results.
- Unauthorized individuals participating in elections.
- Duplicate voting.
- Poor record keeping.
- Difficulty auditing election activities.
- Limited transparency.
- Lack of centralized election management.
- Risk of manipulation during vote counting.

These challenges reduce confidence in election outcomes and increase the workload of electoral officers.

---

## 1.3 Proposed Solution

This project proposes the development of a secure, web-based election management platform that provides:

- Secure account activation using the official voter register.
- Role-based authentication and authorization.
- Election management.
- Candidate management.
- Position management.
- Secure anonymous voting.
- Automatic vote counting.
- Live voter turnout monitoring.
- Election countdown timer.
- Election archive.
- Audit logging.
- Administrative reporting.

The system aims to improve election transparency while preserving ballot secrecy and ensuring that only eligible students participate in elections.

---

## 1.4 Aim of the Project

The aim of this project is to design and develop a secure web-based student voting platform that enables transparent, efficient, anonymous, and trustworthy electronic elections within academic institutions.

---

## 1.5 Objectives

The objectives of the project are to:

- Develop a secure online voting platform.
- Verify student eligibility using an official voter register.
- Prevent duplicate voting.
- Ensure one vote per student for each position.
- Protect ballot secrecy.
- Automatically count votes.
- Publish election results accurately.
- Generate election reports.
- Maintain comprehensive audit logs.
- Provide a scalable architecture suitable for future expansion.

---

# 2. Project Vision

The vision of the Secure Web-Based Student Voting Platform is to provide a transparent, secure, scalable, and reusable electronic election management system capable of conducting departmental, faculty, and institution-wide student elections while preserving election integrity, voter authenticity, ballot secrecy, and administrative accountability.

The platform is designed to replace traditional paper-based voting methods and insecure online voting solutions with a modern election management system that follows established software engineering principles and industry-standard security practices.

Rather than developing a system intended for a single departmental election, the project aims to produce a reusable platform that can be configured for different departments, faculties, student associations, and institutional elections without requiring major modifications to the underlying software architecture.

The long-term vision is to create an election platform that inspires trust among students, electoral officers, and institutional administrators by ensuring that every eligible student votes only once, every vote is counted accurately, and election results remain transparent while maintaining complete ballot secrecy.

---

# 3. Project Scope

The Secure Web-Based Student Voting Platform is designed to manage the complete lifecycle of student elections, beginning from election planning and voter register preparation through election execution, automatic result computation, publication, and archival.

The scope of this project defines the system boundaries by identifying the features that will be implemented and those intentionally excluded from the current version.

## 3.1 In Scope

The following functionalities are included within the scope of this project:

### User Authentication

- Student account activation
- Secure login
- Password reset
- Session management
- Role-based authentication

### Student Management

- Student profile management
- Student account activation
- Eligibility verification
- Election participation tracking

### Election Register Management

- Import official voter register
- CSV validation
- Duplicate detection
- Invalid record reporting
- Import summary generation

### Election Management

- Create elections
- Configure election dates
- Configure voting duration
- Automatic election scheduling
- Election status management

### Candidate Management

- Candidate nomination
- Candidate approval
- Candidate rejection
- Candidate profile management

### Position Management

- Create elective positions
- Edit positions
- Activate positions
- Close positions

### Voting

- Anonymous ballot casting
- One vote per student per position
- Vote reference generation
- Countdown timer
- Automatic vote confirmation

### Results Management

- Automatic vote counting
- Winner determination
- Live voter turnout
- Election analytics
- Result publication
- Election archive

### Announcement Management

- Publish announcements
- Election notices
- Candidate information
- Student notifications

### Audit Logging

- Administrative activity logs
- Security logs
- Election activity logs
- Login history
- System event tracking

### Reporting

- Election statistics
- Voter turnout reports
- Candidate reports
- Election archive reports

---

## 3.2 Out of Scope

To maintain a manageable project size while ensuring high quality, the following features are intentionally excluded from this version of the system:

- National elections
- Government elections
- Biometric authentication
- Fingerprint verification
- Facial recognition
- Blockchain-based voting
- SMS voting
- Mobile application development
- Offline voting synchronization
- Third-party payment integration
- Artificial Intelligence decision making
- Multi-language translation
- Electronic signature integration

These features may be considered in future versions of the platform but are outside the objectives of the current project.

---

# 4. Stakeholders

The stakeholders represent all individuals and groups who interact with or benefit from the Student Voting Platform.

## Primary Stakeholders

### Students

Students are the primary users of the system. Eligible students activate their accounts, participate in elections, cast anonymous votes, and view election announcements and results.

### Electoral Officers

Electoral officers manage election activities including election creation, voter register import, candidate approval, election monitoring, and result publication.

### Departmental Administration

Departmental administrators oversee election processes and ensure elections are conducted fairly and transparently.

### Candidates

Candidates submit their information for approval, contest elective positions, and monitor election outcomes.

### System Administrator

The System Administrator manages system configuration, user roles, security settings, and platform maintenance.

---

## Secondary Stakeholders

- Faculty Management
- School ICT Unit
- Future Developers
- Academic Researchers
- External Auditors (where applicable)

These stakeholders may not directly participate in elections but benefit from the availability, reliability, maintainability, and auditability of the platform.

---

# 5. Guiding Principles

The development of this platform is guided by the following software engineering principles:

## Security First

Security takes priority over convenience. Every component of the platform must protect election integrity and user data.

## Ballot Secrecy

No vote shall ever be traceable to the identity of the student who cast it.

## One Student, One Vote

Each eligible student may cast only one vote for each elective position during an election.

## Eligibility Before Participation

Only students whose records exist in the official Election Voter Register and who have successfully activated their accounts shall be permitted to participate in the election.

## Transparency

Election activities should be observable and verifiable without compromising ballot secrecy.

## Accountability

Administrative actions must be recorded through secure audit logs.

## Scalability

The system architecture should support future expansion from departmental elections to faculty-wide and institution-wide elections.

## Maintainability

The software should be modular, well-documented, and easy to extend by future developers.

## Reliability

Election data must remain accurate, consistent, and recoverable throughout the election lifecycle.

## Usability

The platform should provide a simple, responsive, and intuitive user experience across desktop and mobile devices.

---

## Election Integrity Above All

Every architectural and implementation decision shall preserve the fairness, transparency, accuracy, and credibility of the election process.

Where there is a conflict between convenience and election integrity, election integrity shall always take precedence.

This principle ensures that all future enhancements, database designs, security mechanisms, and application workflows prioritize the legitimacy of election outcomes while maintaining voter trust and ballot secrecy.

---

# 6. User Roles and Responsibilities

The Secure Web-Based Student Voting Platform implements a Role-Based Access Control (RBAC) model to ensure that every user can only perform actions that are appropriate for their assigned responsibilities.

Each authenticated user is assigned one or more predefined roles within the system. These roles determine the resources the user can access, the operations they can perform, and the restrictions applied to their account.

The system defines five primary user roles.

---

## 6.1 Super Administrator

### Description

The Super Administrator is the highest authority within the system. This role is responsible for the overall administration, configuration, security, and maintenance of the Student Voting Platform.

The Super Administrator oversees all elections, manages other administrators, configures institutional settings, and ensures the integrity of the election process.

This role is intended for the system owner or designated ICT administrator and should only be assigned to trusted personnel.

### Responsibilities

- Manage system configuration.
- Create Electoral Officer accounts.
- Suspend or remove Electoral Officers.
- Manage departments and programmes.
- Manage user roles.
- Configure security settings.
- View all audit logs.
- Monitor all elections.
- Access system reports.
- Restore backups where applicable.
- Archive completed elections.

### Permissions

The Super Administrator can:

- Create, edit, and delete elections.
- Import voter registers.
- Manage candidates.
- Manage positions.
- Publish announcements.
- Publish election results.
- View all reports.
- Access audit logs.
- Manage administrators.
- Manage departments.
- Manage programmes.
- Lock or unlock elections.
- Configure system settings.

### Restrictions

The Super Administrator:

- Cannot modify anonymous ballot records.
- Cannot determine how an individual student voted.
- Cannot alter vote counts after an election has closed.

These restrictions preserve ballot secrecy and election integrity.

---

## 6.2 Electoral Officer

### Description

The Electoral Officer manages the operational activities of elections.

This role is typically assigned to members of the departmental electoral committee responsible for conducting elections.

Unlike the Super Administrator, Electoral Officers cannot modify core system settings or manage other administrators.

### Responsibilities

- Create elections.
- Configure election schedules.
- Import Election Voter Registers.
- Approve or reject candidates.
- Manage election positions.
- Publish announcements.
- Monitor voter turnout.
- Publish election results.
- Close elections when necessary.

### Permissions

The Electoral Officer may:

- Create elections.
- Edit elections.
- Import voter registers.
- Manage candidates.
- Manage positions.
- View election reports.
- View turnout statistics.
- Publish announcements.
- Publish results.
- View audit logs related to election activities.

### Restrictions

The Electoral Officer cannot:

- Create Super Administrators.
- Modify system security settings.
- Delete audit logs.
- View individual ballot selections.
- Modify votes.
- Reopen archived elections without authorization.

---

## 6.3 Student

### Description

The Student is the primary user of the platform.

Students participate in elections after successfully activating their accounts using the official Election Voter Register imported for a particular election.

Students may only participate in elections for which they are eligible.

### Responsibilities

- Activate account.
- Maintain personal profile.
- View announcements.
- View active elections.
- Review candidate profiles.
- Cast votes.
- Verify voting participation using the generated Vote Reference.
- View personal voting history without revealing candidate selections.

### Permissions

Students may:

- Activate an account.
- Login.
- Logout.
- Reset password.
- Update limited profile information.
- Vote once per position.
- View election announcements.
- View election schedules.
- View candidate information.

### Restrictions

Students cannot:

- Vote more than once for the same position.
- Vote outside the election period.
- Vote in elections where they are not eligible.
- Vote after election closure.
- Modify election information.
- Access administrative dashboards.
- View election audit logs.
- View vote counts before publication.

---

## 6.4 Candidate

### Description

A Candidate is an eligible student who has been approved by the Electoral Officer to contest for an elective position.

Candidates inherit all permissions available to Students while receiving additional privileges related to their candidacy.

### Responsibilities

- Maintain candidate profile.
- Upload manifesto.
- Upload campaign photograph.
- View election schedule.
- Monitor election status.

### Permissions

Candidates may:

- Perform every action available to Students.
- Manage candidate profile.
- Upload manifesto.
- Upload campaign information.
- View candidate approval status.

### Restrictions

Candidates cannot:

- Approve themselves.
- Modify election settings.
- View other candidates' confidential information.
- Access administrative functions.
- Vote for themselves during the election in which they are contesting.

---

## 6.5 Auditor

### Description

The Auditor is an independent read-only role designed to improve transparency and accountability.

This role is optional and may be assigned to departmental management, supervisors, or institutional ICT personnel responsible for verifying election integrity.

### Responsibilities

- Observe election activities.
- Review audit logs.
- Review election reports.
- Verify election integrity.

### Permissions

The Auditor may:

- View audit logs.
- View election reports.
- View turnout statistics.
- View published election results.
- Review election archives.

### Restrictions

The Auditor cannot:

- Create elections.
- Modify records.
- Delete records.
- Approve candidates.
- Import voter registers.
- Publish announcements.
- Publish results.
- Vote in elections using the Auditor account.

---

## Role Hierarchy

The platform implements the following role hierarchy:

Super Administrator
        │
        ▼
Electoral Officer
        │
        ▼
Candidate
        │
        ▼
Student

The Auditor operates independently with read-only privileges and does not participate in the administrative hierarchy.

This hierarchy ensures that permissions are inherited where appropriate while maintaining the principle of least privilege. Users are granted only the permissions necessary to perform their assigned responsibilities, thereby reducing security risks and preserving the integrity of the election process.

---

## 6.6 Permission Classification

To improve security, maintainability, and scalability, the Student Voting Platform groups system permissions into logical categories based on the type of resources being accessed.

Rather than assigning permissions individually, permissions are organized into security domains. This approach simplifies access control management and aligns with the principles of Role-Based Access Control (RBAC) and the Principle of Least Privilege.

The system defines four primary permission categories.

---

### 6.6.1 System Permissions

System Permissions grant access to administrative operations that affect the overall configuration and management of the platform.

These permissions are considered highly privileged and are reserved primarily for the Super Administrator.

Examples include:

- Manage administrators
- Assign or revoke user roles
- Configure system settings
- Manage departments
- Manage programmes
- View all audit logs
- Configure security policies
- Archive completed elections
- Restore system backups

---

### 6.6.2 Election Permissions

Election Permissions control activities directly related to conducting elections.

These permissions are available only to authorized election administrators.

Examples include:

- Create elections
- Edit elections
- Delete elections
- Open elections
- Close elections
- Import Election Voter Register
- Validate imported voter register
- Approve candidates
- Reject candidates
- Manage elective positions
- Publish announcements
- Publish election results
- Monitor voter turnout

---

### 6.6.3 Personal Permissions

Personal Permissions allow authenticated users to manage their own information without affecting other users or system-wide data.

These permissions are available to Students, Candidates, Electoral Officers, and Super Administrators where applicable.

Examples include:

- Activate account
- Login
- Logout
- Change password
- Reset password
- Update personal profile
- View personal voting history
- View candidate approval status
- Upload candidate manifesto
- Update candidate photograph

Personal permissions are restricted to the authenticated user's own records.

---

### 6.6.4 Read-Only Permissions

Read-Only Permissions allow users to access information without modifying system data.

These permissions support transparency while preserving election integrity.

Examples include:

- View election announcements
- View candidate profiles
- View election schedules
- View published results
- View election archive
- View voter turnout statistics
- View audit reports (Auditor only)

Read-Only Permissions do not permit the creation, modification, or deletion of records.

---

## 6.7 Principle of Least Privilege

The Student Voting Platform follows the Principle of Least Privilege (PoLP).

Every user shall receive only the minimum permissions necessary to perform their assigned responsibilities.

No user shall be granted elevated privileges unless explicitly authorized by the Super Administrator.

This principle reduces the risk of accidental system misuse, privilege escalation, unauthorized data access, and malicious activities while improving the overall security posture of the platform.

Examples include:

- Students cannot access administrative modules.
- Candidates cannot approve their own candidature.
- Electoral Officers cannot modify system-wide security settings.
- Auditors cannot modify election records.
- Super Administrators cannot view how an individual student voted because ballots remain anonymous.

---

## 6.8 Permission Levels

In addition to Role-Based Access Control (RBAC), the Student Voting Platform classifies permissions into different security levels based on the sensitivity of the operation being performed.

Permission Levels provide an additional layer of access control by ensuring that high-risk operations receive stronger protection than routine user activities.

This classification assists in implementing PostgreSQL Row Level Security (RLS), API authorization, frontend route protection, audit logging, and administrative approval workflows.

The platform defines four permission levels.

---

### Level 1 – Public Permissions

Public Permissions provide access to information that does not compromise election integrity or user privacy.

These permissions generally require little or no authentication and expose only publicly available information.

Typical operations include:

- View landing page
- View election announcements
- View candidate profiles
- View election schedules
- View published election results
- View public notices

These operations cannot modify system data.

---

### Level 2 – Personal Permissions

Personal Permissions allow authenticated users to access and manage only their own information.

These permissions are isolated to the currently authenticated user and must never expose another user's private data.

Typical operations include:

- Activate account
- Login
- Logout
- Change password
- Reset password
- Update personal profile
- View personal voting history
- View personal notifications
- Generate voting confirmation reference

The system shall verify the user's identity before granting access to any personal resource.

---

### Level 3 – Operational Permissions

Operational Permissions authorize users to perform election management activities that directly affect election operations.

These permissions are assigned to Electoral Officers responsible for conducting elections.

Typical operations include:

- Create elections
- Configure election schedules
- Import Election Voter Register
- Validate imported voter register
- Approve candidates
- Reject candidates
- Manage elective positions
- Publish announcements
- Monitor voter turnout
- Publish election results
- Archive completed elections

Every operational activity shall be recorded in the Audit Log for accountability.

---

### Level 4 – Administrative Permissions

Administrative Permissions provide unrestricted access to critical system configuration and administrative management.

These permissions are reserved exclusively for the Super Administrator.

Typical operations include:

- Manage administrator accounts
- Assign and revoke roles
- Configure security settings
- Manage departments
- Manage programmes
- Lock or unlock elections
- Restore database backups
- Configure system policies
- Access all audit logs
- Manage system-wide settings

Administrative operations represent the highest level of system privilege and shall require strict authorization controls.

---

## Relationship Between Roles and Permission Levels

The platform combines Role-Based Access Control (RBAC) with Permission Levels to provide layered security.

Each user role is granted only the permission levels necessary to perform its responsibilities.

The mapping is summarized below.

| User Role | Highest Permission Level |
|-----------|--------------------------|
| Super Administrator | Level 4 – Administrative |
| Electoral Officer | Level 3 – Operational |
| Candidate | Level 2 – Personal |
| Student | Level 2 – Personal |
| Auditor | Level 1 – Public (plus authorized read-only access to audit reports) |

This layered permission model strengthens the security architecture by ensuring that users receive only the minimum privileges required to perform their assigned duties while protecting sensitive election operations from unauthorized access.


---

# 7. Permission Matrix

## 7.1 Purpose

The Permission Matrix defines the actions each user role is authorized to perform within the Student Online Voting Platform.

The platform implements Role-Based Access Control (RBAC), where permissions are granted based on assigned roles rather than individual users.

Permission enforcement shall occur at multiple layers of the application, including:

- Frontend route protection
- Backend API authorization
- PostgreSQL Row Level Security (RLS)
- Database constraints and triggers

Unless explicitly granted, all actions are denied by default.

Permission Legend:

| Symbol | Meaning |
|---------|---------|
| ✅ | Full Permission |
| 👁️ | View Only |
| ❌ | No Permission |

---

## 7.2 Authentication & Account Management

| Action | Super Admin | Electoral Officer | Student | Candidate | Auditor |
|----------|------------|-------------------|----------|-----------|----------|
| Activate Account | ❌ | ❌ | ✅ | ✅ | ❌ |
| Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reset Password | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage User Accounts | ✅ | ❌ | ❌ | ❌ | ❌ |
| Lock User Account | ✅ | ❌ | ❌ | ❌ | ❌ |
| Unlock User Account | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 7.3 Student Management

| Action | Super Admin | Electoral Officer | Student | Candidate | Auditor |
|----------|------------|-------------------|----------|-----------|----------|
| View Student Records | ✅ | ✅ | 👁️ Own | 👁️ Own | 👁️ |
| Import Election Voter Register | ❌ | ✅ | ❌ | ❌ | ❌ |
| Validate Import | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve Student Activation | ❌ | ✅ | ❌ | ❌ | ❌ |
| Suspend Student | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Student | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export Student List | ✅ | ✅ | ❌ | ❌ | 👁️ |

---

## 7.4 Election Management

| Action | Super Admin | Electoral Officer | Student | Candidate | Auditor |
|----------|------------|-------------------|----------|-----------|----------|
| Create Election | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Election | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Election | ✅ | ❌ | ❌ | ❌ | ❌ |
| Open Election | ✅ | ✅ | ❌ | ❌ | ❌ |
| Close Election | ✅ | ✅ | ❌ | ❌ | ❌ |
| Archive Election | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Elections | ✅ | ✅ | 👁️ | 👁️ | 👁️ |

---

## 7.5 Candidate Management

| Action | Super Admin | Electoral Officer | Student | Candidate | Auditor |
|----------|------------|-------------------|----------|-----------|----------|
| Submit Candidate Application | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Candidate Applications | ✅ | ✅ | ❌ | 👁️ Own | 👁️ |
| Approve Candidate | ❌ | ✅ | ❌ | ❌ | ❌ |
| Reject Candidate | ❌ | ✅ | ❌ | ❌ | ❌ |
| Upload Manifesto | ❌ | ❌ | ❌ | ✅ | ❌ |
| Upload Candidate Photograph | ❌ | ❌ | ❌ | ✅ | ❌ |
| Withdraw Candidate | ❌ | ❌ | ❌ | ✅ | ❌ |

---
## 7.6 Position Management

| Action | Super Admin | Electoral Officer | Student | Candidate | Auditor |
|----------|------------|-------------------|----------|-----------|----------|
| Create Position | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Position | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Position | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Positions | ✅ | ✅ | 👁️ | 👁️ | 👁️ |

---

## 7.7 Voting Engine

| Action | Super Admin | Electoral Officer | Student | Candidate | Auditor |
|----------|------------|-------------------|----------|-----------|----------|
| Cast Vote | ❌ | ❌ | ✅ | ✅* | ❌ |
| Vote for Self | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own Vote | ❌ | ❌ | ❌ | ❌ | ❌ |
| Generate Vote Reference | ❌ | ❌ | ✅ | ✅ | ❌ |
| View Voter Turnout | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Close Voting Automatically | System | System | ❌ | ❌ | ❌ |

**Note:** Candidates may vote in the election but are prohibited from voting for themselves.

---

## 7.8 Results & Analytics

| Action | Super Admin | Electoral Officer | Student | Candidate | Auditor |
|----------|------------|-------------------|----------|-----------|----------|
| View Live Turnout | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| View Live Vote Counts | ✅ | ✅ | ❌ | ❌ | 👁️ |
| Publish Results | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Published Results | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Export Results | ✅ | ✅ | ❌ | ❌ | 👁️ |

---

## 7.9 Reports & Audit Logs

| Action | Super Admin | Electoral Officer | Student | Candidate | Auditor |
|----------|------------|-------------------|----------|-----------|----------|
| View Audit Logs | ✅ | 👁️ Own Actions | ❌ | ❌ | ✅ |
| Export Audit Logs | ✅ | ❌ | ❌ | ❌ | ✅ |
| View Reports | ✅ | ✅ | ❌ | ❌ | 👁️ |
| Generate Reports | ✅ | ✅ | ❌ | ❌ | 👁️ |

---

## 7.10 System Administration

| Action | Super Admin | Electoral Officer | Student | Candidate | Auditor |
|----------|------------|-------------------|----------|-----------|----------|
| Manage Administrators | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configure System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Restore Database Backup | ✅ | ❌ | ❌ | ❌ | ❌ |
| View System Health | ✅ | 👁️ | ❌ | ❌ | 👁️ |
| Manage Departments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Programmes | ✅ | ✅ | ❌ | ❌ | ❌ |

---

# 8. Business Rules

## 8.1 Purpose

Business Rules define the operational policies that govern the Student Online Voting Platform.

These rules ensure fairness, transparency, data integrity, security, and compliance with the election process.

Every module of the system shall enforce these rules at both the application and database levels.

---

## 8.2 Student Registration & Account Activation Rules

### BR-001: Official Voter Register

Only students whose records exist in the imported Election Voter Register shall be eligible to activate an account for that election.

---

### BR-002: Unique Student Identity

Each matriculation number shall correspond to one and only one student record.

Duplicate matriculation numbers are prohibited.

---

### BR-003: Account Activation

A student shall activate an account using:

- Matriculation Number
- Institutional Email Address

Both values must match the Election Voter Register.

---

### BR-004: One Account Per Student

A student shall activate only one account.

Multiple accounts for the same student are prohibited.

---

### BR-005: Password Security

Passwords shall never be stored in plain text.

Passwords shall be securely hashed before storage.

---

## 8.3 Election Register Rules

### BR-006: Election-Specific Register

Every election shall have its own Election Voter Register.

An imported register applies only to the election for which it was uploaded.

---

### BR-007: Register Validation

Before import, the system shall validate:

- Duplicate matriculation numbers
- Missing required fields
- Invalid department codes
- Invalid programme codes
- Invalid email addresses

The administrator shall review the validation report before confirming the import.

---

### BR-008: Immutable Register

Once voting begins, the Election Voter Register shall become read-only.

No student records may be added, removed, or modified until the election concludes.

---

## 8.4 Candidate Rules

### BR-009: Candidate Eligibility

Only eligible students appearing in the Election Voter Register may become candidates.

---

### BR-010: Candidate Approval

Every candidate application shall require approval by an Electoral Officer before appearing on the ballot.

---

### BR-011: One Position Per Election

A student may contest only one position in a single election unless explicitly permitted by election rules.

---

### BR-012: Candidate Withdrawal

Candidates may withdraw before the election opens.

Withdrawals after voting begins shall not be permitted.

---

## 8.5 Voting Rules

### BR-013: One Student, One Vote Per Position

A student may vote only once for each elective position.

---

### BR-014: Anonymous Ballots

Votes shall never store student identity together with candidate selections.

The system shall permanently separate voter identity from ballot records.

---

### BR-015: Vote Reference

After successful voting, the system shall generate a unique Vote Reference Number.

The reference confirms participation without revealing voting choices.

---

### BR-016: Self-Voting Prohibited

Candidates shall not vote for themselves.

If attempted, the system shall reject the vote.

---

### BR-017: Election Time Window

Votes shall only be accepted while the election is open.

Votes submitted outside the election period shall be rejected.

---

### BR-018: Automatic Election Closure

The system shall automatically close voting when the scheduled end time is reached.

Manual intervention shall not be required.

---

### BR-019: Completed Votes

Once submitted successfully, votes shall become immutable.

Votes cannot be edited, deleted, or replaced.

---

## 8.6 Result Rules

### BR-020: Automatic Counting

The system shall calculate results automatically after voting closes.

Manual vote counting shall not be required.

---

### BR-021: Result Publication

Results shall remain hidden until officially published by an authorized administrator.

---

### BR-022: Published Results

Published results become read-only.

No further modifications shall be permitted.

---

### BR-023: Winner Determination

The candidate with the highest valid votes for a position shall be declared the winner.

Election tie-handling procedures shall follow institutional regulations.

---

## 8.7 Security Rules

### BR-024: Role-Based Access Control

Every authenticated user shall only access resources permitted by their assigned role.

---

### BR-025: Row Level Security

Database access shall be restricted using PostgreSQL Row Level Security (RLS).

Unauthorized records shall never be returned.

---

### BR-026: Audit Logging

Every administrative action shall be recorded.

Audit logs shall include:

- User
- Action
- Timestamp
- IP Address (where available)
- Affected Resource

---

### BR-027: Session Management

Inactive sessions shall expire automatically after a configurable timeout period.

---

### BR-028: Input Validation

All user input shall be validated before processing.

The system shall protect against:

- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)

---

## 8.8 Data Integrity Rules

### BR-029: Referential Integrity

All foreign key relationships shall be enforced by PostgreSQL.

---

### BR-030: Soft Deletion

Critical records shall be archived instead of permanently deleted whenever appropriate.

---

### BR-031: Election Archive

Completed elections shall become read-only archives.

Historical election data shall remain accessible for reporting and auditing.

---

### BR-032: Backup Policy

The database shall support scheduled backups before, during, and after election periods.

---

## 8.9 Audit & Transparency Rules

### BR-033: Activity Tracking

Every administrative operation shall generate an audit log entry.

---

### BR-034: Transparency

Students may verify that they successfully voted using their Vote Reference Number.

The Vote Reference shall never reveal candidate selections.

---

### BR-035: Accountability

Every change made by an administrator shall be attributable to a specific authenticated account.

Anonymous administrative actions are prohibited.

---

## 8.10 Election Lifecycle Rules

### BR-036: Election Planning

An election shall be created before any voter register or candidate information can be added.

---

### BR-037: Voter Register Import

The official Election Voter Register must be imported and validated before student account activation begins.

---

### BR-038: Student Activation

Only students contained within the validated Election Voter Register shall activate accounts for that election.

---

### BR-039: Candidate Approval Completion

Candidate approval shall be completed before the election opens.

No new candidate applications shall be accepted once voting begins.

---

### BR-040: Election Opening

Only scheduled elections meeting all prerequisite requirements shall be opened.

---

### BR-041: Election Closing

An election shall automatically transition to the Closed state when the configured end time is reached.

---

### BR-042: Result Publication

Results shall only be published after vote counting has completed successfully.

---

### BR-043: Election Archiving

Published elections shall be archived automatically.

Archived elections become permanently read-only while remaining available for reporting and auditing.

---

# Workflow States

## Purpose

The Student Online Voting Platform uses a state-driven workflow architecture.

Every major system process exists in a defined state.

A state represents the current stage of a process.

The system shall validate the current state before allowing any action.

If an operation is not permitted in the current state, it shall be rejected.

This prevents unauthorized operations, accidental modifications, and inconsistent election data.

State validation shall be enforced by:

- Frontend validation
- Backend authorization
- PostgreSQL constraints
- PostgreSQL functions
- Row Level Security (RLS)

---

# 9. System Workflow

## 9.1 Overall System Workflow

### 9.1.1 Purpose

The Student Online Voting Platform shall provide a structured workflow that governs all activities from election planning to result publication and archival.

The workflow ensures that every election follows a consistent, transparent, secure, and auditable process.

Only authorized users shall be permitted to perform actions assigned to their roles, and every stage of the election shall be completed before the next stage begins.

---

### 9.1.2 Overall Election Workflow

The system shall support the following workflow:

1. Election Planning
2. Election Creation
3. Election Voter Register Import
4. Register Validation
5. Student Account Activation
6. Candidate Nomination
7. Candidate Review and Approval
8. Election Preparation
9. Election Opens
10. Student Voting
11. Election Closes
12. Vote Counting
13. Result Publication
14. Election Archiving

---

### 9.1.3 Functional Requirements

The system shall:

- Allow Electoral Officers to create elections.
- Require a valid election voter register before student activation begins.
- Validate imported voter registers before use.
- Permit only activated and eligible students to participate.
- Allow only approved candidates to appear on the ballot.
- Automatically open and close elections according to configured dates and times.
- Ensure each eligible student votes only once for each position.
- Automatically count valid votes after the election closes.
- Publish election results only after vote counting is completed.
- Archive completed elections while preserving historical records.

---

### 9.1.4 Election Integrity Principles

To preserve the credibility of every election, the system shall enforce the following principles:

- One eligible student shall cast only one vote per position in an election.
- Ballot secrecy shall always be preserved.
- Vote records shall remain anonymous.
- Every administrative activity shall be logged.
- Election results shall not be altered after publication.
- Archived elections shall remain read-only.
- Every election shall follow the approved workflow from planning to archiving.

These principles shall apply to every election conducted using the Student Online Voting Platform.

---

## 9.2 Student Workflow

### Purpose

The Student Workflow defines the sequence of activities performed by students from account activation through participation in an election.

The workflow ensures that only eligible students can access the system, participate in elections, and cast valid votes while maintaining ballot secrecy, election integrity, and accountability.

---

### Student Workflow Process

The Student Workflow shall follow the sequence below:

1. Student receives account activation instructions.
2. Student activates their account.
3. Student logs into the system.
4. System authenticates the student's identity.
5. System verifies the student's eligibility for available elections.
6. Student accesses the dashboard.
7. Student views eligible active elections.
8. Student selects an election.
9. Student reviews the list of approved candidates.
10. Student casts votes for available positions.
11. System validates the submitted votes.
12. System securely records the anonymous ballots.
13. System generates a unique vote reference.
14. Student receives vote confirmation.
15. Student logs out of the system.

---

### Functional Requirements

The system shall:

- Allow eligible students to activate their accounts before participating in any election.
- Authenticate students before granting access to protected resources.
- Verify student eligibility before displaying available elections.
- Display only elections for which the student is eligible.
- Display only approved candidates on the ballot.
- Allow students to vote only during the official election period.
- Prevent inactive or suspended students from accessing the voting portal.
- Ensure each student votes only once for each elective position.
- Generate a unique vote reference after successful vote submission.
- Display a confirmation message after votes have been successfully recorded.
- Preserve the anonymity of every submitted ballot.
- Prevent modification of submitted votes.
- Record the date and time of every successful vote submission.
- Automatically log students out after prolonged inactivity.

---

### Student Voting Rules

The system shall enforce the following rules during the voting process:

- A student shall only participate in elections assigned to their department, programme and level.
- A student shall not vote before the election opening time.
- A student shall not vote after the election closing time.
- A student shall not vote more than once for the same position.
- A student shall not vote for candidates outside their assigned election.
- A student shall not view election results before official publication.
- A student shall not edit or withdraw a submitted vote.
- Every successful vote shall generate a unique vote reference.
- Every submitted ballot shall remain anonymous throughout the election lifecycle.

---

### Exception Handling

The system shall appropriately respond to the following situations:

- Student enters incorrect login credentials.
- Student account has not been activated.
- Student account is suspended or disabled.
- Student is not included in the election voter register.
- Student is not eligible for the selected election.
- Election has not yet started.
- Election has already ended.
- Student attempts to vote more than once for the same position.
- Student attempts to access another department's election.
- Internet connection is interrupted during vote submission.
- Student session expires due to inactivity.

In each case, the system shall display a clear, user-friendly error message without exposing sensitive system information.

---

### Election Integrity Requirements

To ensure a secure and trustworthy voting process, the system shall:

- Verify student eligibility before allowing ballot access.
- Validate every submitted vote before recording it.
- Record each successful vote only once.
- Prevent duplicate vote submissions.
- Preserve ballot anonymity at all times.
- Generate a unique vote reference for every successful voting session.
- Maintain complete audit logs for authentication and voting activities without revealing ballot contents.
- Ensure that network interruptions, browser refreshes or repeated submissions do not result in duplicate votes.

---

## 9.3 Electoral Officer Workflow

### Purpose

The Electoral Officer Workflow defines the sequence of activities performed by Electoral Officers in planning, managing, monitoring, and concluding elections.

The workflow ensures that elections are conducted in accordance with institutional policies while maintaining fairness, transparency, accountability, and election integrity.

---

### Electoral Officer Workflow Process

The Electoral Officer Workflow shall follow the sequence below:

1. Electoral Officer logs into the system.
2. System authenticates the Electoral Officer.
3. Electoral Officer accesses the administration dashboard.
4. Electoral Officer creates a new election.
5. Electoral Officer configures election details.
6. Electoral Officer imports the election voter register.
7. System validates the imported voter register.
8. Electoral Officer reviews validation results.
9. Electoral Officer opens student account activation.
10. Electoral Officer receives and reviews candidate nominations.
11. Electoral Officer approves or rejects candidate applications.
12. Electoral Officer assigns approved candidates to elective positions.
13. Electoral Officer publishes the list of approved candidates.
14. Electoral Officer monitors election activities.
15. Electoral Officer oversees the election until the closing time.
16. System automatically closes the election.
17. System counts all valid votes.
18. Electoral Officer reviews election results.
19. Electoral Officer publishes the official election results.
20. Electoral Officer archives the completed election.

---

### Functional Requirements

The system shall:

- Allow Electoral Officers to create and configure elections.
- Allow Electoral Officers to define election schedules.
- Allow Electoral Officers to import election voter registers.
- Validate imported voter registers before use.
- Display validation reports for imported registers.
- Allow Electoral Officers to activate eligible students.
- Allow Electoral Officers to review candidate nominations.
- Allow Electoral Officers to approve or reject candidates.
- Allow Electoral Officers to assign approved candidates to elective positions.
- Allow Electoral Officers to publish approved candidate lists.
- Monitor election progress in real time.
- Automatically close elections at the configured closing time.
- Automatically count all valid votes.
- Allow Electoral Officers to publish election results.
- Archive completed elections for future reference.

---

### Administrative Rules

The system shall enforce the following rules:

- An Electoral Officer shall only manage elections assigned to their jurisdiction.
- Elections shall not begin without a validated voter register.
- Only approved candidates shall appear on the ballot.
- Election schedules shall be finalized before voting begins.
- Electoral Officers shall not modify candidate information after voting has commenced.
- Electoral Officers shall not modify voter eligibility after the voter register has been validated.
- Election results shall only be published after vote counting has been completed.
- Archived elections shall remain read-only.

---

### Exception Handling

The system shall appropriately respond to the following situations:

- Invalid voter register import.
- Duplicate student records in the voter register.
- Candidate application does not satisfy eligibility requirements.
- Attempt to approve candidates after voting has commenced.
- Attempt to modify an active election.
- Attempt to publish results before vote counting is complete.
- System failure during voter register validation.
- Election closure interrupted by unexpected system errors.

In each case, the system shall display appropriate error messages, prevent unauthorized actions, and maintain data integrity.

---

### Election Integrity Requirements

To preserve the integrity of election administration, the system shall:

- Record every administrative action in the audit log.
- Validate every imported voter register before activation.
- Prevent unauthorized modification of election records.
- Ensure only eligible students participate in elections.
- Ensure only approved candidates appear on the ballot.
- Prevent administrative actions that violate the election workflow.
- Preserve complete historical records of every completed election.

---

## 9.4 Super Administrator Workflow

### Purpose

The Super Administrator Workflow defines the activities performed by the Super Administrator in managing the overall operation of the Student Online Voting Platform.

The Super Administrator is responsible for system configuration, user administration, security oversight, institutional settings, and maintaining the integrity and availability of the platform.

Unlike Electoral Officers who manage elections, the Super Administrator manages the system itself.

---

### Super Administrator Workflow Process

The Super Administrator Workflow shall follow the sequence below:

1. Super Administrator logs into the system.
2. System authenticates the Super Administrator.
3. Super Administrator accesses the system administration dashboard.
4. Super Administrator manages institutional information.
5. Super Administrator manages faculties, departments and programmes.
6. Super Administrator creates and manages user accounts.
7. Super Administrator assigns user roles and permissions.
8. Super Administrator activates or suspends user accounts.
9. Super Administrator monitors system activities.
10. Super Administrator reviews audit logs.
11. Super Administrator manages system announcements.
12. Super Administrator manages notification templates.
13. Super Administrator monitors system health.
14. Super Administrator reviews security events.
15. Super Administrator performs system maintenance when required.
16. Super Administrator logs out of the system.

---

### Functional Requirements

The system shall:

- Allow the Super Administrator to manage institutional information.
- Allow the Super Administrator to create and manage Electoral Officer accounts.
- Allow the Super Administrator to create additional Super Administrator accounts where permitted.
- Allow the Super Administrator to assign and revoke user roles.
- Allow the Super Administrator to configure role permissions.
- Allow the Super Administrator to activate, suspend or deactivate user accounts.
- Allow the Super Administrator to manage departments, programmes and academic levels.
- Allow the Super Administrator to publish system-wide announcements.
- Allow the Super Administrator to manage notification templates.
- Allow the Super Administrator to monitor system activity.
- Allow the Super Administrator to review audit logs.
- Allow the Super Administrator to monitor failed login attempts.
- Allow the Super Administrator to review security alerts.
- Allow the Super Administrator to perform system maintenance without compromising stored election data.

---

### Administrative Rules

The system shall enforce the following rules:

- Only Super Administrators shall access system administration functions.
- Every administrative action shall be recorded in the audit log.
- Suspended administrators shall not access administrative functions.
- Deleted user accounts shall not be permanently removed if they contain historical election records.
- Role permissions shall be validated before administrative actions are performed.
- System configuration changes shall immediately affect future operations without compromising completed elections.
- Election records shall remain immutable after archival.
- The Super Administrator shall not modify anonymous ballot records.

---

### Exception Handling

The system shall appropriately respond to the following situations:

- Unauthorized access to administration functions.
- Duplicate administrator accounts.
- Invalid role assignment.
- Attempt to delete protected system records.
- Attempt to modify archived election records.
- Failed authentication attempts.
- System maintenance interruption.
- Database connectivity failure during administrative operations.

In each case, the system shall prevent unauthorized actions, preserve data integrity and display appropriate error messages without exposing sensitive system information.

---

### System Integrity Requirements

To maintain platform integrity, the system shall:

- Record every administrative activity within the audit log.
- Maintain complete historical records of user administration.
- Prevent unauthorized privilege escalation.
- Preserve all election records during system maintenance.
- Protect anonymous ballot records from administrative modification.
- Monitor security-related events for suspicious activities.
- Ensure that system configuration changes are traceable.
- Maintain the availability of critical election services during normal operations.

---

## 9.5 Exception and Alternate Workflows

### Purpose

The Exception and Alternate Workflows define how the Student Online Voting Platform shall respond when normal operational processes are interrupted or exceptional situations occur.

These workflows ensure that system reliability, election integrity, data consistency, and user experience are maintained under unexpected conditions.

---

### Authentication Exceptions

The system shall appropriately respond to the following authentication-related situations:

- Student enters incorrect login credentials.
- Student account has not been activated.
- Student account is suspended or disabled.
- User exceeds the maximum permitted login attempts.
- User session expires due to prolonged inactivity.
- Password reset request is invalid or has expired.

In each case, the system shall deny unauthorized access while providing clear and user-friendly feedback.

---

### Election Exceptions

The system shall appropriately respond to the following election-related situations:

- Election has not yet started.
- Election has already ended.
- Election has been cancelled.
- Election has been suspended by an authorized administrator.
- Student attempts to participate in an inactive election.
- Student attempts to access an election for which they are not eligible.

The system shall prevent participation in any election that does not satisfy the required ;?conditions.

---

### Voting Exceptions

The system shall appropriately respond to the following voting-related situations:

- Student attempts to vote more than once for the same position.
- Student submits an incomplete ballot where completion is mandatory.
- Student attempts to vote for an invalid candidate.
- Student attempts to vote after election closure.
- Student attempts to vote before election commencement.
- Duplicate vote submission is detected.

The system shall reject invalid vote submissions without compromising election integrity.

---

### Network and System Exceptions

The system shall appropriately respond to the following operational situations:

- Internet connection is interrupted during vote submission.
- Browser refresh occurs during voting.
- Unexpected browser closure occurs before vote submission.
- Server becomes temporarily unavailable.
- Database transaction fails.
- System maintenance begins during normal operation.

The system shall recover gracefully without creating duplicate votes or inconsistent election records.

---

### Administrative Exceptions

The system shall appropriately respond to the following administrative situations:

- Invalid voter register import.
- Duplicate student records detected.
- Candidate fails eligibility validation.
- Unauthorized modification of election settings.
- Attempt to publish results before vote counting is complete.
- Attempt to modify archived election records.

The system shall reject unauthorized administrative operations and maintain complete audit records.

---

### Data Integrity Requirements

The system shall maintain data integrity by ensuring that:

- Every successful vote is permanently recorded only once.
- Duplicate vote submissions are rejected.
- Failed transactions do not produce partial records.
- Every administrative activity is logged.
- Every security-related event is auditable.
- Archived election data remains immutable.
- Anonymous ballots cannot be linked to voter identities.
- System failures do not compromise election integrity.

---

### Business Continuity Requirements

The system shall support operational continuity by ensuring that:

- Interrupted voting sessions may safely resume where appropriate.
- Elections automatically continue after temporary network interruptions.
- Critical election data is protected against accidental loss.
- Election operations remain consistent throughout the election lifecycle.
- Recovery procedures preserve all successfully completed transactions.

---

## 9.6 Workflow Validation

### Purpose

Workflow Validation establishes the rules that ensure every workflow within the Student Online Voting Platform operates correctly, securely, and consistently.

It ensures that every activity follows the approved election process while preventing unauthorized actions, invalid transitions, and data inconsistencies.

---

### Workflow Validation Principles

The system shall enforce the following workflow validation principles:

- Every workflow shall begin with successful user authentication.
- Every user action shall be validated against the user's assigned role and permissions.
- Every workflow shall follow the approved sequence of operations.
- Unauthorized workflow transitions shall be prevented.
- Every completed operation shall be recorded where audit logging is required.
- Every workflow shall preserve data consistency and election integrity.

---

### Workflow State Validation

The system shall validate the current workflow state before allowing any operation.

The system shall ensure that:

- Candidate approval cannot occur after voting has commenced.
- Student account activation cannot occur after the election has opened.
- Voting shall only be permitted while the election is in the **Open** state.
- Vote counting shall only begin after the election has closed.
- Results shall only be published after vote counting has been completed.
- Archived elections shall remain read-only.

If the current workflow state does not permit an operation, the system shall reject the request and notify the user accordingly.

---

### Election Integrity Validation

To maintain election integrity, the system shall ensure that:

- Every eligible student votes only once for each elective position.
- Duplicate vote submissions are rejected.
- Every accepted vote is permanently recorded.
- Anonymous ballots remain unlinkable to voter identities.
- Every administrative activity is traceable through audit logs.
- Election data remains protected against unauthorized modification.
- Published election results cannot be altered.
- Archived election records remain immutable.

---

### Security Validation

The system shall validate every sensitive operation by ensuring that:

- User authentication is verified.
- User authorization is confirmed.
- Role permissions are enforced.
- Invalid requests are rejected.
- Failed operations do not corrupt stored data.
- Security-related events are recorded for auditing.

---

### Workflow Completion Criteria

A workflow shall only be considered successfully completed when:

- All required validation rules have passed.
- Every mandatory operation has been successfully executed.
- Required audit records have been created.
- Database transactions have completed successfully.
- No data integrity violations have occurred.
- System consistency has been preserved.

---

### Workflow Reliability Requirements

The system shall maintain workflow reliability by ensuring that:

- Unexpected interruptions do not create duplicate transactions.
- Failed operations may be safely retried where appropriate.
- Partially completed transactions are rolled back.
- Concurrent operations do not compromise election integrity.
- System failures do not result in inconsistent election records.

---

# 10. Security Architecture

## 10.1 Security Principles and Security Objectives

### Purpose

The Student Online Voting Platform shall implement a comprehensive security architecture that protects election data, user information, and system resources throughout the entire election lifecycle.

The security architecture shall ensure that elections are conducted in a secure, transparent, reliable, and auditable environment while preserving voter privacy and maintaining public confidence in the integrity of election results.

---

### Security Objectives

The primary security objectives of the Student Online Voting Platform shall be to:

- Protect sensitive user information from unauthorized disclosure.
- Preserve the integrity of election data throughout its lifecycle.
- Ensure that authorized users can access the system whenever required.
- Prevent unauthorized access to protected system resources.
- Preserve voter anonymity during and after elections.
- Protect election results from unauthorized modification.
- Ensure accountability through comprehensive audit logging.
- Maintain system reliability during election periods.
- Detect and respond to suspicious activities.
- Support secure recovery from unexpected failures.

---

### Confidentiality

The system shall preserve confidentiality by ensuring that:

- User credentials remain confidential.
- Passwords are never stored in plain text.
- Sensitive personal information is accessible only to authorized users.
- Anonymous ballots cannot be linked to voter identities.
- Administrative functions are restricted to authorized personnel.
- Secure communication channels are used for all sensitive transactions.

---

### Integrity

The system shall preserve data integrity by ensuring that:

- Election records cannot be modified without authorization.
- Every successful vote is permanently recorded.
- Duplicate voting is prevented.
- Unauthorized changes are rejected.
- Administrative actions are recorded within audit logs.
- Published election results remain immutable.
- Archived election records remain read-only.

---

### Availability

The system shall maintain availability by ensuring that:

- Eligible users can access the platform during election periods.
- Elections automatically open and close according to their configured schedules.
- Temporary failures do not permanently affect election operations.
- Critical services remain available during peak voting periods.
- Recovery procedures restore normal operation after unexpected failures.

---

### Election Integrity Principles

The Student Online Voting Platform shall enforce the following election integrity principles:

- One eligible student shall vote only once for each elective position.
- Every valid vote shall be counted exactly once.
- Ballot secrecy shall always be maintained.
- Anonymous ballots shall remain unlinkable to voter identities.
- Election results shall accurately reflect all valid votes.
- Every administrative action shall be traceable.
- Every election shall follow the approved workflow.
- Election records shall remain protected throughout their lifecycle.

---

### Security Design Principles

The security architecture shall be designed according to the following principles:

- Security shall be integrated into every component of the system.
- Access shall be granted only after successful authentication.
- Permissions shall be enforced before every protected operation.
- Sensitive operations shall require appropriate authorization.
- Security controls shall remain active throughout the election lifecycle.
- Security mechanisms shall minimize the impact of system failures.
- Every critical operation shall be auditable.

---

### Principle of Least Privilege (PoLP)

The system shall implement the Principle of Least Privilege by ensuring that:

- Every user receives only the permissions required for their assigned role.
- Permissions are granted only when necessary.
- Administrative privileges are restricted to authorized personnel.
- Users cannot perform operations outside their assigned responsibilities.
- Privileges are reviewed whenever user roles change.

---

### Defense in Depth

The system shall implement multiple layers of security by combining:

- User authentication.
- Role-based authorization.
- Database access control.
- Input validation.
- Secure communication.
- Audit logging.
- Error handling.
- System monitoring.

A failure of one security mechanism shall not compromise the overall security of the platform.

---

### Secure by Default

The system shall operate securely by default by ensuring that:

- New users receive only the minimum required permissions.
- Protected resources remain inaccessible unless explicitly authorized.
- Security features are enabled by default.
- Sensitive information is never exposed through default configurations.
- System components deny access unless permission has been explicitly granted.

---

### Zero Trust Principle

The system shall follow a Zero Trust approach by assuming that no user, device, or request is trusted automatically.

Accordingly, the system shall:

- Authenticate every user before granting access.
- Verify user permissions before every protected operation.
- Validate every request submitted to the system.
- Monitor security-related activities continuously.
- Reject unauthorized requests regardless of their origin.

This approach reduces the risk of unauthorized access and strengthens the overall security posture of the Student Online Voting Platform.

---

## 10.2 Authentication Architecture

### Purpose

The Student Online Voting Platform shall implement a secure authentication architecture to verify the identity of every authorized user before granting access to protected system resources.

The authentication architecture shall ensure that only eligible users can access the platform while protecting user accounts against unauthorized access, impersonation, credential theft, and other authentication-related threats.

---

### Authentication Process

The system shall authenticate users using their registered personal email address and password.

The authentication process shall:

- verify that the submitted email address belongs to a registered user.
- verify the submitted password.
- verify that the account status permits authentication.
- determine the authenticated user's assigned role.
- establish a secure authenticated session.
- redirect authenticated users to the appropriate dashboard based on their assigned role.

Access shall be denied whenever authentication requirements are not satisfied.

---

### Supported Authentication Method

The system shall support authentication using:

- Registered Personal Email Address
- Secure Password Authentication

All authorized users shall authenticate using the same authentication mechanism, while access to system resources shall be determined by the user's assigned role and permissions.

---

### Account Activation

The system shall require every student account to be activated before the student is permitted to access protected resources.

The account activation process shall ensure that:

- only students listed in the approved election voter register are eligible for account activation.
- students provide their registered personal email address and matriculation number during activation.
- the submitted information matches the imported election voter register.
- ownership of the registered personal email address is verified before activation is completed.
- each student account is activated only once.
- students create their own password during account activation.
- passwords are securely hashed before storage.
- successful activation changes the account status from **Pending Activation** to **Active**.

---

### Account Status Lifecycle

Every student account shall exist in one of the following states:

| Status | Description |
|---------|-------------|
| Pending Activation | Eligible student imported into the voter register but not yet activated. |
| Active | Student account has been verified and may access the platform. |
| Suspended | Account temporarily disabled by an authorized administrator. |
| Deactivated | Account permanently disabled from accessing the platform. |

The system shall ensure that:

- only Active accounts may successfully authenticate.
- Pending Activation accounts complete activation before login.
- Suspended accounts cannot access protected resources.
- Deactivated accounts remain inaccessible unless restored through an approved administrative process.
- every account status change is recorded in the audit log.

---

### Password Policy

The system shall enforce the following password requirements:

- passwords shall contain a minimum of eight (8) characters.
- passwords shall contain uppercase letters.
- passwords shall contain lowercase letters.
- passwords shall contain at least one numeric character.
- passwords shall contain at least one special character.
- passwords shall never be stored in plain text.
- passwords shall be securely hashed before storage.
- users shall authenticate before changing an existing password.

---

### Password Reset

The system shall provide a secure password reset mechanism.

The password reset process shall ensure that:

- only Active accounts may request password reset.
- password reset requests are associated with the registered personal email address.
- password reset links or verification codes expire after a limited period.
- password reset tokens are single-use.
- users create a new password after successful verification.

---

### Session Management

The system shall securely manage authenticated user sessions.

The system shall ensure that:

- sessions are created only after successful

---

## 10.3 Authorization and Access Control

### Purpose

The Student Online Voting Platform shall implement a comprehensive authorization and access control architecture to ensure that authenticated users can only perform actions permitted by their assigned roles and privileges.

The authorization architecture shall prevent unauthorized access to protected system resources while enforcing the Principle of Least Privilege and maintaining the integrity of election operations.

---

### Authorization Model

The system shall implement Role-Based Access Control (RBAC) as the primary authorization model.

The authorization model shall ensure that:

- every authenticated user is assigned one or more authorized roles.
- every role is associated with predefined permissions.
- permissions determine the actions a user may perform.
- authorization decisions are evaluated before every protected operation.
- unauthorized requests are denied by default.

---

### Role-Based Access Control

The system shall enforce Role-Based Access Control throughout the platform.

The RBAC implementation shall ensure that:

- permissions are assigned to roles rather than individual users.
- users inherit permissions through their assigned roles.
- administrative permissions are restricted to authorized administrative roles.
- users cannot grant permissions to themselves.
- role assignments are managed only by authorized administrators.

---

### Permission Evaluation

The system shall evaluate user permissions before allowing access to protected resources.

Permission evaluation shall ensure that:

- user identity has been successfully authenticated.
- the user account is in an Active status.
- the requested operation is permitted for the user's assigned role.
- the requested resource is accessible to the user's assigned role.
- unauthorized operations are rejected.

---

### Access Control Requirements

The system shall ensure that:

- users access only resources necessary for their assigned responsibilities.
- administrative functions are inaccessible to unauthorized users.
- students access only their own personal information.
- candidates access only functions related to their candidacy.
- Electoral Officers manage only election resources assigned to them.
- auditors have read-only access to authorized audit information.

---

### Protected System Resources

The following resources shall require authorization before access is granted:

- User Accounts
- Student Records
- Election Records
- Election Voter Registers
- Candidate Records
- Position Records
- Ballot Information
- Voting Functions
- Election Results
- Reports
- Audit Logs
- System Configuration

---

### Authorization Security Requirements

The authorization architecture shall ensure that:

- authorization is verified before every protected operation.
- authorization decisions are independent of the user interface.
- unauthorized requests are rejected regardless of their source.
- every authorization failure is handled securely.
- sensitive administrative operations are recorded

---

### Future Authorization Extensibility

The authorization architecture shall be designed to support additional authorization mechanisms as the platform evolves.

Future implementations may incorporate attribute-based authorization policies to enforce contextual access control based on factors such as:

- Election ownership.
- Department.
- Faculty.
- User status.
- Election state.
- Eligibility requirements.

These policies shall complement the Role-Based Access Control (RBAC) architecture without replacing it.

---

## 10.4 Data Protection and Encryption

### Purpose

The Student Online Voting Platform shall implement comprehensive data protection and encryption mechanisms to safeguard sensitive information against unauthorized access, disclosure, modification, and loss throughout the election lifecycle.

The data protection architecture shall ensure that confidential information remains protected while preserving the integrity and availability of election data.

---

### Data Protection Requirements

The system shall protect all sensitive information processed, transmitted, and stored within the platform.

The data protection architecture shall ensure that:

- sensitive information is accessible only to authorized users.
- confidential information is protected throughout its lifecycle.
- personal information is processed in accordance with approved security policies.
- election records remain protected against unauthorized disclosure.
- data protection controls apply consistently across all system modules.

---

### Password Protection

The system shall protect user passwords by ensuring that:

- passwords are never stored in plain text.
- passwords are securely hashed before storage.
- password hashes cannot be reversed to reveal the original password.
- password changes invalidate previous credentials where applicable.
- password storage follows current industry security standards.

---

### Encryption in Transit

The system shall protect information transmitted between users and the platform.

The system shall ensure that:

- all communication occurs through secure encrypted channels.
- authentication credentials are transmitted securely.
- session information is protected during transmission.
- sensitive election information is encrypted while in transit.
- unencrypted communication is not permitted.

---

### Encryption at Rest

The system shall protect sensitive information stored within the database.

The system shall ensure that:

- confidential information remains protected while stored.
- sensitive authentication information is securely stored.
- election records are protected against unauthorized access.
- stored information maintains confidentiality throughout its retention period.

---

### Sensitive Data Management

The system shall classify and protect sensitive information according to its importance.

Sensitive information shall include:

- User credentials
- Personal student information
- Election voter registers
- Candidate information
- Audit logs
- Election configuration
- Authentication records
- System configuration data

The system shall ensure that sensitive information is disclosed only to authorized users.

---

### Environment Variable Management

The system shall securely manage application configuration and secrets.

The system shall ensure that:

- sensitive configuration values are not hardcoded within the application.
- secret keys are securely managed.
- database credentials are protected.
- API keys remain confidential.
- production secrets are separated from development environments.

---

### Data Retention and Protection

The system shall retain election information according to institutional requirements.

The system shall ensure that:

- historical election records remain available for authorized review.
- archived information remains protected against modification.
- retained information preserves its integrity.
- unauthorized deletion of protected information is prevented.

---

### Data Protection Security Requirements

The data protection architecture shall ensure that:

- confidential information remains protected throughout the election lifecycle.
- encryption mechanisms follow accepted security standards.
- sensitive information is disclosed only to authorized users.
- protected information remains available only for legitimate purposes.
- all protection mechanisms support the integrity and credibility of election operations.

---

## 10.5 Audit Logging and Monitoring

### Purpose

The Student Online Voting Platform shall implement a comprehensive audit logging and monitoring architecture to record significant system activities, support accountability, facilitate security investigations, and maintain the integrity of election operations.

The audit logging architecture shall provide a reliable record of user activities and system events without compromising voter anonymity or election confidentiality.

---

### Audit Logging Requirements

The system shall maintain audit logs for security-related, administrative, and operational activities.

The audit logging architecture shall ensure that:

- significant system events are automatically recorded.
- audit records accurately reflect performed activities.
- audit logs remain protected against unauthorized modification.
- audit information is available only to authorized personnel.
- audit records support accountability and post-election review.

---

### Authentication Audit Logs

The system shall record authentication-related events, including:

- account activation.
- successful login.
- failed login attempts.
- password reset requests.
- password changes.
- account suspension.
- account reactivation.
- logout activities.

Authentication logs shall assist in detecting unauthorized access attempts and abnormal account activities.

---

### Administrative Audit Logs

The system shall record all administrative activities performed by authorized users.

Administrative events shall include:

- election creation.
- election modification.
- election deletion.
- election activation.
- election closure.
- voter register import.
- candidate approval.
- candidate rejection.
- position management.
- user role assignment.
- account suspension and reactivation.
- system configuration changes.

Every administrative action shall be traceable to the responsible authorized user.

---

### Voting Audit Logs

The system shall record election-related activities while preserving ballot secrecy.

The audit logging architecture shall ensure that:

- vote submission events are recorded.
- vote timestamps are recorded.
- election participation is recorded.
- duplicate voting attempts are recorded.
- rejected voting attempts are recorded.
- ballot contents remain anonymous.
- voter identities are never linked to ballot selections.

---

### System Monitoring

The system shall continuously monitor critical operational events.

Monitoring activities shall include:

- authentication failures.
- unauthorized access attempts.
- unexpected application errors.
- database failures.
- abnormal voting activities.
- suspicious administrative actions.
- system availability.

Monitoring information shall support timely detection of operational and security incidents.

---

### Audit Log Retention

The system shall securely retain audit logs for institutional review and compliance purposes.

The audit logging architecture shall ensure that:

- audit records remain available for authorized review.
- audit records cannot be altered without authorization.
- archived audit logs remain protected.
- audit information supports post-election investigations when required.

---

### Audit Log Security Requirements

The audit logging architecture shall ensure that:

- audit records are automatically generated.
- audit records accurately represent system activities.
- audit logs are protected against unauthorized modification.
- only authorized personnel may access audit logs.
- audit records preserve voter anonymity.
- audit logging remains active throughout the election lifecycle.
- every significant security event is recorded.

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