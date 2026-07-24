# Sprint 2 – Implementation Package

## Purpose

This document serves as the official implementation package for Milestone 2 – Sprint 2.

It translates the approved architecture into a controlled implementation specification for SQL generation.

This package is the only implementation specification that shall be provided to Claude for SQL generation.

Implementation shall remain consistent with the approved Software Requirements Specification (SRS), Software Architecture, Database Architecture, Business Rule Mapping, Database Decision Log, and Engineering Standards.

---

# Sprint Goal

Implement the foundational PostgreSQL database schema for the Student Online Voting Platform using the approved architecture and engineering workflow.

No database object shall be generated outside the approved implementation scope.

---

# Relevant Architecture

The following approved documents govern this implementation:

- Software Architecture.md
- Database Architecture.md
- API Specification.md
- Database Decision Log.md
- AI Implementation Guide.md
- Sprint Implementation Template.md
- Business Rule Mapping.md

Only these approved documents may guide SQL generation.

---

# Relevant Business Rules

The applicable Business Rule IDs for this sprint shall be listed here before SQL generation begins.

Example:

- BR-01
- BR-02
- BR-05

No SQL shall be generated until all applicable business rules have been identified.

---

# Database Objects

This section defines exactly which database objects Claude is expected to generate.

| Object Type | Scope |
|--------------|-------|
| Tables | Planned |
| Primary Keys | Planned |
| Foreign Keys | Planned |
| Constraints | Planned |
| Indexes | Planned |
| Views | Excluded |
| Functions | Excluded |
| Triggers | Excluded |
| RLS Policies | Excluded |
| Seed Data | Excluded |

Only approved objects shall be generated.

---

# SQL Generation Manifest

**Sprint ID**

Milestone 2 – Sprint 2

**Implementation Scope**

Core Database Schema

**Database Objects to Generate**

- Tables
- Primary Keys
- Foreign Keys
- Constraints
- Indexes

**Objects Explicitly Excluded**

- Views
- Functions
- Triggers
- RLS Policies
- Seed Data

**Target PostgreSQL Version**

Project Standard (Supabase PostgreSQL)

**Target Platform**

Supabase PostgreSQL

**Migration Type**

Initial Schema

**Expected Output Files**

- SQL Migration Script

**Review Required Before Execution**

Yes

---

# Things Claude MUST NOT Change

Claude shall not:

- redesign the database architecture;
- introduce new entities;
- rename approved entities;
- modify business rules;
- change approved relationships;
- alter naming conventions;
- create objects outside the approved scope;
- generate implementation not requested in this package.

If uncertainty exists, implementation shall stop and clarification shall be requested.

---

# Expected Deliverables

Claude shall generate:

- PostgreSQL migration SQL
- Primary keys
- Foreign keys
- Constraints
- Indexes
- SQL comments where appropriate

No additional deliverables shall be produced unless explicitly requested.

---

# SQL Generation Request

Generate PostgreSQL SQL for the approved Sprint 2 implementation scope.

The SQL shall:

- follow the approved Database Architecture;
- comply with the approved Naming Governance;
- enforce the applicable Business Rules;
- preserve normalization;
- be compatible with Supabase PostgreSQL;
- produce clean, documented, production-quality SQL.

SQL shall be returned as a single migration script unless otherwise specified.

---

# Claude Context Snapshot

## Purpose

The Claude Context Snapshot provides a concise engineering briefing for the current sprint.

Its purpose is to communicate all approved architectural decisions, implementation boundaries, business rules, and engineering expectations required for SQL generation without requiring Claude to review the project's complete documentation.

This snapshot serves as the official implementation context for the sprint.

---

# Project Overview

## Project Name

Student Online Voting Platform

## Project Type

Web-Based Student Election Management System

## Primary Objective

Design and develop a secure, scalable, and maintainable online voting platform that enables eligible students to participate in elections electronically while preserving election integrity, confidentiality, transparency, and auditability.

---

# Engineering Workflow

This project follows the mandatory engineering workflow:

Design
↓

Review
↓

Approve
↓

Execute

SQL generation shall never bypass this workflow.

---

# Sprint Objective

Milestone 2 – Sprint 2

Objective:

Implement the approved Core Database Schema for the Student Online Voting Platform.

Only the database objects identified in this implementation package shall be generated.

---

# Current Project State

Completed

✅ Software Requirements Specification

✅ Software Architecture

✅ Database Architecture

✅ API Specification

✅ AI Implementation Guide

✅ Sprint Implementation Template

✅ Business Rule Mapping

✅ Database Decision Log

✅ Database Architecture Validation

✅ SQL Readiness Assessment

Current Sprint

Milestone 2 – Sprint 2

Status

Planning

---

# Applicable Architecture Decisions

The following approved database decisions apply to this sprint.

## DB-001

Architecture-First Engineering Workflow

Impact

No SQL may be generated outside the approved implementation package.

Implementation shall follow:

Design → Review → Approve → Execute

---

## DB-002

Single Email Authentication Strategy

Impact

The system shall use one field named:

email

Institutional email addresses shall not be introduced.

Authentication shall use the approved personal email stored within the student register.

---

# Applicable Business Rules

Only the business rules mapped to Sprint 2 shall apply.

Business Rule IDs shall be inserted before SQL generation.

Example

- BR-01
- BR-02
- BR-05

No unmapped business rule shall be implemented.

---

# Current Database Scope

Claude shall generate only the following database objects:

✓ Tables

✓ Primary Keys

✓ Foreign Keys

✓ Constraints

✓ Indexes

Claude shall NOT generate:

✗ Views

✗ Functions

✗ Triggers

✗ Row Level Security Policies

✗ Seed Data

unless explicitly requested by the implementation package.

---

# Database Standards

Implementation shall comply with:

- Approved Naming Governance
- PostgreSQL Best Practices
- Third Normal Form (3NF) unless otherwise approved
- Referential Integrity
- Data Integrity
- Security by Design
- Principle of Least Privilege

---

# Implementation Boundaries

Claude SHALL NOT:

- redesign the architecture;
- rename approved entities;
- introduce additional tables;
- modify approved relationships;
- invent business rules;
- create additional features;
- optimize beyond the approved scope;
- generate SQL for future sprints.

If uncertainty exists, Claude shall stop implementation and request clarification.

---

# SQL Quality Expectations

Generated SQL shall be:

- PostgreSQL compatible
- Supabase compatible
- Well documented
- Readable
- Modular
- Production-ready
- Consistent with approved naming standards

---

# Required Deliverables

Claude shall generate only the SQL required for this sprint.

Expected deliverables include:

- SQL Migration Script
- Table Definitions
- Primary Keys
- Foreign Keys
- Constraints
- Indexes

No additional implementation shall be included.

---

# Post-Generation Workflow

After SQL generation:

1. SQL Design Review
2. Architecture Review
3. Data Integrity Review
4. Security Review
5. Performance Review
6. Maintainability Review
7. Approval
8. Supabase Execution
9. Testing
10. Documentation Update
11. Development Journal Update
12. Git Commit
13. Git Push

Claude's responsibility ends immediately after SQL generation.

Implementation approval remains the responsibility of the Software Architect and Architecture Reviewer.

---

# Engineering Charter Reminder

Claude shall recognize the following principles as mandatory for every implementation:

• Architecture is approved before implementation.

• Security is designed, not added later.

• Documentation evolves with implementation.

• Quality is verified through evidence.

• Every implementation shall be traceable to an approved requirement, business rule, architectural decision, or documented engineering standard.

• Correctness shall always take precedence over speed.

• Every sprint leaves the project in a better state than it found it.

---

# Claude Execution Authorization

This package has been prepared in accordance with the project's approved engineering workflow.

Claude is authorized to generate SQL only within the scope defined by this implementation package.

Any uncertainty shall result in a request for clarification rather than architectural assumptions.