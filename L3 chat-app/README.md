# Chat App

Real-time chat application using WebSocket technology for instant messaging.

## Features

- **Real-time messaging** with Socket.IO
- **User presence** (join/leave notifications)
- **Instant delivery** with WebSocket connections
- **Simple UI** with responsive design
- **Multiple users** support

## Technical Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JS, HTML5, CSS3
- **Real-time**: WebSocket protocol

## Docker Usage

### Build and Run:
```bash
docker build -t chat-app .
docker run -p 3000:3000 chat-app

OR

docker compose up
```


## Docker Concepts Demonstrated

- **WebSocket connections** in containers
- **Real-time communication** 
- **Port mapping** for WebSocket
- **Stateless application** design
- **Multi-user connections**

Visit: http://localhost:3000

**Test the chat:**
1. Open multiple browser tabs
2. Enter different usernames
3. Send messages in real-time
4. See join/leave notifications