# Take-Home Assignment — The Untested API

A 2-day take-home assignment focused on understanding an unfamiliar Express.js codebase, writing tests, identifying and fixing bugs, and implementing a new API feature.

## Overview

This project is a Task Manager REST API built with Node.js and Express. The application uses an in-memory data store and provides endpoints for creating, retrieving, updating, completing, deleting, filtering, and assigning tasks.

## What I Completed

- Added unit tests for `taskService.js`
- Added integration tests for API routes using Supertest
- Added happy-path and edge-case tests
- Identified and fixed incorrect pagination logic
- Identified and fixed the missing `GET /tasks/:id` endpoint
- Implemented `PATCH /tasks/:id/assign`
- Added validation for task assignment
- Added tests for the task assignment feature
- Documented identified bugs and their fixes

## Bugs Identified and Fixed

### 1. Incorrect Pagination Calculation

**Location:** `src/services/taskService.js`

The original pagination implementation calculated the offset as:

```javascript
const offset = page * limit;
