# Data Persistence App

Flask app demonstrating Docker volumes for data persistence.

## Features

- Add log messages
- Data persists to `/data/logs.json`
- Clear all logs
- View status

## Docker Volume Challenge

Write a Dockerfile and run with volume:

```bash
# Build image
docker build -t data-app .

# Run with volume (data persists between container restarts)
docker run -p 5000:5000 -v data-volume:/data data-app

# Or bind mount to host directory
docker run -p 5000:5000 -v ./data:/data data-app
```

**Key concepts:**
- `VOLUME ["/data"]` in Dockerfile
- `-v volume-name:/data` for named volumes
- `-v ./host-path:/data` for bind mounts
- Data survives container restarts/removal