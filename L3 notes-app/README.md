# Notes App

Simple notes application built with Node.js and MySQL database.

## Features

- **Create Notes** with title and content
- **Edit Notes** inline editing
- **Delete Notes** with confirmation
- **MySQL Database** for persistence
- **Responsive Design** with grid layout
- **Real-time Updates** without page refresh

## Technical Stack

- **Backend**: Node.js, Express
- **Database**: MySQL with mysql2 driver
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Container**: Docker without compose

## API Endpoints

- `GET /` - Web interface
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /health` - Health check

## Docker Usage

### Start MySQL first:
```bash
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=notes_db --network my-task -p 3306:3306 mysql:8.0 
```

### Build and run app:
```bash
docker build -t notes-app .
docker run -d -p 3000:3000 --network my-task notes-app
```

### With custom MySQL connection:
```bash
docker run -p 3000:3000 \
  -e MYSQL_HOST=your-mysql-host \
  -e MYSQL_USER=your-user \
  -e MYSQL_PASSWORD=your-password \
  -e MYSQL_DB=your-database \
  notes-app
```

## Docker Concepts

- **Container linking** with --link
- **Environment variables** for configuration
- **MySQL connection** from Node.js
- **Database initialization** on startup
- **Single container** deployment

Visit: http://localhost:3000

**Test the app:**
1. Create notes with title and content
2. Edit existing notes
3. Delete notes with confirmation
4. Data persists in MySQL database