# Software Requirements Specification (SRS)

# Hostel Management System - Frontend

**Version:** 1.0
**Date:** 2023-10-27

## Table of Contents

1.  [Introduction](#1-introduction)
    1.1. [Purpose](#11-purpose)
    1.2. [Scope](#12-scope)
    1.3. [Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
    1.4. [References](#14-references)
    1.5. [Overview](#15-overview)
2.  [Overall Description](#2-overall-description)
    2.1. [Product Perspective](#21-product-perspective)
    2.2. [Product Functions](#22-product-functions)
    2.3. [User Characteristics](#23-user-characteristics)
    2.4. [Constraints](#24-constraints)
    2.5. [Assumptions and Dependencies](#25-assumptions-and-dependencies)
3.  [Specific Requirements](#3-specific-requirements)
    3.1. [Functional Requirements](#31-functional-requirements)
    3.1.1. [Authentication](#311-authentication)
    3.1.2. [Student Features](#312-student-features)
    3.1.3. [Warden Features](#313-warden-features)
    3.1.4. [Security Guard Features](#314-security-guard-features)
    3.1.5. [Administrator Features](#315-administrator-features)
    3.1.6. [Common Features](#316-common-features)
    3.2. [Non-Functional Requirements](#32-non-functional-requirements)
    3.2.1. [Performance](#321-performance)
    3.2.2. [Usability](#322-usability)
    3.2.3. [Reliability](#323-reliability)
    3.2.4. [Security](#324-security)
    3.2.5. [Maintainability](#325-maintainability)
    3.2.6. [Portability](#326-portability)
    3.3. [Interface Requirements](#33-interface-requirements)
    3.3.1. [User Interface (UI)](#331-user-interface-ui)
    3.3.2. [Software Interfaces (API)](#332-software-interfaces-api)
    3.3.3. [Hardware Interfaces](#333-hardware-interfaces)
    3.3.4. [Communications Interfaces](#334-communications-interfaces)

---

## 1. Introduction

### 1.1 Purpose

This document defines the Software Requirements Specification (SRS) for the Frontend component of the Hostel Management System (HMS). Its purpose is to provide a detailed description of the system's requirements, features, constraints, and interfaces to guide the development process.

### 1.2 Scope

The scope of this document is limited to the **Frontend** web application of the HMS. This application will provide a user interface (UI) for various user roles (Students, Wardens, Security Guards, Administrators) to interact with the system's functionalities.

Key functionalities covered by the frontend include:

- User Authentication (Login)
- Profile Management
- Student Information Viewing and Management (for authorized roles)
- Room Allocation Viewing and Management (for authorized roles)
- Complaint Lodging and Management
- Event Viewing and Management
- Lost and Found Item Management
- Visitor Request Management and Logging
- Security Check-in/Check-out Logging (including QR Code scanning)
- Notification Viewing and Management
- Dashboard views with relevant statistics and charts for different roles.

This SRS **does not** cover:

- The backend API implementation, database design, or server-side logic.
- Deployment infrastructure or server management.
- Native mobile applications (unless specified elsewhere).

### 1.3 Definitions, Acronyms, and Abbreviations

| Term  | Definition                                      |
| :---- | :---------------------------------------------- |
| HMS   | Hostel Management System                        |
| UI    | User Interface                                  |
| API   | Application Programming Interface               |
| SRS   | Software Requirements Specification             |
| CRUD  | Create, Read, Update, Delete                    |
| React | JavaScript library for building user interfaces |
| Vite  | Frontend build tool                             |
| SPA   | Single Page Application                         |
| JWT   | JSON Web Token                                  |
| DisCo | Disciplinary Committee                          |
| CSV   | Comma-Separated Values                          |

### 1.4 References

- **Project Repository:** [https://github.com/thisisdkyadav/hostel-management-system-frontend](https://github.com/thisisdkyadav/hostel-management-system-frontend)
- **Technical Documentation:** [`./docs/`](./docs/README.md)

### 1.5 Overview

This document is organized into three main sections:

- **Section 1 (Introduction):** Provides context, scope, and definitions.
- **Section 2 (Overall Description):** Describes the product perspective, functions, user characteristics, constraints, and assumptions.
- **Section 3 (Specific Requirements):** Details the functional, non-functional, and interface requirements.

---

## 2. Overall Description

### 2.1 Product Perspective

The HMS Frontend is a web-based Single Page Application (SPA) built using React. It serves as the primary user interface for the Hostel Management System. It operates independently of the backend logic but relies heavily on a corresponding backend API for data fetching, persistence, and business rule enforcement. It will be accessed via modern web browsers.

### 2.2 Product Functions

The frontend application will provide UIs for the following core functions:

1.  **Authentication:** Secure login for different user roles.
2.  **Dashboard Views:** Role-specific dashboards displaying relevant statistics, charts, and quick actions.
3.  **Profile Management:** Viewing and updating user profile information, including password changes.
4.  **Student Management:** Viewing student lists, details, performing bulk imports/updates, managing allocations, and disciplinary actions (Admin/Warden).
5.  **Room/Hostel Management:** Viewing hostel/room details and occupancy (Warden/Admin).
6.  **Complaint Management:** Submitting, viewing, and managing complaints.
7.  **Event Management:** Viewing and managing hostel events.
8.  **Lost & Found:** Reporting, viewing, and managing lost/found items.
9.  **Visitor Management:** Submitting visitor requests, viewing requests, managing visitor logs (Student/Warden/Security/Admin).
10. **Security Logging:** Recording student entry/exit via QR code scanning or manual entry (Security).
11. **Notification System:** Displaying system notifications and potentially allowing creation (Admin/Warden).
12. **Maintenance Request Management:** Viewing and managing maintenance requests (Admin/Warden/Maintenance Staff).

### 2.3 User Characteristics

The system caters to multiple user roles with varying technical skills and responsibilities:

- **Students:** General user base. Expected to have basic web browsing skills. Primary tasks: view profile, view events, submit complaints, manage lost/found items, submit visitor requests, view notifications.
- **Wardens/Associate Wardens:** Staff members responsible for hostel management. Expected to have moderate computer literacy. Primary tasks: manage room allocations, view student details within their hostel, manage complaints, manage events, manage visitor requests, view dashboard/stats, manage disciplinary actions.
- **Security Guards:** Staff responsible for monitoring entry/exit. Expected to perform specific, trained tasks. Primary tasks: log student entry/exit (QR scan, manual), manage visitor logs.
- **Administrators:** Staff with overall system management responsibilities. Expected to have good computer literacy. Primary tasks: manage users (students, wardens, security, staff), manage hostels, view system-wide statistics/reports, manage notifications, potentially override/manage all other modules.
- **Maintenance Staff:** (Implied by components) Staff responsible for handling maintenance requests. Primary tasks: view assigned requests, update status.

### 2.4 Constraints

- **Technology:** Must be developed using React, Tailwind CSS, React Context API, React Router, Fetch API, and built with Vite.
- **Platform:** Must run on modern web browsers (e.g., Chrome, Firefox, Safari, Edge) with JavaScript enabled.
- **Responsiveness:** The UI must be responsive and adapt to various screen sizes (desktop, tablet, mobile).
- **API Dependency:** The frontend is entirely dependent on a functional backend API for data and core logic. The specific API endpoints and data formats must be adhered to.
- **State Management:** Global state should be managed primarily via React Context API.

### 2.5 Assumptions and Dependencies

- **Backend API:** A corresponding backend API exists, is functional, documented, and accessible to the frontend.
- **Network Connectivity:** Users require a stable internet connection for most functionalities. Offline capabilities (e.g., cached data view) might be limited.
- **User Authentication:** The backend API handles secure user authentication and authorization logic.
- **User Knowledge:** Users possess basic computer and web browsing skills relevant to their role.
- **Hardware:** Users accessing QR code scanning features (Security) require devices with functional cameras accessible by the web browser.

---

## 3. Specific Requirements

### 3.1 Functional Requirements

_(Note: FR-ID format: FR-<Category>-<Number>)_

#### 3.1.1 Authentication

- **FR-AUTH-01:** The system shall provide a login interface accepting user credentials (e.g., email/ID and password).
- **FR-AUTH-02:** The system shall securely send login credentials to the backend API for validation.
- **FR-AUTH-03:** Upon successful login, the system shall store authentication tokens (e.g., JWT) securely (e.g., HttpOnly cookies managed by the backend or secure browser storage).
- **FR-AUTH-04:** The system shall redirect users to their role-specific dashboard or landing page after successful login.
- **FR-AUTH-05:** The system shall display appropriate error messages for failed login attempts.
- **FR-AUTH-06:** The system shall provide a mechanism for users to log out, clearing relevant authentication state/tokens.
- **FR-AUTH-07:** The system shall protect routes based on user authentication status and role, redirecting unauthorized users.

#### 3.1.2 Student Features

- **FR-STUDENT-01:** Students shall be able to view their own profile information (personal, academic, hostel details).
- **FR-STUDENT-02:** Students shall be able to update editable parts of their profile information (e.g., phone, address - subject to backend permissions).
- **FR-STUDENT-03:** Students shall be able to change their own password.
- **FR-STUDENT-04:** Students shall be able to view a list of hostel events.
- **FR-STUDENT-05:** Students shall be able to submit complaints.
- **FR-STUDENT-06:** Students shall be able to view the status and details of their submitted complaints.
- **FR-STUDENT-07:** Students shall be able to report lost items.
- **FR-STUDENT-08:** Students shall be able to report found items.
- **FR-STUDENT-09:** Students shall be able to view a list of reported lost and found items.
- **FR-STUDENT-10:** Students shall be able to submit visitor requests.
- **FR-STUDENT-11:** Students shall be able to view the status of their visitor requests.
- **FR-STUDENT-12:** Students shall be able to view received notifications.
- **FR-STUDENT-13:** Students shall be able to view their own disciplinary action records (if implemented).
- **FR-STUDENT-14:** Students shall be able to view their own entry/exit history (if implemented).
- **FR-STUDENT-15:** Students shall be able to submit feedback.

#### 3.1.3 Warden Features

_(Includes Associate Warden where applicable)_

- **FR-WARDEN-01:** Wardens shall be able to view a dashboard summarizing key statistics for their assigned hostel(s) (e.g., occupancy, complaints, visitor requests).
- **FR-WARDEN-02:** Wardens shall be able to view a list of students residing in their assigned hostel(s).
- **FR-WARDEN-03:** Wardens shall be able to filter and search the student list within their hostel(s).
- **FR-WARDEN-04:** Wardens shall be able to view detailed information for students in their hostel(s).
- **FR-WARDEN-05:** Wardens shall be able to view the room and unit structure of their assigned hostel(s).
- **FR-WARDEN-06:** Wardens shall be able to view room occupancy details, including assigned students and bed status.
- **FR-WARDEN-07:** Wardens shall be able to allocate or de-allocate students to specific rooms/beds within their hostel(s) (individually or via bulk update).
- **FR-WARDEN-08:** Wardens shall be able to view complaints relevant to their hostel(s).
- **FR-WARDEN-09:** Wardens shall be able to update the status and add remarks to complaints within their purview.
- **FR-WARDEN-10:** Wardens shall be able to view visitor requests for students in their hostel(s).
- **FR-WARDEN-11:** Wardens shall be able to approve or reject pending visitor requests.
- **FR-WARDEN-12:** Wardens shall be able to view and manage events specific to their hostel(s) or the institution.
- **FR-WARDEN-13:** Wardens shall be able to view and manage lost/found items reported within their hostel(s).
- **FR-WARDEN-14:** Wardens shall be able to view notifications targeted to them or their hostel(s).
- **FR-WARDEN-15:** Wardens shall be able to create and send notifications to students within their hostel(s).
- **FR-WARDEN-16:** Wardens shall be able to view maintenance requests for their hostel(s).
- **FR-WARDEN-17:** Wardens shall be able to update the status or assign maintenance requests.
- **FR-WARDEN-18:** Wardens shall be able to view and manage disciplinary actions for students in their hostel(s).
- **FR-WARDEN-19:** Wardens shall be able to manage their own profile information.
- **FR-WARDEN-20:** Wardens shall be able to switch their active context between assigned hostels (if applicable).

#### 3.1.4 Security Guard Features

- **FR-SECURITY-01:** Guards shall be able to view a dashboard with relevant information (e.g., current time, recent entries).
- **FR-SECURITY-02:** Guards shall be able to use the device camera to scan student QR codes.
- **FR-SECURITY-03:** Upon successful scan, the system shall display the student's information (photo, name, room, status).
- **FR-SECURITY-04:** Guards shall be able to record student check-in based on QR scan.
- **FR-SECURITY-05:** Guards shall be able to record student check-out based on QR scan.
- **FR-SECURITY-06:** Guards shall be able to manually search for students (e.g., by roll number or name).
- **FR-SECURITY-07:** Guards shall be able to manually record student check-in/check-out.
- **FR-SECURITY-08:** Guards shall be able to view a log of recent student entries and exits.
- **FR-SECURITY-09:** Guards shall be able to edit entry/exit log details (e.g., add remarks, correct minor errors - subject to permissions).
- **FR-SECURITY-10:** Guards shall be able to view and manage visitor logs (check-in/check-out visitors based on approved requests).
- **FR-SECURITY-11:** Guards shall be able to manage their own profile information.

#### 3.1.5 Administrator Features

- **FR-ADMIN-01:** Admins shall be able to view a system-wide dashboard with key statistics and charts covering students, hostels, complaints, etc.
- **FR-ADMIN-02:** Admins shall be able to manage (CRUD) student accounts.
- **FR-ADMIN-03:** Admins shall be able to perform bulk import/update operations for student data.
- **FR-ADMIN-04:** Admins shall be able to manage (CRUD) warden and associate warden accounts.
- **FR-ADMIN-05:** Admins shall be able to manage (CRUD) security guard accounts.
- **FR-ADMIN-06:** Admins shall be able to manage (CRUD) other staff accounts (e.g., maintenance).
- **FR-ADMIN-07:** Admins shall be able to manage (CRUD) hostel details, including rooms, units, and capacity.
- **FR-ADMIN-08:** Admins shall be able to manage system-wide room allocations (view, assign, de-allocate, bulk updates).
- **FR-ADMIN-09:** Admins shall be able to view and manage all complaints across the system.
- **FR-ADMIN-10:** Admins shall be able to view and manage all events.
- **FR-ADMIN-11:** Admins shall be able to view and manage all lost/found items.
- **FR-ADMIN-12:** Admins shall be able to view and manage all visitor requests and logs.
- **FR-ADMIN-13:** Admins shall be able to view all student entry/exit logs.
- **FR-ADMIN-14:** Admins shall be able to view and manage all maintenance requests.
- **FR-ADMIN-15:** Admins shall be able to view and manage all disciplinary actions.
- **FR-ADMIN-16:** Admins shall be able to create and send system-wide notifications or target specific groups.
- **FR-ADMIN-17:** Admins shall be able to manage their own profile information.
- **FR-ADMIN-18:** Admins shall be able to manage system settings (if applicable frontend settings exist).
- **FR-ADMIN-19:** Admins shall be able to reset user passwords.

#### 3.1.6 Common Features

- **FR-COMMON-01:** All authenticated users shall be able to view their own profile information.
- **FR-COMMON-02:** All authenticated users shall be able to change their own password.
- **FR-COMMON-03:** The system shall display system notifications relevant to the logged-in user.
- **FR-COMMON-04:** The UI shall provide clear navigation based on the user's role.
- **FR-COMMON-05:** Forms shall provide appropriate input validation feedback (e.g., required fields, email format).

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance

- **NFR-PERF-01:** Pages and components should load within a reasonable timeframe (e.g., < 3 seconds for primary content rendering) on a standard broadband connection.
- **NFR-PERF-02:** UI interactions (button clicks, form submissions, filtering) should feel responsive with minimal perceived lag (< 500ms).
- **NFR-PERF-03:** List virtualization or pagination shall be used for potentially long lists (e.g., students, logs) to maintain UI performance.
- **NFR-PERF-04:** QR code scanning should process and display results quickly (< 2 seconds after stable scan).

#### 3.2.2 Usability

- **NFR-USAB-01:** The UI shall be intuitive and easy to navigate for users based on their role and expected technical proficiency.
- **NFR-USAB-02:** The application shall provide a consistent look and feel across all pages, adhering to the style defined by Tailwind CSS.
- **NFR-USAB-03:** The application shall be responsive and usable across common screen sizes (desktop, tablet, mobile).
- **NFR-USAB-04:** Error messages displayed to the user shall be clear and understandable.
- **NFR-USAB-05:** Loading states shall be clearly indicated to the user during data fetching or processing.
- **NFR-USAB-06:** Forms should provide clear labels, placeholders, and required field indicators.

#### 3.2.3 Reliability

- **NFR-REL-01:** The application should handle API errors gracefully, displaying appropriate messages to the user instead of crashing.
- **NFR-REL-02:** The application should maintain state consistency during navigation and interaction.
- **NFR-REL-03:** The application should detect loss of network connectivity and inform the user (e.g., via an offline banner).

#### 3.2.4 Security

_(Focus on Frontend Aspects)_

- **NFR-SEC-01:** All communication with the backend API must occur over HTTPS.
- **NFR-SEC-02:** Input validation should be performed on the frontend to prevent trivial injection attempts, although primary validation occurs on the backend.
- **NFR-SEC-03:** Authentication tokens, if stored client-side, must be stored securely (e.g., avoiding `localStorage` for sensitive tokens). Secure cookie flags (HttpOnly, Secure, SameSite) set by the backend are preferred.
- **NFR-SEC-04:** The frontend shall not expose sensitive information (e.g., other users' passwords) in the UI or client-side code.
- **NFR-SEC-05:** Access control logic displayed in the UI (e.g., hiding/showing buttons) must be reinforced by backend authorization checks.

#### 3.2.5 Maintainability

- **NFR-MAIN-01:** The codebase shall follow a clear and consistent structure (components, contexts, hooks, services, pages, etc.).
- **NFR-MAIN-02:** Components should be reusable and follow the Single Responsibility Principle where practical.
- **NFR-MAIN-03:** Code shall be well-formatted and adhere to established linting rules (ESLint).
- **NFR-MAIN-04:** Technical documentation (as generated in `docs/`) shall be maintained alongside the code.
- **NFR-MAIN-05:** State management logic should be clearly separated (e.g., using Context API or dedicated state management hooks).

#### 3.2.6 Portability

- **NFR-PORT-01:** The application shall be compatible with the latest stable versions of major web browsers (Chrome, Firefox, Safari, Edge).

### 3.3 Interface Requirements

#### 3.3.1 User Interface (UI)

- The UI shall be developed using React and styled with Tailwind CSS.
- The UI shall provide a modern, clean, and professional appearance.
- The UI must be responsive, adapting to different screen sizes (desktop, tablet, mobile).
- Navigation shall be role-based and clearly presented (likely via a sidebar or header menu).
- Standard UI elements (buttons, forms, modals, tables, cards) shall have a consistent design.

#### 3.3.2 Software Interfaces (API)

- The frontend shall communicate with a backend API via RESTful principles (or GraphQL if specified).
- Data exchange shall primarily use the JSON format.
- The frontend shall handle standard HTTP status codes returned by the API (e.g., 200, 201, 400, 401, 403, 404, 500).
- Authentication shall likely be handled via token-based mechanisms (e.g., JWT sent in Authorization headers or secure cookies).
- A clear API specification (e.g., OpenAPI/Swagger) provided by the backend team is required.

#### 3.3.3 Hardware Interfaces

- **Camera:** The application requires access to the device camera via the browser's media APIs (`getUserMedia`) for the QR code scanning feature used by Security Guards. User permission must be requested.

#### 3.3.4 Communications Interfaces

- The application shall use the HTTPS protocol for all communication with the backend API.
- Standard web protocols (HTTP/S, TCP/IP) are used via the browser's Fetch API.

---
