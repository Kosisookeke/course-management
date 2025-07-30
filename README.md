# Course Management Platform

A comprehensive platform for managing course allocations, facilitator activities, and notifications in an educational institution.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [API Documentation](#api-documentation)
- [Core Flows](#core-flows)
  - [User Authentication](#user-authentication)
  - [Course Allocation](#course-allocation)
  - [Facilitator Activity Tracking](#facilitator-activity-tracking)
  - [File Upload](#file-upload)
  - [Notification System](#notification-system)
- [Testing](#testing)

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Course Management**: Create, update, and manage course offerings and allocations
- **Facilitator Activity Tracking**: Track and manage facilitator activities for courses
- **File Upload**: Upload, download, and manage files with validation
- **Notification System**: Asynchronous notification processing using Redis queues
- **API Documentation**: Comprehensive API documentation using Swagger

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Queue System**: Redis with Bull
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/course-management.git
   cd course-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Access the API documentation:
   ```
   http://localhost:3000/api-docs
   ```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=course_management
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Database Schema

The application uses the following main models:

### User
- **id**: Primary key
- **email**: Unique email address
- **password**: Hashed password
- **role**: Role (manager, facilitator, student)

### Module
- **id**: Primary key
- **name**: Module name
- **code**: Module code

### Class
- **id**: Primary key
- **name**: Class name

### Cohort
- **id**: Primary key
- **name**: Cohort name

### Mode
- **id**: Primary key
- **name**: Delivery mode (online, in-person, hybrid)

### CourseOffering
- **id**: Primary key
- **moduleId**: Foreign key to Module
- **classId**: Foreign key to Class
- **trimester**: Trimester (T1, T2, T3)
- **cohortId**: Foreign key to Cohort
- **intake**: Intake (HT1, HT2, FT)
- **modeId**: Foreign key to Mode
- **facilitatorId**: Foreign key to User (facilitator)

### ActivityTracker
- **id**: Primary key
- **allocationId**: Foreign key to CourseOffering
- **weekNumber**: Week number
- **attendance**: JSON array of attendance
- **formativeOneGrading**: Status (Done, Pending, Not Started)
- **formativeTwoGrading**: Status (Done, Pending, Not Started)
- **summativeGrading**: Status (Done, Pending, Not Started)
- **courseModeration**: Status (Done, Pending, Not Started)
- **intranetSync**: Status (Done, Pending, Not Started)
- **gradeBookStatus**: Status (Done, Pending, Not Started)

### Notification
- **id**: Primary key
- **type**: Type (facilitator_reminder, manager_alert, deadline_warning)
- **recipientId**: Foreign key to User
- **allocationId**: Foreign key to CourseOffering
- **weekNumber**: Week number
- **title**: Notification title
- **message**: Notification message
- **status**: Status (pending, sent, failed)
- **scheduledFor**: Scheduled date/time
- **sentAt**: Sent date/time
- **metadata**: JSON metadata

## Authentication Flow

1. **Registration**:
   - User submits email, password, and role
   - Password is hashed using bcrypt
   - User record is created in the database

2. **Login**:
   - User submits email and password
   - System verifies credentials
   - If valid, a JWT token is generated and returned
   - Token contains user ID and role for authorization

3. **Authentication**:
   - Client includes JWT token in Authorization header
   - Server validates token for each protected request
   - If token is invalid or expired, 401 Unauthorized is returned

4. **Authorization**:
   - After authentication, user's role is checked
   - Access is granted or denied based on role permissions
   - For example, only managers can delete course offerings

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It provides detailed information about all endpoints, including:

- Request parameters
- Request body schemas
- Response schemas
- Authentication requirements
- Example requests and responses

## Core Flows

### User Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Course Allocation

```
POST /api/course-allocations
GET /api/course-allocations
GET /api/course-allocations/:id
PUT /api/course-allocations/:id
DELETE /api/course-allocations/:id
```

### Facilitator Activity Tracking

```
POST /api/activity-logs
GET /api/activity-logs
GET /api/activity-logs/:id
PUT /api/activity-logs/:id
DELETE /api/activity-logs/:id
```

### File Upload

```
POST /api/files
GET /api/files
GET /api/files/:filename
GET /api/files/:filename/download
DELETE /api/files/:filename
```

### Notification System

The notification system uses Redis queues to process notifications asynchronously. There are three types of queues:

1. **Facilitator Reminders**: Reminders for facilitators to submit activity logs
2. **Manager Alerts**: Alerts for managers about missing or late submissions
3. **Deadline Warnings**: Warnings about upcoming deadlines

## Testing

Run the tests with:

```bash
npm test
```

For API integration testing:

```bash
node test-api-integration.js
```

For notification system testing:

```bash
node test-notifications.js
```