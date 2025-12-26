# Image Gallery App

Node.js image upload and gallery application with attractive UI.

## Features

- **Drag & drop** image upload
- **Gallery view** with grid layout
- **Delete images** functionality
- **File validation** (JPG, PNG, GIF, 5MB limit)
- **Responsive design** with gradient background
- **Modern UI** with hover effects and animations

## Docker Challenge

Write a Dockerfile to:
- Use Node.js base image
- Install dependencies
- Create uploads directory
- Copy application files
- Expose port 3000
- Handle file persistence with volumes

## Expected Usage:
```bash
docker build -t image-gallery .
docker run -p 3000:3000 -v gallery-uploads:/app/uploads image-gallery

OR

docker-compose up --build
```

**Key Docker concepts:**
- Volume mounting for persistent uploads
- File upload handling in containers
- Static file serving
- Multi-directory COPY operations

Visit: http://localhost:3000