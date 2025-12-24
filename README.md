# Docker Projects

This repository contains Docker-based projects.

## Projects

- **todo-app** - Node.js todo application without database
- **flask-app** - Python Flask web application
- **react-app** - React frontend application with multi-stage build
- **data-app** - Flask app demonstrating Docker volumes
- **nginx-app** - Static site served by Nginx
- **image-gallery** - Node.js image upload and gallery app
- **blog-app** - Full-stack blog with authentication and database
- **logging-app** - Structured logging app with ELK stack integration
- **chat-app** - Real-time chat application with WebSocket support
- **logs-monitor-app** - Log monitoring application for AKS deployment
- **python-tasks-app** - Python Flask task manager with SQLite database
- **notes-app** - Node.js notes application with MySQL database
- **bookmarks-app** - Node.js bookmark manager with MySQL database
- **inventory-app** - Python Flask inventory system with MariaDB database

## Usage

Build and run any project:
```bash
docker build -t project-name .
docker run -p 3000:3000 project-name
```