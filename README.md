# Email Scheduler Application

A full-stack email scheduling application that allows users to compose, schedule, process, and track emails.

The application consists of:

- React + TypeScript frontend
- Express + TypeScript backend
- PostgreSQL database with Prisma ORM
- Redis for queue storage and processing
- BullMQ for delayed jobs and background workers
- Nodemailer with Ethereal Email for testing email delivery

---

# Project Structure

```text
company-assignment/
│
├── README.md
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   └── server.ts
│   │
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Home.tsx
    │   │   └── Compose.tsx
    │   │
    │   ├── App.tsx
    │   └── main.tsx
    │
    ├── .env
    └── package.json
```

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- Lucide React

## Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- Nodemailer
- Ethereal Email

---

# How to Run the Backend

## 1. Navigate to the backend folder

```bash
cd backend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000

# PostgreSQL Database
DATABASE_URL="your_postgresql_connection_string"

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Worker Configuration
WORKER_CONCURRENCY=5

# Minimum delay between email sends in milliseconds
MIN_EMAIL_DELAY=2000

# Maximum emails allowed per sender per hour
MAX_EMAILS_PER_HOUR_PER_SENDER=200

# Ethereal SMTP
ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=your_ethereal_email
ETHEREAL_PASS=your_ethereal_password
```

---

# Database Setup

The application uses PostgreSQL with Prisma ORM.

Make sure PostgreSQL is running.

Add your PostgreSQL connection string to the backend `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE"
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client if required:

```bash
npx prisma generate
```

To inspect the database:

```bash
npx prisma studio
```

---

# Redis Setup

Redis must be running before starting the backend because BullMQ uses Redis to store and manage jobs.

The application uses:

```text
Host: 127.0.0.1
Port: 6379
```

Start Redis using:

```bash
redis-server
```

You can verify that Redis is running using:

```bash
redis-cli ping
```

Expected output:

```text
PONG
```

---

# Start the Backend

Run:

```bash
npm run dev
```

The backend should start on:

```text
http://localhost:5000
```

Example output:

```text
Server running on http://localhost:5000
BullMQ email worker started
Email worker is ready
```

The backend handles:

- API requests
- Email scheduling
- Database persistence
- BullMQ queue creation
- Redis job storage
- Background worker processing
- Rate limiting
- Concurrency control
- Email sending using Nodemailer

---

# How to Run the Frontend

## 1. Open a new terminal

Navigate to the frontend folder:

```bash
cd frontend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure frontend environment variables

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
```

## 4. Start the frontend

```bash
npm run dev
```

Vite will provide a local URL.

Typically:

```text
http://localhost:5173
```

Open this URL in the browser.

The frontend communicates with the backend running on:

```text
http://localhost:5000
```

---

# Ethereal Email Setup

Ethereal Email is used as the SMTP provider for testing.

Emails are processed using Nodemailer but are not delivered to real recipients.

Instead, Ethereal generates a preview URL where the sent email can be viewed.

## Steps to Set Up Ethereal

1. Create an Ethereal Email account.
2. Generate or create SMTP credentials.
3. Copy the following details:

```text
SMTP Host
SMTP Port
Username
Password
```

4. Add the credentials to the backend `.env` file:

```env
ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=your_ethereal_email
ETHEREAL_PASS=your_ethereal_password
```

Example SMTP configuration:

```text
Host: smtp.ethereal.email
Port: 587
```

When an email is successfully processed, the backend logs information similar to:

```text
Email sent successfully
Ethereal Message ID: <message-id>
Ethereal Preview: https://ethereal.email/message/<message-id>
```

The Ethereal preview URL can be opened to verify the generated email.

---

# API Endpoints

## Schedule an Email

### Endpoint

```http
POST /emails/schedule
```

### Example Request

```json
{
  "sender": "sender@ethereal.email",
  "recipient": "recipient@example.com",
  "subject": "Test Email",
  "body": "This is a scheduled email.",
  "scheduledAt": "2026-08-20T12:00:00.000Z"
}
```

### Example Response

```json
{
  "message": "Email scheduled successfully",
  "email": {
    "id": "email-id",
    "sender": "sender@ethereal.email",
    "recipient": "recipient@example.com",
    "subject": "Test Email",
    "status": "SCHEDULED"
  }
}
```

---

# Get Emails

The frontend dashboard retrieves emails from the backend.

## Get Scheduled Emails

```http
GET /emails?status=SCHEDULED
```

## Get Sent Emails

```http
GET /emails?status=SENT
```

These APIs are used by the dashboard to display scheduled and sent emails dynamically.

---

# Architecture Overview

The application follows a client-server architecture with asynchronous background job processing.

```text
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │                     │
                 │ Login               │
                 │ Dashboard           │
                 │ Compose Email       │
                 └──────────┬──────────┘
                            │
                            │ HTTP Requests
                            ▼
                 ┌─────────────────────┐
                 │   Express Backend   │
                 │                     │
                 │ Routes              │
                 │ Controllers         │
                 │ Services            │
                 └──────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌──────────────────┐       ┌──────────────────┐
    │   PostgreSQL     │       │      BullMQ      │
    │                  │       │                  │
    │ Email Records    │       │ Scheduled Jobs   │
    │ Status           │       │ Delayed Jobs     │
    └──────────────────┘       └────────┬─────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │      Redis      │
                                │                 │
                                │ Queue Storage   │
                                │ Job Data        │
                                └────────┬────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │ BullMQ Worker   │
                                │                 │
                                │ Concurrency     │
                                │ Rate Limiting   │
                                │ Email Processing│
                                └────────┬────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │   Nodemailer    │
                                └────────┬────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │ Ethereal SMTP   │
                                └─────────────────┘
```

---

# How Email Scheduling Works

When a user schedules an email from the frontend, the following process takes place:

## Step 1: User Composes an Email

The user enters:

- Sender
- Recipient
- Subject
- Email message
- Scheduled date and time

The frontend sends the data to:

```http
POST /emails/schedule
```

---

## Step 2: Backend Validates the Request

The Express controller validates the required fields.

The backend checks that:

- Sender exists
- Recipient exists
- Subject exists
- Body exists
- Scheduled date is valid

---

## Step 3: Email Is Stored in PostgreSQL

The email is stored in the database.

The initial status is:

```text
SCHEDULED
```

The database stores information such as:

- Email ID
- Sender
- Recipient
- Subject
- Body
- Scheduled date and time
- Email status
- BullMQ job ID

---

## Step 4: BullMQ Job Is Created

After the email is stored successfully, a BullMQ job is created.

The delay is calculated using:

```text
Scheduled Time - Current Time
```

For example:

```text
Current Time: 10:00 AM
Scheduled Time: 10:05 AM

Delay = 5 minutes
```

BullMQ stores the delayed job in Redis.

---

## Step 5: The Worker Processes the Job

When the scheduled time arrives, BullMQ makes the job available for processing.

The email worker receives the job and:

1. Retrieves the email information.
2. Applies configured processing rules.
3. Checks rate limiting.
4. Processes the job according to worker concurrency.
5. Sends the email using Nodemailer.
6. Updates the email status in PostgreSQL.

The status changes from:

```text
SCHEDULED
```

to:

```text
SENT
```

---

# Persistence and Restart Handling

The application does not rely only on JavaScript timers or in-memory scheduling.

Email information is persisted in PostgreSQL.

Scheduled jobs are managed by BullMQ and stored in Redis.

The separation works as follows:

```text
PostgreSQL
    │
    ├── Stores email data
    ├── Stores scheduling information
    ├── Stores email status
    └── Stores job information

Redis
    │
    ├── Stores BullMQ queue data
    ├── Stores delayed jobs
    └── Stores background job state
```

Because the scheduling information and job information are persisted externally instead of existing only in the Express server memory, the application can reconnect to the queue and database after the application process is restarted.

The worker connects to Redis when the application starts and can continue processing available jobs.

The PostgreSQL database remains the persistent source for email information and status.

---

# Rate Limiting

The application includes configurable sender-based rate limiting.

The maximum number of emails that can be processed for a sender is configured using:

```env
MAX_EMAILS_PER_HOUR_PER_SENDER=200
```

For testing, this value can be reduced.

Example:

```env
MAX_EMAILS_PER_HOUR_PER_SENDER=2
```

This makes it possible to test the rate limiting behavior with only a few emails.

The rate limiting logic prevents a sender from exceeding the configured maximum number of emails during the configured time window.

Redis is used because it provides fast access to counters and queue-related state.

---

# Minimum Delay Between Emails

A configurable delay can be applied between email sends.

The environment variable is:

```env
MIN_EMAIL_DELAY=2000
```

The value is measured in milliseconds.

Example:

```text
2000 milliseconds = 2 seconds
```

This configuration can help prevent emails from being processed immediately one after another.

The value can be changed based on the required behavior.

---

# Concurrency

BullMQ worker concurrency is configurable.

The application uses:

```env
WORKER_CONCURRENCY=5
```

This allows the worker to process up to five jobs concurrently.

Examples:

```env
WORKER_CONCURRENCY=1
```

Processes one job at a time.

```env
WORKER_CONCURRENCY=5
```

Processes up to five jobs concurrently.

```env
WORKER_CONCURRENCY=10
```

Allows more parallel job processing.

Concurrency is useful for controlling the number of background jobs being processed simultaneously.

---

# Frontend and Backend Integration

The frontend communicates with the Express backend using HTTP requests.

## Scheduling Flow

```text
Compose Page
      │
      ▼
User enters email details
      │
      ▼
POST /emails/schedule
      │
      ▼
Express Backend
      │
      ▼
PostgreSQL
      │
      ▼
Email Status = SCHEDULED
      │
      ▼
BullMQ Queue
      │
      ▼
Redis
      │
      ▼
Worker
      │
      ▼
Nodemailer
      │
      ▼
Ethereal Email
      │
      ▼
Status = SENT
```

---

# Dashboard Flow

The dashboard retrieves email data from the backend.

For scheduled emails:

```text
GET /emails?status=SCHEDULED
```

For sent emails:

```text
GET /emails?status=SENT
```

The React frontend displays the data dynamically in the corresponding sections.

The refresh button reloads the latest data from the backend.

---

# Features Implemented

# Backend Features

## 1. Email Scheduler

- Schedule emails for a future date and time.
- Calculate the delay based on the selected scheduled time.
- Create delayed jobs using BullMQ.
- Process scheduled emails asynchronously.

---

## 2. Database Persistence

- Email records are stored in PostgreSQL.
- Prisma ORM is used for database access.
- Email status is stored and updated.
- Scheduled email information remains stored in the database.
- Job IDs can be associated with email records.

Email statuses include:

```text
SCHEDULED
SENT
```

---

## 3. BullMQ Queue

- Delayed jobs are created for scheduled emails.
- Jobs are stored and managed using Redis.
- Background processing is separated from API request handling.
- Failed and completed jobs can be retained based on queue configuration.

---

## 4. Background Email Worker

- BullMQ worker processes scheduled jobs.
- Email processing happens asynchronously.
- The worker operates independently from the HTTP request lifecycle.
- Email status is updated after successful processing.

---

## 5. Rate Limiting

- Configurable maximum number of emails per sender.
- Rate limit value is controlled through environment variables.
- Redis can be used for fast sender-based tracking.
- Rate limiting can be tested by temporarily reducing the configured limit.

Environment variable:

```env
MAX_EMAILS_PER_HOUR_PER_SENDER=200
```

---

## 6. Concurrency Control

- BullMQ worker concurrency is configurable.
- Multiple jobs can be processed in parallel.
- The number of simultaneously processed jobs can be controlled.

Environment variable:

```env
WORKER_CONCURRENCY=5
```

---

## 7. Email Delivery

- Nodemailer is used to send emails.
- Ethereal Email is used as the SMTP testing service.
- Successful email processing generates an Ethereal preview URL.
- Email status is updated after successful delivery.

---

## 8. REST API

The backend provides APIs for:

- Scheduling emails.
- Retrieving scheduled emails.
- Retrieving sent emails.
- Validating request data.
- Handling errors.

---

# Frontend Features

## 1. Login Page

The application includes a login user interface as the entry point to the application.

---

## 2. Dashboard

The dashboard includes:

- Sidebar navigation.
- User profile section.
- Scheduled email section.
- Sent email section.
- Search interface.
- Filter button.
- Refresh button.

---

## 3. Compose Email

Users can:

- Enter a recipient email address.
- Enter an email subject.
- Write an email message.
- Select a scheduled date and time.
- Schedule the email.

---

## 4. Rich Text Editor

The compose page includes formatting controls such as:

- Undo
- Redo
- Bold
- Italic
- Underline
- Text alignment
- Ordered lists
- Unordered lists

---

## 5. Scheduled Emails View

The scheduled section displays emails that are waiting to be processed.

Information can include:

- Recipient
- Subject
- Scheduled date and time
- Email status

---

## 6. Sent Emails View

The sent section displays emails that have been successfully processed.

Information can include:

- Recipient
- Subject
- Sent or scheduled time
- Email status

---

## 7. Dynamic Backend Data

The frontend retrieves email data directly from the backend.

The Scheduled and Sent sections update based on:

```text
GET /emails?status=SCHEDULED
```

and:

```text
GET /emails?status=SENT
```

The refresh button can be used to fetch the latest data.

---

# Application Workflow

```text
1. User opens the application.

2. User logs in through the login interface.

3. User navigates to the Compose page.

4. User enters:
   - Recipient
   - Subject
   - Email message

5. User selects a future date and time.

6. The frontend sends the email data to the backend.

7. The backend validates the request.

8. The email is stored in PostgreSQL.

9. The email status is set to SCHEDULED.

10. A BullMQ job is created.

11. The job is stored in Redis.

12. BullMQ waits until the scheduled time.

13. The background worker receives the job.

14. Rate limiting rules are applied.

15. Worker concurrency controls parallel processing.

16. Nodemailer sends the email through Ethereal SMTP.

17. The email status changes:

    SCHEDULED → SENT

18. The frontend retrieves the updated email information.

19. The email appears in the Sent section.
```

---

# Environment Variables

## Backend `.env`

```env
PORT=5000

DATABASE_URL="your_postgresql_connection_string"

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

WORKER_CONCURRENCY=5

MIN_EMAIL_DELAY=2000

MAX_EMAILS_PER_HOUR_PER_SENDER=200

ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=your_ethereal_email
ETHEREAL_PASS=your_ethereal_password
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

---

# Running the Complete Application

The application requires the following services to be available:

```text
PostgreSQL
Redis
Backend Server
Frontend Server
```

## Terminal 1 - Start Redis

```bash
redis-server
```

## Terminal 2 - Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend:

```text
http://localhost:5000
```

## Terminal 3 - Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Notes for Reviewers

This project demonstrates a full-stack implementation of an email scheduling system.

The architecture separates responsibilities into different layers:

```text
Frontend
    ↓
Routes
    ↓
Controllers
    ↓
Services
    ↓
Database / Queue
    ↓
Background Worker
    ↓
Email Provider
```

The frontend provides the user interface for composing and viewing emails.

The backend handles:

- Request validation
- Email scheduling
- Database persistence
- Queue management
- Background job processing
- Rate limiting
- Concurrency
- SMTP email processing

The application uses PostgreSQL for persistent email records and Redis with BullMQ for delayed and asynchronous job processing.

Nodemailer and Ethereal Email are used to test the complete email delivery workflow without sending emails to real inboxes.

---

# Summary

This project implements a full-stack email scheduling application with:

- React frontend
- Express backend
- PostgreSQL database
- Prisma ORM
- Redis
- BullMQ delayed jobs
- Background worker processing
- Email scheduling
- Persistent email records
- Rate limiting
- Configurable concurrency
- Nodemailer
- Ethereal Email integration
- Scheduled email dashboard
- Sent email dashboard
- Compose email interface
- Frontend and backend integration

The complete flow allows a user to compose an email, schedule it for a future time, store it in the database, queue it using BullMQ, process it using a background worker, send it through Ethereal SMTP, update its status, and display the result in the frontend dashboard.