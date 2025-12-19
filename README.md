# Docker Projects

This repository contains Docker-based projects.

## Projects

- **todo-app** - Node.js todo application without database
- **flask-app** - Python Flask web application
- **react-app** - React frontend application with multi-stage build

## Usage

Build and run any project:
```bash
docker build -t project-name .
docker run -p 3000:3000 project-name
```