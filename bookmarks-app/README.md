# Bookmarks App

Website bookmark manager built with Node.js and MySQL database.

## Features

- **Save Bookmarks** with title, URL, and description
- **Category Organization** (Work, Learning, Entertainment, etc.)
- **Filter by Category** with interactive buttons
- **Delete Bookmarks** with confirmation
- **Responsive Grid Layout**
- **MySQL Database** for persistence

## Technical Stack

- **Backend**: Node.js, Express
- **Database**: MySQL with mysql2 driver
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Port**: 4000 (different from notes app)

## API Endpoints

- `GET /` - Web interface
- `GET /api/bookmarks` - Get all bookmarks
- `POST /api/bookmarks` - Create new bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `GET /health` - Health check

## Docker Usage

### Use existing MySQL or start new one:
```bash
# Create Network
docker network create bookmark-app-nw -d bridge
\
# Or start new MySQL container
docker run -d -p 3306:3306 --network bookmark-app-nw -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=bookmarks_db --name mysql mysql:8.0
```

### Build and run bookmarks app:
```bash
docker build -t bookmarks-app .
docker run -p 3000:3000 --link mysql bookmarks-app

OR 


docker compose up --build -d
```

## Docker Concepts


- **Environment variables** for configuration

Visit: http://localhost:3000

**Test the app:**
1. Add bookmarks with URLs and categories
2. Filter bookmarks by category
3. Delete unwanted bookmarks
4. Data persists in MySQL database