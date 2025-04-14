# API Services (`/src/services`)

This directory contains modules responsible for communication with the backend API.

## Services Overview

- **`apiService.js`**

  - **Summary:** Likely contains the core API interaction logic, possibly including a configured `axios` instance or base `fetch` wrapper, error handling, and functions for common API endpoints (e.g., authentication, user management, potentially student/warden related actions if not separated).
  - _Future File:_ `./apiService.md`

- **`studentService.js`**

  - **Summary:** Contains functions specifically for interacting with student-related API endpoints (e.g., fetching student lists, bulk import/update).
  - _Future File:_ `./studentService.md`

- **`hostelApi.js`**

  - **Summary:** Contains functions for interacting with hostel and room management API endpoints.
  - _Future File:_ `./hostelApi.md`

- **`securityApi.js`**

  - **Summary:** Contains functions for interacting with API endpoints related to security features (e.g., fetching entry logs, managing security personnel).
  - _Future File:_ `./securityApi.md`

- **`visitorApi.js`**

  - **Summary:** Contains functions for interacting with visitor management API endpoints (e.g., fetching/creating visitor requests, managing visitor logs).
  - _Future File:_ `./visitorApi.md`

- **`notificationApi.js`**

  - **Summary:** Contains functions for interacting with notification-related API endpoints (e.g., fetching/creating notifications).
  - _Future File:_ `./notificationApi.md`

- **`feedbackApi.js`**
  - **Summary:** Contains functions for interacting with feedback submission and retrieval API endpoints.
  - _Future File:_ `./feedbackApi.md`

## Purpose

Separating API calls into dedicated service modules improves code organization, makes API logic reusable, and simplifies testing and maintenance.

## Structure

Typically, services are organized by the backend resource or feature they interact with.

- **API Client Setup (Optional):** A base file might configure the API client (e.g., setting base URL, handling authentication tokens).
- **Resource-Specific Files:** Files like `authApi.js`, `visitorApi.js`, `complaintApi.js` contain functions related to specific backend endpoints (e.g., `loginUser`, `getVisitorRequests`, `submitComplaint`).

## Key Responsibilities

- Constructing API request URLs and bodies.
- Setting appropriate headers (e.g., `Content-Type`, `Authorization`).
- Making the HTTP request (GET, POST, PUT, DELETE, etc.).
- Handling API responses, including parsing JSON and potentially basic error handling or data transformation.

## Documentation

Each service module (e.g., `visitorApi.js`) should have documentation (e.g., `docs/src/services/visitorApi.md`). This documentation should detail:

- The base URL or endpoint prefix used by the service.
- Each function exported by the module:
  - Its purpose (which API endpoint it calls).
  - Parameters it accepts.
  - What it returns (e.g., a Promise resolving to the API response data).
  - Any specific error handling or data transformation logic.

## Available Services

_(List and link to the documentation for individual service files as they are created)_

- [`apiClient.md`](./apiClient.md) (If applicable)
- [`authApi.md`](./authApi.md)
- [`visitorApi.md`](./visitorApi.md)
- [`complaintApi.md`](./complaintApi.md)
- ... _(add other services)_
