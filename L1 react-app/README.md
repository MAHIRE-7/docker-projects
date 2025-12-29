# React Docker App

A React application with counter and todo functionality.

## Local Setup

```bash
npm install
npm start
```

Visit http://localhost:3000

## Docker Challenge

Write a Dockerfile to:
- Use Node.js base image
- Install dependencies
- Build the React app
- Serve with nginx
- Expose port 80

**Hint:** This requires multi-stage build (build stage + serve stage)