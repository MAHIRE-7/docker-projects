# PHP Tasks App

Task management application built with PHP and PostgreSQL database.

## Features

- **Create Tasks** with title and description
- **Toggle Status** (pending/completed)
- **Delete Tasks** with confirmation
- **PostgreSQL Database** for persistence
- **PHP Backend** with PDO
- **Single File Application**

## Technical Stack

- **Backend**: PHP 8.2, Apache
- **Database**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript
- **Port**: 80 (HTTP)

## API Actions

- `POST action=create` - Create new task
- `POST action=toggle` - Toggle task status
- `POST action=delete` - Delete task
- `GET ?api=1` - Get all tasks

## Docker Usage

### Start PostgreSQL:
```bash
docker run -d --name postgres  -e POSTGRES_PASSWORD=postgres   -e POSTGRES_DB=tasks_db  -p 5432:5432 --network php-tsk-nw  postgres:15
```

### Build and run PHP app:
```bash
docker build -t php-tasks-app .
docker run -p 9000:80 --network php-tsk-nw
```

## Docker Concepts

- **PHP with Apache** web server
- **PostgreSQL** database connection
- **PDO** for database operations
- **Single file** PHP application
- **Different port** (9000) for multiple apps

Visit: http://localhost:9000

**Test the app:**
1. Create tasks with titles and descriptions
2. Toggle task status (pending/completed)
3. Delete completed tasks
4. Data persists in PostgreSQL database

**Different Tech Stack:**
- **PHP** instead of Node.js/Python/Go
- **PostgreSQL** database
- **Apache** web server
- **Single file** application structure