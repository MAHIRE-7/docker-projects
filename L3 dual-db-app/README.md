# Dual Database Application

A Node.js application demonstrating the use of both MySQL and MongoDB databases in a single project.

## Architecture

- **MySQL** - Stores structured user data (relational)
- **MongoDB** - Stores activity logs (document-based)
- **Node.js** - Backend API server
- **Express** - Web framework

## Database Usage

### MySQL (Structured Data)
- User management (id, name, email, created_at)
- ACID transactions for data integrity
- Relational queries

### MongoDB (Flexible Data)
- Activity logging (action, userId, timestamp, details)
- Document storage for varied log formats
- Fast writes for high-volume logs

## Features

- 👥 **User Management** - Add/delete users in MySQL
- 📊 **Activity Logging** - All actions logged to MongoDB
- 🔄 **Real-time Updates** - Live log refresh
- 🗄️ **Dual Persistence** - Data stored in both databases

## Quick Start

```bash
docker-compose up -d
```

Visit: http://localhost:3000

## API Endpoints

- `GET /api/users` - Get users from MySQL
- `POST /api/users` - Create user in MySQL + log to MongoDB
- `DELETE /api/users/:id` - Delete user + log action
- `GET /api/logs` - Get activity logs from MongoDB

## Environment Variables

- `MYSQL_HOST` - MySQL server host
- `MYSQL_USER` - MySQL username
- `MYSQL_PASSWORD` - MySQL password
- `MYSQL_DATABASE` - MySQL database name
- `MONGO_URL` - MongoDB connection string

## Technologies

- Node.js & Express
- MySQL 8.0 with mysql2 driver
- MongoDB 7 with Mongoose ODM
- Docker & Docker Compose