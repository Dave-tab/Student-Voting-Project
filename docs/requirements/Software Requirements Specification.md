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