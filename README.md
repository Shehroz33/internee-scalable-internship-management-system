# Scalable Internship Management System

This project was created for the Internee.pk internship task:

**Set Up a Scalable Internship Management System**

## Objective

Implement a scalable cloud database system to manage intern applications and records.

## Task Requirements Covered

- AWS RDS MySQL database setup
- Intern application records management
- Migration of existing MySQL records to cloud database
- Read replica architecture for improved read performance
- Web application connected to cloud database
- Deployment-ready Node.js application

## Architecture

```text
User Browser
    ↓
AWS EC2 Ubuntu Server
    ↓
Node.js Express Application
    ↓
AWS RDS MySQL Primary Database
    ↓
AWS RDS Read Replica
```

## Technologies Used

- Node.js
- Express.js
- MySQL
- AWS RDS
- AWS EC2
- Nginx Reverse Proxy
- Ubuntu Linux

## Features

- Add intern applications
- View intern application records
- Track internship fields and cities
- Manage application status
- Read operations can be served from read replica
- SQL schema and seed data included

## Database Files

```text
database/schema.sql
database/seed.sql
database/migration-notes.md
```

## Environment Variables

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update values:

```env
PORT=3000
BASE_PATH=/ims

DB_HOST=your-rds-primary-endpoint.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your-password
DB_NAME=internship_management

DB_READ_HOST=your-rds-read-replica-endpoint.amazonaws.com
DB_READ_USER=admin
DB_READ_PASSWORD=your-password
```

## Run

```bash
npm install
npm start
```

## Live Deployment

Live URL: Add your deployed app URL here.

Live Deployment:
https://13-221-180-156.sslip.io/ims

Cloud Database:
AWS RDS MySQL

Read Replica:
Configured using AWS RDS read replica for improved read performance.

Deployment:
AWS EC2 Ubuntu + Nginx Reverse Proxy + PM2

## Author

**Shehroz Amjad**

- LinkedIn: https://www.linkedin.com/in/shehrozamjad
- GitHub: https://github.com/Shehroz33
