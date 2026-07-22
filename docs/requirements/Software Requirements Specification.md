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