# MongoDB Digital Diary

A beautiful diary application with a leather-bound book design using Node.js, Express, and MongoDB.

## Features

- 📖 Diary-style interface with elegant design
- ✍️ Add personal thoughts and entries
- 📅 Automatic date tracking
- ✅ Mark entries as completed/archived
- 🗑️ Delete unwanted entries
- 💾 Data persistence with MongoDB

## Quick Start

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

Visit: http://localhost:3000

### Manual Setup

1. Start MongoDB:
```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

2. Build and run the app:
```bash
docker build -t mongo-tasks-app .
docker run -p 3000:3000 --link mongo -e MONGO_URL=mongodb://mongo:27017/tasks mongo-tasks-app
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGO_URL` - MongoDB connection string

## Technologies

- Node.js & Express
- MongoDB & Mongoose
- Docker & Docker Compose