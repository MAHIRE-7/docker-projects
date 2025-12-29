# Nginx Static Site

Simple static website served by Nginx.

## Challenge

Write a Dockerfile to:
- Use nginx base image
- Copy HTML files to nginx directory
- Expose port 80
- Serve static content


## Usage:
```bash
docker build -t nginx-app .
docker run -p 8080:80 nginx-app
```

Visit: http://localhost:8080

**Concepts:**
- Nginx base image
- Static file serving
- Simple COPY instruction
- Default nginx configuration