# Blog Platform

Full-stack blog application with authentication, database, and advanced features.

## Features

- **User Authentication** (JWT tokens, bcrypt hashing)
- **SQLite Database** with relational data
- **CRUD Operations** (Create, Read, Update, Delete posts)
- **Image Upload** with file validation
- **Comments System** with nested relationships
- **Security Features** (Helmet, CORS, Rate limiting)
- **Responsive Design** with modern UI
- **Real-time Updates** and dynamic content

## Technical Stack

- **Backend**: Node.js, Express, SQLite3
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate limiting
- **Frontend**: Vanilla JS, Modern CSS

## Docker Challenge

This is the most complex project requiring:

### Single Container:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p data uploads
VOLUME ["/app/data", "/app/uploads"]
EXPOSE 3000
CMD ["npm", "start"]
```

### Multi-Container with Docker Compose:
```yaml
version: '3.8'
services:
  blog-app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - blog-data:/app/data
      - blog-uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secret-key

volumes:
  blog-data:
  blog-uploads:
```

## Advanced Docker Concepts

- **Multi-volume persistence** (database + uploads)
- **Environment variables** for configuration
- **Security considerations** in containers
- **Database initialization** in containers
- **File permissions** and ownership
- **Production optimization**

Visit: http://localhost:3000

**Test the full workflow:**
1. Register/Login
2. Create posts with images
3. Add comments
4. Delete posts
5. Data persists across container restarts