# L4 Blog Platform

A full-stack blog application with JWT authentication and file upload capabilities.

## Features

- 🔐 **JWT Authentication** - Secure login/register system
- 📝 **Blog Posts** - Create, read, delete posts
- 🖼️ **Image Uploads** - Upload images with posts (5MB limit)
- 👤 **User Management** - User registration and authentication
- 🗄️ **MySQL Database** - Persistent data storage
- 🔒 **Secure Cookies** - HTTP-only JWT tokens
- 📱 **Responsive Design** - Clean, modern interface

## Architecture

- **Backend**: Node.js, Express, JWT, Multer
- **Database**: MySQL with foreign key relationships
- **Authentication**: bcryptjs password hashing
- **File Storage**: Local uploads with volume persistence
- **Frontend**: Vanilla JavaScript with modern UI

## Quick Start

```bash
docker-compose up -d
```

Visit: http://localhost:3000

## Usage

1. **Register** a new account
2. **Login** with your credentials
3. **Create posts** with optional image uploads
4. **View all posts** from all users
5. **Delete your own posts**

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)

## Security Features

- Password hashing with bcryptjs
- JWT tokens stored in HTTP-only cookies
- File upload size limits (5MB)
- SQL injection protection with prepared statements
- User authorization for post deletion

## Technologies

- Node.js & Express
- MySQL 8.0 with mysql2
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing
- Docker & Docker Compose