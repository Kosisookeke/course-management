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
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Queue System**: Redis with Bull
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
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
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=course_management_db

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

The API documentation is available at `/api-docs` when the server is running. You can access it by navigating to:

```
http://localhost:3000/api-docs
```

The documentation is generated using Swagger/OpenAPI and provides comprehensive information about all endpoints, including:

- Request parameters
- Request body schemas
- Response schemas
- Authentication requirements
- Example requests and responses

### Using the Swagger UI

1. Start the server with `npm start`
2. Open your browser and navigate to `http://localhost:3000/api-docs`
3. You'll see the Swagger UI with all available endpoints grouped by tags
4. Expand any endpoint to see detailed documentation
5. You can try out endpoints directly from the UI by clicking the "Try it out" button
6. For authenticated endpoints, you'll need to:
   - Login using the `/api/auth/login` endpoint to get a token
   - Click the "Authorize" button at the top of the page
   - Enter your token in the format: `Bearer your-token-here`
   - Click "Authorize" to use the token for all subsequent requests

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

## Troubleshooting

If you're having issues running the application locally, here are some common problems and their solutions:

### Redis Issues

1. **Redis Not Running**

   The application requires Redis for the notification system. If Redis is not running, you'll see a warning but the server will still start without notification features.

   To start Redis on Windows:

   ```
   Start Menu > Redis > Redis Server
   ```

   Alternatively, you can run Redis as a Windows service:

   ```
   Start Menu > Redis > Redis Service Start
   ```

   To verify Redis is running:

   ```
   redis-cli ping
   ```

   You should receive a response of "PONG".

2. **Installing Redis**

   If Redis is not installed, run the Redis-x64-3.0.504.msi installer in the project root directory.

   After installation, start the Redis service as described above.

### MySQL Issues

1. **MySQL Not Running**

   The application requires MySQL for the database. If MySQL is not running, the server will fail to start.

   To start MySQL on Windows:

   ```
   Start Menu > MySQL > MySQL Server > Start MySQL Server
   ```

   Alternatively, you can run MySQL as a Windows service:

   ```
   net start mysql
   ```

   To verify MySQL is running:

   ```
   mysql -u root -p
   ```

   Enter your password when prompted.

2. **Installing MySQL**

   If MySQL is not installed, download and install it from the [MySQL website](https://dev.mysql.com/downloads/installer/).

   During installation, make sure to:

   - Set the root password to match the one in your .env file
   - Configure MySQL to start automatically

3. **Creating the Database**

   If the database doesn't exist, create it:

   ```
   mysql -u root -p
   ```

   Enter your password when prompted, then run:

   ```
   CREATE DATABASE course_management_db;
   EXIT;
   ```

   Then run the migrations:

   ```
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

### Port Issues

1. **Port Already in Use**

   If port 3000 is already in use, you can change the port in the .env file:

   ```
   PORT=3001
   ```

   Then access the application at http://localhost:3000 instead.

2. **Checking for Port Conflicts**

   To check if port 3000 is already in use:

   ```
   netstat -ano | findstr :3000
   ```

   If it shows a process using the port, you can either:

   - Change the port in the .env file
   - Terminate the process using the port

### Other Common Issues

1. **Node.js Version**

   Ensure you're using Node.js v14 or higher:

   ```
   node -v
   ```

2. **NPM Dependencies**

   If you're getting module not found errors, try reinstalling dependencies:

   ```
   npm ci
   ```

3. **Environment Variables**

   Make sure your .env file exists and contains all required variables as shown in the Environment Configuration section.

4. **Database Connection**

   If you're having issues connecting to the database, verify:

   - MySQL is running
   - The credentials in your .env file match your MySQL installation
   - The database exists

5. **Sequelize Errors**

   If you're getting Sequelize errors, try:

   ```
   npx sequelize-cli db:drop
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

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
