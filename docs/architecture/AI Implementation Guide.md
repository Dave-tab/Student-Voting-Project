# AI Implementation Guide

# Part A – Purpose & Project Context

## Purpose

The AI Implementation Guide establishes the standards, responsibilities, workflows, and engineering principles governing the use of Artificial Intelligence (AI) throughout the development of the Student Online Voting Platform.

This document serves as the authoritative reference for all AI-assisted implementation activities and ensures that every AI contributor operates within the approved project architecture, software requirements, business rules, and engineering standards.

The guide shall promote consistency, maintainability, security, and collaboration while preventing unauthorized architectural changes or deviations from approved project decisions.

---

## Project Overview

The Student Online Voting Platform is a secure, web-based election management system designed to facilitate transparent, reliable, and auditable student elections within educational institutions.

The platform shall support the complete election lifecycle, including election planning, voter registration, candidate management, voting, result publication, reporting, and election archiving.

The system is designed to provide election administrators with efficient election management tools while ensuring that eligible students can participate in free, fair, and secure elections.

---

## Project Objectives

The primary objectives of the Student Online Voting Platform are to:

- provide a secure and reliable online voting system.
- ensure election integrity throughout the election lifecycle.
- prevent unauthorized access and fraudulent voting.
- enforce one eligible vote per student for each position.
- preserve ballot secrecy and voter anonymity.
- provide accurate and transparent election results.
- maintain complete audit records for administrative activities.
- support scalability for future institutional expansion.
- ensure maintainability through modular software architecture.
- provide comprehensive documentation for future development.

---

## System Type

The Student Online Voting Platform is a web-based information system consisting of:

- Client Application (Frontend)
- Backend Services
- PostgreSQL Database
- Authentication Services
- Administrative Dashboard
- Student Voting Portal

The system follows a modular architecture to improve maintainability, scalability, and long-term sustainability.

---

## Approved Technology Stack

The approved technology stack for this project includes:

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Supabase

### Database

- PostgreSQL

### Authentication

- Supabase Authentication

### Version Control

- Git
- GitHub

---

## Development Methodology

The Student Online Voting Platform follows an Architecture-First Development methodology.

Under this methodology:

- software requirements shall be approved before implementation.
- architecture shall be approved before database engineering.
- database engineering shall be completed before frontend integration.
- implementation shall follow documented engineering standards.
- every sprint shall satisfy its Definition of Done before proceeding.
- every architectural decision shall be documented and reviewed.

Implementation shall proceed incrementally, with each sprint building upon previously approved work.

---

## Engineering Philosophy

Development of the Student Online Voting Platform shall be guided by the following engineering principles:

- Architecture before implementation.
- Security by design.
- Election Integrity Above All.
- Documentation before development.
- Incremental development.
- Continuous review and validation.
- Maintainability over complexity.
- Scalability by design.
- Consistency across all project artifacts.

These principles shall guide all architectural decisions, implementation activities, and quality assurance processes throughout the project lifecycle.

---

## Core Principle

The development of this project shall be governed by the following principle:

> **AI shall assist implementation, not replace architectural decision-making.**

Architectural decisions shall be made and approved by the Software Architect and reviewed by the Chief Architect before implementation begins.

Artificial Intelligence shall implement approved designs, generate technical artifacts, assist with engineering tasks, and support quality assurance, but shall not redefine the approved architecture, requirements, workflows, or security model without explicit instruction and formal approval.

This principle shall apply to every AI assistant contributing to the Student Online Voting Platform throughout its development lifecycle.

---

# Part B – AI Roles & Responsibilities

## Purpose

This section defines the roles, responsibilities, and boundaries of every participant involved in the development of the Student Online Voting Platform.

The purpose is to establish clear accountability, eliminate role ambiguity, and ensure that all implementation activities align with the approved software architecture and engineering standards.

Each participant shall operate only within their assigned responsibilities unless otherwise approved by the Software Architect.

---

## Project Participants

The Student Online Voting Platform shall be developed through collaboration between the following participants:

- Software Architect
- Chief Architect
- Database Engineer (AI)
- Future AI Contributors

Each participant performs a distinct role within the software development lifecycle.

---

## Software Architect

### Role

Project Owner and Software Architect.

### Responsibilities

The Software Architect shall:

- define project objectives.
- approve all software requirements.
- approve architectural decisions.
- review all AI-generated implementations.
- execute approved SQL scripts in Supabase.
- test every implementation before approval.
- maintain all project documentation.
- manage version control using Git and GitHub.
- approve sprint completion.
- approve milestone completion.
- make final implementation decisions.

### Authority

The Software Architect has the final authority over all technical, architectural, and implementation decisions.

No implementation shall be accepted without approval from the Software Architect.

---

## Chief Architect (ChatGPT)

### Role

Architecture Reviewer, Engineering Advisor, and Quality Assurance Lead.

### Responsibilities

The Chief Architect shall:

- review software architecture.
- review database architecture.
- validate engineering decisions.
- identify architectural weaknesses.
- recommend improvements.
- review SQL before execution.
- verify normalization.
- review security architecture.
- identify performance concerns.
- ensure consistency across documentation.
- verify compliance with approved business rules.
- challenge design decisions where necessary.
- assist in sprint planning.
- define engineering workflows.
- review milestone readiness.

### Authority

The Chief Architect provides architectural guidance and engineering recommendations but shall not override the approval authority of the Software Architect.

---

## Database Engineer (Claude)

### Role

AI Database Engineer and SQL Implementation Specialist.

### Responsibilities

The Database Engineer shall:

- generate PostgreSQL SQL scripts.
- implement approved database designs.
- create database tables.
- create primary keys.
- create foreign keys.
- create constraints.
- create indexes.
- create views.
- create triggers.
- create database functions.
- implement Row Level Security (RLS).
- implement security policies.
- generate sample data when requested.
- explain generated SQL.
- provide implementation notes.
- suggest implementation improvements without modifying approved architecture.

### Limitations

The Database Engineer shall not:

- redesign the approved architecture.
- introduce undocumented features.
- rename approved entities.
- remove approved business rules.
- modify engineering standards.
- alter security requirements.
- implement functionality outside the requested sprint.
- execute SQL on behalf of the Software Architect.

---

## Future AI Contributors

### Role

Specialized AI assistants supporting specific implementation tasks.

Examples include:

- Frontend Engineering AI
- UI/UX Design AI
- Testing AI
- Documentation AI
- DevOps AI

### Responsibilities

Future AI Contributors shall:

- implement only approved designs.
- follow the AI Implementation Guide.
- comply with engineering standards.
- respect project documentation.
- remain within the assigned sprint scope.
- produce maintainable and well-documented outputs.

Future AI Contributors shall operate under the supervision of the Software Architect.

---

## Responsibility Matrix

| Activity | Software Architect | Chief Architect | Database Engineer | Future AI Contributors |
|-----------|-------------------|-----------------|-------------------|-------------------------|
| Requirements Approval | ✅ | Review | ❌ | ❌ |
| Architecture Approval | ✅ | Review | ❌ | ❌ |
| Sprint Planning | ✅ | Assist | ❌ | ❌ |
| Database Design | ✅ | Review | Implement | ❌ |
| SQL Generation | Review | Review | ✅ | ❌ |
| SQL Review | ✅ | ✅ | Explain | ❌ |
| SQL Execution | ✅ | ❌ | ❌ | ❌ |
| Documentation | ✅ | Review | Assist | Assist |
| Testing | ✅ | Review | Assist | Assist |
| Git Management | ✅ | ❌ | ❌ | ❌ |
| Sprint Approval | ✅ | Recommend | ❌ | ❌ |
| Milestone Approval | ✅ | Recommend | ❌ | ❌ |

---

## Collaboration Principles

All participants shall adhere to the following collaboration principles:

- respect approved project documentation.
- communicate implementation assumptions clearly.
- operate only within assigned responsibilities.
- prioritize consistency over convenience.
- preserve election integrity at every stage.
- maintain complete documentation of engineering decisions.
- support continuous review and quality improvement.

---

## Guiding Principles

The collaboration between human participants and AI assistants shall be governed by the following principles:

> **AI shall assist implementation, not replace architectural decision-making.**

> **Every implementation shall be traceable to an approved requirement, business rule, architectural decision, or documented engineering standard.**

These principles shall govern every implementation activity performed throughout the development lifecycle of the Student Online Voting Platform.

---

# Part C – AI Engineering Rules

## Purpose

This section establishes the mandatory engineering rules governing all AI-assisted contributions to the Student Online Voting Platform.

These rules ensure that every AI-generated implementation remains consistent with the approved Software Requirements Specification (SRS), Software Architecture, Database Architecture, Business Rules, Security Requirements, and Engineering Standards.

All AI contributors shall comply with these rules throughout the software development lifecycle.

---

## Rule 1 – Architecture Preservation

AI shall implement only the approved software architecture.

AI shall not redesign, replace, or restructure any approved architectural component unless explicitly instructed and approved by the Software Architect.

---

## Rule 2 – Requirements Compliance

Every implementation shall satisfy the approved Software Requirements Specification (SRS).

No functionality shall be introduced unless it can be traced to an approved requirement.

---

## Rule 3 – Business Rule Compliance

Every implementation shall enforce the approved business rules.

AI shall neither remove nor weaken any documented business rule.

Where multiple business rules apply, all applicable rules shall be implemented together.

---

## Rule 4 – Security First

Security shall never be treated as an optional enhancement.

Every implementation shall preserve:

- authentication requirements.
- authorization requirements.
- election integrity.
- ballot secrecy.
- voter anonymity.
- audit logging.
- data integrity.

AI shall not introduce any implementation that weakens the approved security architecture.

---

## Rule 5 – Scope Control

AI shall implement only the requested sprint, part, or task.

AI shall not generate additional modules, tables, APIs, or features outside the approved scope.

Future work shall remain within future sprints.

---

## Rule 6 – Documentation Before Implementation

AI shall review all relevant project documentation before generating any implementation.

Implementation shall be based on:

- Software Requirements Specification.
- Software Architecture.
- Database Architecture.
- Business Rules.
- Sprint Package.
- Engineering Standards.

Implementation shall never rely on assumptions where documentation already exists.

---

## Rule 7 – Traceability

Every implementation shall be traceable to an approved requirement, business rule, architectural decision, or documented engineering standard.

AI shall clearly identify the documented basis for significant implementation decisions whenever appropriate.

---

## Rule 8 – No Architectural Assumptions

When uncertainty exists, AI shall ask for clarification rather than make architectural assumptions.

AI shall never invent missing requirements, relationships, workflows, permissions, or security policies.

Clarification shall always take precedence over assumption.

---

## Rule 9 – Preserve Naming Standards

AI shall comply with the approved naming conventions for:

- database tables.
- columns.
- constraints.
- indexes.
- functions.
- triggers.
- views.
- APIs.
- documentation.

Approved names shall not be changed without authorization from the Software Architect.

---

## Rule 10 – Preserve Data Integrity

Every implementation shall prioritize data integrity.

AI shall ensure that:

- primary keys are correctly defined.
- foreign keys enforce relationships.
- constraints prevent invalid data.
- duplicate records are prevented where applicable.
- referential integrity is maintained.

---

## Rule 11 – Incremental Development

Implementation shall proceed incrementally.

AI shall focus on completing one sprint before moving to the next.

Previously approved work shall not be modified unless explicitly requested.

---

## Rule 12 – Explain Every Implementation

AI shall accompany every generated implementation with a clear explanation.

The explanation shall include:

- implementation purpose.
- important design decisions.
- security considerations.
- assumptions (if any).
- testing recommendations.

Generated code shall never be delivered without context.

---

## Rule 13 – Engineering Quality

Every implementation shall emphasize:

- readability.
- maintainability.
- scalability.
- consistency.
- performance.
- security.
- simplicity where appropriate.

AI shall avoid unnecessary complexity.

---

## Rule 14 – Respect Human Authority

The Software Architect shall retain final authority over all technical decisions.

The Chief Architect shall review and recommend improvements.

AI shall support engineering decisions but shall not replace human judgment.

---

## Rule 15 – Continuous Improvement

AI may recommend improvements that enhance:

- performance.
- security.
- maintainability.
- scalability.
- usability.

However, recommendations shall not be implemented automatically.

All proposed improvements shall require review and approval before adoption.

---

## Governing Principles

The following principles shall govern all AI-assisted implementation activities throughout the project:

> **AI shall assist implementation, not replace architectural decision-making.**

> **Every implementation shall be traceable to an approved requirement, business rule, architectural decision, or documented engineering standard.**

> **When uncertainty exists, AI shall ask for clarification rather than make architectural assumptions.**

These principles shall take precedence over convenience, assumptions, or undocumented implementation decisions.

---

# Part D – SQL Engineering Standards

## Purpose

This section establishes the SQL engineering standards for the Student Online Voting Platform.

All SQL generated for this project shall comply with these standards to ensure consistency, maintainability, security, scalability, and performance throughout the database lifecycle.

These standards shall apply to all database objects, including tables, constraints, indexes, functions, triggers, views, and Row Level Security (RLS) policies.

---

## Database Platform

The approved database platform for this project is PostgreSQL running on Supabase.

All SQL generated for this project shall be fully compatible with PostgreSQL and Supabase.

AI shall not generate SQL intended for other database management systems unless explicitly instructed.

---

## Naming Conventions

All database objects shall follow a consistent snake_case naming convention.

Examples include:

- table names
- column names
- primary keys
- foreign keys
- constraints
- indexes
- views
- functions
- triggers
- policies

Names shall be meaningful, descriptive, and consistent throughout the project.

Abbreviations shall be avoided unless they are widely recognized and documented.

---

## Table Standards

Each table shall:

- represent a single logical entity.
- contain a clearly defined primary key.
- include only attributes belonging to that entity.
- avoid duplicate or redundant data.
- support future scalability.
- comply with the approved database architecture.

Every table shall be normalized before implementation.

---

## Primary Key Standards

Every table shall contain a single primary key.

Primary keys shall:

- uniquely identify each record.
- remain immutable after creation.
- never contain business data.
- be suitable for referencing by foreign keys.

The approved primary key strategy shall be used consistently throughout the project.

---

## Foreign Key Standards

Foreign keys shall enforce relationships between related tables.

Foreign keys shall:

- preserve referential integrity.
- prevent orphan records.
- reflect the approved Entity Relationship Diagram (ERD).
- support the approved business rules.

Relationships shall never be implemented without appropriate foreign key constraints.

---

## Constraint Standards

Database constraints shall be used to enforce data integrity.

Where applicable, AI shall implement:

- NOT NULL constraints
- UNIQUE constraints
- CHECK constraints
- PRIMARY KEY constraints
- FOREIGN KEY constraints

Business rules shall be enforced at the database level whenever appropriate.

---

## Index Standards

Indexes shall be created only where they improve query performance.

Indexes shall typically be applied to:

- primary keys
- foreign keys
- frequently searched columns
- frequently filtered columns
- columns used in joins

Duplicate or unnecessary indexes shall be avoided.

---

## View Standards

Views shall simplify data retrieval without duplicating stored data.

Views shall:

- represent meaningful business information.
- avoid unnecessary complexity.
- support reporting requirements.
- improve readability of common queries.

Views shall not replace proper table design.

---

## Function Standards

Database functions shall encapsulate reusable database logic.

Functions shall:

- perform a single logical responsibility.
- be clearly documented.
- validate input where appropriate.
- support approved business rules.
- avoid unnecessary complexity.

Functions shall not duplicate application logic unless database enforcement is required.

---

## Trigger Standards

Triggers shall be used only when automatic database actions are necessary.

Triggers may be used to:

- enforce business rules.
- maintain audit logs.
- update derived values.
- validate critical operations.
- preserve database integrity.

Triggers shall remain simple, predictable, and well documented.

---

## Row Level Security (RLS) Standards

Row Level Security shall be enabled on every table containing protected data.

RLS policies shall:

- implement the approved authorization model.
- follow the Principle of Least Privilege.
- prevent unauthorized access.
- preserve election integrity.
- protect confidential information.

Security shall never rely solely on frontend validation.

---

## Performance Standards

Generated SQL shall prioritize:

- efficient queries.
- normalized design.
- appropriate indexing.
- minimal redundancy.
- scalable structures.
- maintainable schema design.

Performance optimizations shall never compromise security or data integrity.

---

## SQL Documentation Standards

Every SQL script generated by AI shall include:

- implementation purpose.
- explanation of major objects.
- assumptions made.
- dependencies.
- testing recommendations.

Complex SQL shall be accompanied by explanatory notes where necessary.

---

## SQL Review Requirement

No SQL generated by AI shall be executed immediately.

Every SQL script shall first undergo a formal SQL Design Review conducted by the Software Architect and Chief Architect.

The review shall verify:

- compliance with approved architecture.
- compliance with business rules.
- normalization.
- naming conventions.
- security.
- performance.
- maintainability.
- documentation quality.

Only SQL that successfully passes the SQL Design Review shall be approved for execution in Supabase.

---

## Engineering Principles

All SQL generated for the Student Online Voting Platform shall adhere to the following principles:

- correctness before speed.
- security before convenience.
- consistency before creativity.
- maintainability before complexity.
- traceability before implementation.
- documentation before deployment.

These principles shall guide every database implementation throughout the project lifecycle.

---

# Part E – Documentation Standards

## Purpose

This section establishes the documentation standards governing all AI-assisted contributions to the Student Online Voting Platform.

Comprehensive documentation shall accompany every implementation to ensure maintainability, traceability, knowledge transfer, and long-term sustainability of the project.

Documentation shall be treated as an integral part of software development and shall be updated alongside implementation activities.

---

## Documentation Philosophy

Documentation shall be created before, during, and after implementation.

Every significant engineering decision, implementation, and review shall be documented to preserve the project's technical knowledge and architectural consistency.

Documentation shall always reflect the current approved state of the project.

---

## Documentation Principles

All documentation shall be:

- accurate.
- complete.
- consistent.
- maintainable.
- traceable.
- easy to understand.
- professionally written.

Documentation shall never contradict approved project requirements or architectural decisions.

---

## Implementation Documentation

Every implementation generated by AI shall include:

- implementation objective.
- implementation scope.
- explanation of major components.
- important engineering decisions.
- security considerations.
- assumptions made.
- dependencies.
- testing recommendations.

AI shall explain not only *what* was implemented, but also *why* it was implemented.

---

## Change Documentation

Whenever an implementation modifies an approved design, the following shall be documented:

- reason for the change.
- affected components.
- architectural impact.
- security impact.
- required documentation updates.

No undocumented architectural change shall be considered approved.

---

## Documentation Consistency

AI shall ensure consistency across all project documentation.

Before generating implementation, AI shall review relevant project documents to avoid:

- conflicting terminology.
- duplicated requirements.
- inconsistent workflows.
- contradictory architectural decisions.
- outdated references.

Consistency shall take precedence over convenience.

---

## Traceability

Every implementation shall be traceable to one or more of the following:

- approved functional requirements.
- approved non-functional requirements.
- approved business rules.
- approved architecture.
- approved engineering standards.
- approved security requirements.

AI shall maintain clear alignment between implementation and documentation.

---

## Documentation Review

Documentation shall undergo review before implementation proceeds.

The review shall verify:

- completeness.
- consistency.
- clarity.
- architectural alignment.
- compliance with engineering standards.

Documentation shall be updated whenever implementation introduces approved changes.

---

## Version Control Documentation

All documentation changes shall be tracked using Git.

Every completed sprint shall include:

- documentation update.
- Development Journal update.
- Git status verification.
- Git commit.
- GitHub push.
- repository cleanliness verification.

Documentation history shall remain available through version control.

---

## Documentation Deliverables

Every sprint shall produce documentation appropriate to its objectives.

Typical deliverables include:

- requirements updates.
- architecture updates.
- database documentation.
- security documentation.
- testing documentation.
- implementation notes.
- Development Journal entries.

Documentation shall be completed before a sprint is considered finished.

---

## Engineering Principles

Documentation shall follow the following principles:

- documentation before implementation.
- documentation evolves with the project.
- documentation is part of the deliverable.
- documentation supports future maintenance.
- documentation preserves architectural knowledge.

Well-maintained documentation shall remain one of the project's primary engineering assets.

---

# Part F – AI Implementation Workflow

## Purpose

This section defines the mandatory implementation workflow governing all AI-assisted development activities for the Student Online Voting Platform.

The workflow establishes a structured engineering process that ensures every implementation is reviewed, validated, tested, documented, and approved before becoming part of the system.

All project participants shall follow this workflow throughout the software development lifecycle.

---

## Implementation Philosophy

The Student Online Voting Platform shall be developed using an Architecture-First and Documentation-Driven methodology.

Implementation shall proceed incrementally, with each sprint building upon previously approved work.

No implementation shall bypass the established engineering workflow.

---

## Standard AI Implementation Workflow

Every implementation shall follow the sequence below:

1. Review Approved Documentation.
2. Prepare the Sprint Implementation Package.
3. Review the Sprint Package.
4. Generate Implementation using AI.
5. Perform SQL Design Review.
6. Approve Implementation.
7. Execute Implementation.
8. Perform Functional Testing.
9. Perform Security Validation.
10. Update Project Documentation.
11. Update Development Journal.
12. Review Git Status.
13. Commit Changes.
14. Push Changes to GitHub.
15. Verify Repository Status.
16. Proceed to the Next Sprint.

Every step shall be completed before the next step begins.

---

## Workflow Stage 1 – Documentation Review

Before implementation begins, AI shall review all relevant approved documentation.

Depending on the sprint, this may include:

- Software Requirements Specification (SRS)
- Software Architecture
- Database Architecture
- API Specification
- Business Rule Mapping
- Security Checklist
- Testing Checklist
- Architecture Decision Log
- Sprint Implementation Template

Implementation shall never begin without sufficient project context.

---

## Workflow Stage 2 – Sprint Implementation Package

Before generating implementation, a Sprint Implementation Package shall be prepared.

The package shall contain:

- Sprint Goal
- Relevant SRS
- Relevant Architecture
- Relevant Business Rules
- Database Design
- Expected Deliverables
- Things AI Must Not Change
- Implementation Request
- Review Checklist

The Sprint Package shall define the implementation scope.

---

## Workflow Stage 3 – AI Implementation

After receiving the approved Sprint Package, AI shall generate only the requested implementation.

AI shall:

- remain within scope.
- follow engineering standards.
- preserve approved architecture.
- explain generated implementation.
- identify dependencies.
- recommend testing activities.

AI shall not generate unrelated components.

---

## Workflow Stage 4 – SQL Design Review

No SQL implementation shall be executed immediately after generation.

Every SQL implementation shall undergo a formal SQL Design Review.

The review shall verify:

- architecture compliance.
- business rule compliance.
- normalization.
- naming conventions.
- constraints.
- indexes.
- security.
- performance.
- maintainability.
- documentation quality.

Only approved SQL shall proceed to execution.

---

## Workflow Stage 5 – Implementation Execution

The Software Architect shall execute approved SQL within the Supabase PostgreSQL environment.

Execution shall occur only after successful completion of the SQL Design Review.

Implementation shall follow the approved execution order.

---

## Workflow Stage 6 – Testing

Following execution, implementation shall be tested.

Testing shall verify:

- successful execution.
- relationship integrity.
- constraint enforcement.
- business rule enforcement.
- security.
- performance.
- expected functionality.

Issues identified during testing shall be resolved before sprint approval.

---

## Workflow Stage 7 – Documentation Update

Upon successful testing, all affected documentation shall be updated.

Documentation updates may include:

- Database Architecture
- Security Checklist
- Testing Checklist
- API Specification
- Architecture Decision Log

Documentation shall accurately reflect the implemented system.

---

## Workflow Stage 8 – Development Journal

Each completed sprint shall be recorded in the Development Journal.

The journal entry shall include:

- sprint goal.
- work completed.
- key engineering decisions.
- deliverables.
- sprint outcome.

The Development Journal shall provide a chronological history of project development.

---

## Workflow Stage 9 – Version Control

Following documentation updates, the Software Architect shall perform version control activities.

The required sequence shall be:

1. Check Git Status.
2. Stage Changes.
3. Commit Changes.
4. Push to GitHub.
5. Verify Repository Cleanliness.

Every sprint shall conclude with a clean repository.

---

## Workflow Stage 10 – Sprint Approval

A sprint shall only be considered complete when:

- implementation is approved.
- testing is complete.
- documentation is updated.
- Development Journal is updated.
- GitHub contains the latest approved work.
- repository status is clean.
- Definition of Done has been satisfied.

Only then shall development proceed to the next sprint.

---

## Engineering Workflow Summary

The complete engineering workflow for this project shall be:

Documentation

↓

Sprint Implementation Package

↓

Architecture Review

↓

AI Implementation

↓

SQL Design Review

↓

Approval

↓

Supabase Execution

↓

Testing

↓

Documentation Update

↓

Development Journal

↓

Git Status

↓

Commit

↓

Push

↓

Verify Clean Repository

↓

Next Sprint

---

## Guiding Principles

The AI Implementation Workflow shall be governed by the following principles:

> **Architecture before implementation.**

> **Documentation before development.**

> **Review before execution.**

> **Testing before approval.**

> **Version control before completion.**

> **Every implementation shall be traceable to an approved requirement, business rule, architectural decision, or documented engineering standard.**

These principles shall apply to every implementation performed throughout the development of the Student Online Voting Platform.

---

# Part G – Prompt Engineering Standards

## Purpose

This section establishes the prompt engineering standards governing all interactions with Artificial Intelligence (AI) throughout the development of the Student Online Voting Platform.

The objective is to ensure that every AI-generated implementation is accurate, consistent, traceable, and fully aligned with the approved project documentation.

Prompt quality shall be considered a critical factor in the quality of AI-generated outputs.

---

## Prompt Engineering Philosophy

AI shall not be expected to infer undocumented project requirements.

Every prompt shall provide sufficient context for the assigned task while remaining within the approved implementation scope.

Prompt engineering shall emphasize clarity, completeness, and architectural consistency over brevity.

---

## Prompt Structure

Every implementation request submitted to AI shall follow the approved Sprint Implementation Package.

The Sprint Implementation Package shall contain:

- Sprint Information
- Sprint Goal
- Relevant Software Requirements Specification (SRS)
- Relevant Architecture
- Relevant Business Rules
- Database Design
- Expected Deliverables
- Things AI Must Not Change
- Implementation Request
- SQL Review Checklist

No implementation request shall omit these components unless they are not applicable to the assigned task.

---

## Required Project Context

Before requesting implementation, sufficient project context shall be provided.

Context may include:

- approved software requirements.
- approved software architecture.
- approved database architecture.
- approved business rules.
- engineering standards.
- security requirements.
- architecture decision log.
- sprint objectives.

AI shall never be required to reconstruct project context from previous conversations.

---

## Scope Definition

Every prompt shall clearly define the scope of implementation.

The prompt shall specify:

- the milestone.
- the sprint.
- the part.
- the implementation objective.
- the expected deliverables.

AI shall implement only the approved scope.

---

## Architecture Preservation

Prompts shall explicitly instruct AI to preserve the approved architecture.

Every implementation request shall clearly state that AI shall:

- implement approved designs.
- avoid redesigning the architecture.
- avoid introducing undocumented features.
- avoid modifying approved engineering decisions.
- remain within the assigned sprint.

---

## Clarification Requirements

When documentation is incomplete or ambiguous, AI shall request clarification before implementation.

AI shall not:

- invent missing requirements.
- assume undocumented workflows.
- infer security policies.
- create undocumented relationships.

Clarification shall always take precedence over assumption.

---

## Implementation Requirements

Every implementation prompt shall specify the expected implementation.

Examples include:

- SQL generation.
- database schema.
- triggers.
- functions.
- Row Level Security (RLS).
- policies.
- indexes.
- documentation.
- testing scripts.

Expected outputs shall be explicitly identified before implementation begins.

---

## Explanation Requirements

AI shall accompany every implementation with:

- implementation overview.
- engineering rationale.
- security considerations.
- assumptions (if any).
- dependencies.
- testing recommendations.
- implementation notes.

Generated code shall always be supported by appropriate technical explanations.

---

## Prompt Quality Standards

Every prompt shall be:

- complete.
- unambiguous.
- consistent.
- traceable.
- focused.
- technically accurate.

Prompt quality shall directly influence implementation quality.

---

## Mandatory Prompt Rule

Every AI prompt shall provide sufficient context to complete the assigned task without requiring assumptions beyond the approved project documentation.

This principle shall apply to every AI interaction throughout the project lifecycle.

---

## Standard Prompt Workflow

Every implementation request shall follow the sequence below:

1. Review approved documentation.
2. Prepare the Sprint Implementation Package.
3. Verify project context.
4. Define implementation scope.
5. Submit the implementation request.
6. Review AI-generated output.
7. Conduct SQL Design Review (where applicable).
8. Approve implementation.
9. Execute implementation.
10. Test implementation.
11. Update documentation.
12. Complete version control activities.

---

## Engineering Principles

Prompt engineering for the Student Online Voting Platform shall be governed by the following principles:

- context before implementation.
- clarity before complexity.
- architecture before automation.
- review before execution.
- documentation before deployment.
- correctness before speed.

Every prompt shall contribute to the consistency, security, maintainability, and long-term success of the project.

---

# Part H – SQL Design Review Checklist

## Purpose

This section establishes the mandatory SQL Design Review process for the Student Online Voting Platform.

No SQL generated by AI shall be executed directly within the PostgreSQL database.

Every SQL implementation shall undergo a structured review to verify its correctness, security, maintainability, performance, and compliance with the approved project architecture.

The SQL Design Review serves as the final engineering quality gate before implementation.

---

## SQL Design Review Philosophy

SQL implementation shall be reviewed as an engineering artifact rather than simply executable code.

The objective of the review is not only to determine whether the SQL executes successfully, but also whether it faithfully implements the approved software architecture, business rules, security requirements, and engineering standards.

Correctness, maintainability, and security shall always take precedence over implementation speed.

---

## Layered SQL Review Process

Every SQL implementation shall undergo the following five review checkpoints before approval.

The checkpoints shall be completed sequentially.

Failure at any checkpoint shall require revision before progressing to the next review stage.

---

# Review Checkpoint 1 – Architecture Review

## Objective

Verify that the SQL faithfully implements the approved database architecture.

### Review Questions

- Does the SQL implement the approved design?
- Are the correct tables being created?
- Are relationships consistent with the ERD?
- Are approved entities preserved?
- Has the architecture remained unchanged?
- Does the implementation remain within the sprint scope?

### Expected Outcome

The SQL accurately reflects the approved architecture without introducing unauthorized structural changes.

---

# Review Checkpoint 2 – Data Integrity Review

## Objective

Verify that the SQL preserves database integrity.

### Review Questions

- Are primary keys correctly defined?
- Are foreign keys correctly implemented?
- Are relationships properly enforced?
- Are NOT NULL constraints appropriate?
- Are UNIQUE constraints correctly applied?
- Are CHECK constraints enforcing business rules?
- Can invalid or inconsistent data enter the database?

### Expected Outcome

The database structure protects the integrity, consistency, and reliability of stored information.

---

# Review Checkpoint 3 – Security Review

## Objective

Verify that the SQL satisfies all approved security requirements.

### Review Questions

- Are security requirements preserved?
- Is Row Level Security (RLS) properly implemented?
- Are database policies correctly defined?
- Does the implementation support the Principle of Least Privilege?
- Are unauthorized operations prevented?
- Does the SQL preserve election integrity?
- Does the SQL protect confidential information?

### Expected Outcome

The implementation maintains the approved security architecture and protects sensitive data from unauthorized access.

---

# Review Checkpoint 4 – Performance Review

## Objective

Verify that the implementation supports efficient database performance.

### Review Questions

- Are indexes applied appropriately?
- Is the schema properly normalized?
- Have unnecessary indexes been avoided?
- Are relationships optimized?
- Can common queries execute efficiently?
- Does the implementation support future scalability?

### Expected Outcome

The implementation provides acceptable performance while maintaining scalability and data integrity.

---

# Review Checkpoint 5 – Maintainability Review

## Objective

Verify that the SQL can be understood, maintained, and extended throughout the project's lifecycle.

### Review Questions

- Does the SQL follow approved naming conventions?
- Is the implementation readable?
- Are SQL statements logically organized?
- Is the implementation well documented?
- Can future developers understand the design?
- Does the implementation follow project engineering standards?

### Expected Outcome

The SQL is maintainable, consistent, and suitable for long-term development.

---

## SQL Review Outcome

Upon completion of all five review checkpoints, the SQL implementation shall be assigned one of the following outcomes:

### Approved

The SQL satisfies all review requirements and is approved for execution.

---

### Approved with Minor Revisions

The SQL requires minor improvements that do not affect the approved architecture or business rules.

Execution may proceed after the identified revisions have been completed and verified.

---

### Revision Required

The SQL contains issues affecting architecture, security, integrity, or maintainability.

The implementation shall be corrected and resubmitted for review before execution.

---

### Rejected

The SQL does not comply with the approved architecture or engineering standards.

The implementation shall not proceed until a compliant version has been produced.

---

## SQL Design Review Checklist

Every SQL implementation shall satisfy the following checklist before approval:

### Architecture

- Approved architecture implemented.
- Sprint scope respected.
- No unauthorized entities introduced.

### Data Integrity

- Primary keys verified.
- Foreign keys verified.
- Constraints verified.
- Relationships verified.

### Security

- Authentication requirements preserved.
- Authorization requirements preserved.
- RLS implemented where required.
- Policies verified.

### Performance

- Indexes reviewed.
- Normalization verified.
- Query efficiency considered.
- Scalability reviewed.

### Maintainability

- Naming conventions followed.
- SQL documented.
- Engineering standards followed.
- Readability verified.

---

## Approval Requirement

SQL implementation shall not be executed until:

- the SQL Design Review has been completed.
- all review checkpoints have passed.
- the Software Architect has approved the implementation.
- the Chief Architect has completed the architectural review.

Only approved SQL shall be executed within the Supabase PostgreSQL environment.

---

## Engineering Principles

The SQL Design Review shall be governed by the following principles:

- architecture before execution.
- data integrity before convenience.
- security before functionality.
- performance before optimization shortcuts.
- maintainability before complexity.
- correctness before speed.

The SQL Design Review represents the final quality assurance gate before database implementation.

---

# Part I – AI Quality Assurance

## Purpose

This section establishes the quality assurance standards governing all AI-assisted contributions to the Student Online Voting Platform.

Quality Assurance (QA) ensures that every implementation satisfies the approved software requirements, architecture, business rules, security standards, engineering principles, and project documentation before it is accepted.

Quality shall be considered a continuous engineering activity rather than a final development stage.

---

## Quality Assurance Philosophy

The objective of AI Quality Assurance is to ensure that every implementation is correct, secure, maintainable, consistent, and fully aligned with the approved project architecture.

Quality shall be verified through systematic review, testing, documentation, and validation rather than assumptions.

Every implementation shall demonstrate evidence of compliance before approval.

---

## Quality Objectives

The AI Quality Assurance process shall ensure that every implementation:

- satisfies approved functional requirements.
- satisfies approved non-functional requirements.
- complies with approved business rules.
- preserves database integrity.
- maintains system security.
- follows engineering standards.
- remains maintainable.
- supports future scalability.
- is fully documented.
- is properly tested before approval.

---

## Quality Standards

Every AI-generated implementation shall satisfy the following quality standards.

### Functional Correctness

The implementation shall perform the intended functionality exactly as defined by the approved requirements.

---

### Architectural Compliance

The implementation shall conform to the approved software architecture and database architecture without unauthorized modifications.

---

### Business Rule Compliance

Every applicable business rule shall be implemented accurately and completely.

No approved business rule shall be omitted or weakened.

---

### Security Compliance

The implementation shall preserve:

- authentication.
- authorization.
- election integrity.
- ballot secrecy.
- voter anonymity.
- audit logging.
- data confidentiality.

Security requirements shall never be compromised.

---

### Documentation Compliance

Documentation shall remain complete, accurate, and synchronized with the implemented system.

Every implementation shall be supported by appropriate documentation updates.

---

### Engineering Compliance

The implementation shall comply with all approved engineering standards, including:

- naming conventions.
- SQL standards.
- documentation standards.
- implementation workflow.
- prompt engineering standards.

---

## Quality Verification Process

Quality shall be verified through the following activities:

1. Documentation Review.
2. Architecture Review.
3. SQL Design Review.
4. Functional Testing.
5. Security Validation.
6. Performance Review.
7. Documentation Verification.
8. Final Approval.

Completion of implementation alone shall not constitute successful quality assurance.

---

## Evidence-Based Verification

Quality shall be verified through objective evidence.

Evidence may include:

- successful testing.
- SQL Design Review results.
- architecture review results.
- documentation updates.
- business rule verification.
- security verification.
- performance validation.
- Git history.

Evidence shall support every approval decision.

---

## Quality Metrics

The following quality characteristics shall be evaluated during implementation reviews:

- correctness.
- completeness.
- consistency.
- maintainability.
- scalability.
- readability.
- security.
- traceability.
- performance.
- testability.

Each implementation shall demonstrate an acceptable level of quality across these characteristics.

---

## Quality Approval Criteria

An implementation shall only be approved when:

- all applicable reviews have been completed.
- all critical issues have been resolved.
- testing has been successfully completed.
- documentation has been updated.
- Development Journal has been updated.
- Definition of Done has been satisfied.
- approval has been granted by the Software Architect.

Only approved implementations shall become part of the project.

---

## Continuous Quality Improvement

Quality Assurance shall be treated as an ongoing engineering activity.

Lessons learned during implementation shall be used to improve:

- engineering standards.
- documentation.
- workflows.
- prompt engineering.
- review processes.
- implementation quality.

Continuous improvement shall strengthen future project development.

---

## Governing Quality Principles

AI Quality Assurance shall be governed by the following principles:

> **Correctness shall always take precedence over speed.**

> **Quality shall be verified through evidence, not assumed through successful execution.**

> **Every implementation shall be traceable to an approved requirement, business rule, architectural decision, or documented engineering standard.**

> **AI shall assist implementation, not replace architectural decision-making.**

These principles shall guide every review, approval, and implementation decision throughout the development lifecycle of the Student Online Voting Platform.

---

# Part J – Future AI Contributors Guide

## Purpose

This section provides onboarding guidance for future Artificial Intelligence (AI) contributors participating in the development of the Student Online Voting Platform.

Its purpose is to ensure that every future AI assistant understands the project's engineering philosophy, approved architecture, documentation standards, implementation workflow, and quality expectations before contributing to the project.

All future AI contributors shall comply with this AI Implementation Guide throughout the software development lifecycle.

---

## Welcome to the Project

The Student Online Voting Platform is being developed using an Architecture-First, Documentation-Driven, and Quality-Oriented engineering methodology.

Every component of the system has been intentionally designed through structured planning, documentation, review, and approval before implementation.

As an AI contributor, your responsibility is to support implementation while preserving the integrity of the approved project architecture.

---

## Required Reading

Before contributing to the project, every AI assistant shall review the following documents where applicable:

- Software Requirements Specification (SRS)
- Software Architecture
- Database Architecture
- API Specification
- AI Implementation Guide
- Sprint Implementation Template
- Business Rule Mapping
- Security Checklist
- Testing Checklist
- Architecture Decision Log
- Development Journal

Implementation shall not begin without sufficient project context.

---

## Contribution Expectations

Every AI contributor shall:

- implement only approved designs.
- preserve the approved software architecture.
- comply with documented engineering standards.
- follow the approved implementation workflow.
- maintain consistency across documentation.
- explain generated implementations.
- remain within the assigned sprint scope.
- recommend improvements without implementing them automatically.

---

## Collaboration Expectations

Future AI contributors shall collaborate respectfully with all project participants.

AI contributors shall:

- support the Software Architect.
- respect the Chief Architect's engineering guidance.
- communicate assumptions clearly.
- request clarification when documentation is incomplete.
- avoid architectural assumptions.
- prioritize project consistency over implementation speed.

Collaboration shall strengthen the quality of the project rather than introduce conflicting decisions.

---

## Change Management

Future AI contributors shall not modify:

- approved software requirements.
- approved architecture.
- approved business rules.
- approved engineering standards.
- approved security requirements.
- approved workflows.

Any proposed improvement shall first be presented as a recommendation.

Implementation shall occur only after approval from the Software Architect.

---

## Continuous Improvement

The Student Online Voting Platform is expected to evolve throughout its development lifecycle.

Future AI contributors are encouraged to recommend improvements relating to:

- security.
- maintainability.
- scalability.
- performance.
- usability.
- documentation.
- engineering quality.

Recommendations shall always preserve the approved architecture unless an approved architectural revision is made.

---

# Project Engineering Charter

The Student Online Voting Platform shall be developed in accordance with the following engineering commitments:

> **Architecture is approved before implementation.**

> **Security is designed, not added later.**

> **Documentation evolves with implementation.**

> **Quality is verified through evidence, not assumed through successful execution.**

> **Every implementation shall be traceable to an approved requirement, business rule, architectural decision, or documented engineering standard.**

> **AI shall assist implementation, not replace architectural decision-making.**

> **When uncertainty exists, AI shall ask for clarification rather than make architectural assumptions.**

> **Correctness shall always take precedence over speed.**

> **Every sprint leaves the project in a better state than it found it.**

These commitments represent the engineering culture of the Student Online Voting Platform and shall guide every participant throughout the project's lifecycle.

---

## Conclusion

The AI Implementation Guide establishes the standards, responsibilities, workflows, and engineering principles governing all AI-assisted contributions to the Student Online Voting Platform.

Compliance with this guide ensures that every implementation remains secure, consistent, maintainable, scalable, and aligned with the approved project architecture.

This guide shall serve as the authoritative reference for all present and future AI contributors throughout the development and maintenance of the Student Online Voting Platform.