# Docker Learning Projects

A comprehensive collection of Docker projects organized by complexity level for hands-on learning and practice.

## 🎯 Learning Path

### **Level 1: Beginner (Basic Dockerfile)**
*Learn basic containerization concepts*

- **nginx-app** - Static website with Nginx server
- **flask-app** - Simple Python Flask web application
- **todo-app** - Basic Node.js todo app without database

### **Level 2: Intermediate (Single Container + Database)**
*Learn database integration and environment variables*

- **data-app** - Flask app with volume persistence
- **image-gallery** - Node.js file upload with volume storage
- **php-tasks-app** - PHP application with PostgreSQL

### **Level 3: Advanced (Multi-Container + Docker Compose)**
*Learn service orchestration and networking*

- **notes-app** - Node.js notes app with MySQL database
- **bookmarks-app** - Node.js bookmark manager with MySQL
- **chat-app** - Real-time WebSocket chat application
- **inventory-app** - Python Flask inventory system with MariaDB

### **Level 4: Expert (Complex Applications)**
*Learn advanced Docker concepts and production deployment*

- **blog-app** - Full-stack blog with authentication and file uploads
- **react-app** - React frontend with multi-stage build optimization

## 🚀 Quick Start

### Run Any Project:
```bash
# For single container projects
cd project-name
docker build -t project-name .
docker run -p PORT:PORT project-name

# For multi-container projects
cd project-name
docker-compose up -d
```

## 📚 Practice Mode

### Remove All Docker Files for Practice:
```bash
# Windows (PowerShell)
Get-ChildItem -Recurse -Name "Dockerfile", "docker-compose.yml", "docker-compose.yaml" | Remove-Item -Force

# Linux/Mac
find . -name "Dockerfile" -o -name "docker-compose.yml" -o -name "docker-compose.yaml" | xargs rm -f
```

### Practice Challenges:
1. **Recreate Dockerfiles** from scratch using README instructions
2. **Write docker-compose.yml** files for multi-container apps
3. **Add health checks** and proper networking
4. **Implement volume persistence** for data storage

## 🛠 Technologies Covered

- **Languages**: Node.js, Python, PHP, HTML/CSS/JS
- **Databases**: MySQL, PostgreSQL, MariaDB, SQLite
- **Web Servers**: Nginx, Apache, Express
- **Concepts**: Multi-stage builds, volumes, networks, health checks

## 📋 Future Project Ideas

### **Level 5: Production Ready**
- **microservices-app** - Multi-service architecture with API Gateway
- **monitoring-stack** - Prometheus + Grafana monitoring setup
- **ci-cd-pipeline** - Jenkins/GitHub Actions with Docker
- **kubernetes-deploy** - Kubernetes deployment manifests

### **Level 6: Advanced Orchestration**
- **docker-swarm-cluster** - Multi-node Docker Swarm setup
- **service-mesh** - Istio service mesh implementation
- **logging-stack** - ELK Stack (Elasticsearch, Logstash, Kibana)
- **security-hardening** - Container security best practices

## 🎓 Learning Objectives

- **Dockerfile creation** and optimization
- **Docker Compose** orchestration
- **Volume management** and data persistence
- **Network configuration** and service communication
- **Environment variables** and configuration management
- **Health checks** and container monitoring
- **Multi-stage builds** for production optimization
- **Security best practices** in containerization

## 📖 Usage Instructions

1. **Start with Level 1** projects to understand basics
2. **Progress through levels** as you gain confidence
3. **Use Practice Mode** to test your knowledge
4. **Experiment with modifications** to deepen understanding
5. **Try Future Projects** for advanced challenges

## 🔧 Prerequisites

- Docker Desktop installed
- Basic command line knowledge
- Understanding of web development concepts
- Text editor or IDE

---

**Happy Learning! 🐳**