# 🛒 Amazon Clone - Multi-Tier E-commerce Platform

A comprehensive e-commerce platform demonstrating **true multi-tier architecture** with separate services for each layer.

## 🏗️ Multi-Tier Architecture

### **Tier 1: Presentation Layer**
- **Frontend Service**: Nginx serving static HTML/CSS/JS
- **Load Balancer**: Nginx for API load balancing
- **Port**: 80 (Frontend), 8080 (Load Balancer)

### **Tier 2: Application Layer** 
- **API Service**: Node.js/Express REST API
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer for product images
- **Port**: 3000

### **Tier 3: Data Layer**
- **MySQL**: User management & authentication
- **MongoDB**: Products, orders, shopping cart
- **Redis**: Caching & session storage
- **Ports**: 3306 (MySQL), 27017 (MongoDB), 6379 (Redis)

### **Tier 4: Management Layer**
- **Adminer**: Database administration
- **Port**: 8081

## 📁 Project Structure

```
amazon-clone/
├── frontend/           # Presentation Tier
│   ├── index.html     # Main UI
│   ├── styles.css     # Styling
│   └── app.js         # Frontend logic
├── backend/           # Application Tier
│   ├── server.js      # API server
│   ├── package.json   # Dependencies
│   └── Dockerfile     # Container config
├── config/            # Configuration
│   ├── nginx.conf     # Frontend proxy
│   ├── loadbalancer.conf # Load balancer
│   ├── mysql-init.sql # DB initialization
│   └── mongo-init.js  # Sample data
└── docker-compose.yml # Multi-tier orchestration
```

## 🚀 Quick Start

```bash
# Start all tiers
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f api
```

## 🌐 Access Points

- **Frontend**: http://localhost (Main shopping site)
- **API**: http://localhost:3000/api (REST endpoints)
- **Load Balancer**: http://localhost:8080 (API load balancer)
- **Database Admin**: http://localhost:8081 (Adminer)

## 👤 Default Accounts

### Admin Account
- **Username**: admin
- **Password**: password
- **Access**: Product management

### Customer Account  
- **Username**: customer1
- **Password**: password
- **Access**: Shopping features

## 🛒 Features by Tier

### **Frontend Features**
- 🎨 Amazon-style UI design
- 📱 Responsive layout
- 🔍 Product search & filtering
- 🛒 Shopping cart interface
- 👤 User authentication forms

### **Backend Features**
- 🔐 JWT authentication
- 📦 Product CRUD operations
- 🛒 Cart management
- 📋 Order processing
- 🖼️ Image upload handling
- ⚡ Redis caching

### **Database Features**
- 👥 **MySQL**: User profiles, authentication
- 📦 **MongoDB**: Products, orders, cart data
- 🚀 **Redis**: Session caching, performance

## 🔧 API Endpoints

### Authentication (MySQL)
```
POST /api/register    # User registration
POST /api/login       # User login
```

### Products (MongoDB)
```
GET  /api/products    # List products
POST /api/products    # Add product (admin)
```

### Cart (MongoDB)
```
GET  /api/cart/:userId    # Get user cart
POST /api/cart            # Add to cart
```

### Orders (MongoDB)
```
GET  /api/orders/:userId  # User orders
POST /api/orders          # Place order
```

## 🗄️ Database Schemas

### MySQL - Users Table
```sql
users (
  id INT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE, 
  password VARCHAR(255),
  fullName VARCHAR(100),
  address TEXT,
  role ENUM('customer', 'admin'),
  created_at TIMESTAMP
)
```

### MongoDB - Collections
```javascript
// Products
{
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  stock: Number,
  rating: Number,
  reviews: Number
}

// Orders
{
  userId: Number,
  items: Array,
  total: Number,
  status: String,
  address: String,
  createdAt: Date
}

// Cart
{
  userId: Number,
  items: Array
}
```

## 🔄 Data Flow

1. **User Request** → Frontend (Nginx)
2. **API Call** → Load Balancer → Backend (Node.js)
3. **User Data** → MySQL Database
4. **Product Data** → MongoDB Database
5. **Cache** → Redis
6. **Response** → Frontend → User

## 🛠️ Technologies

### Frontend Tier
- HTML5, CSS3, Vanilla JavaScript
- Nginx (Static file serving)

### Application Tier  
- Node.js, Express.js
- JWT, bcryptjs, Multer
- CORS, Redis client

### Data Tier
- MySQL 8.0 (Relational data)
- MongoDB 7 (Document data)
- Redis (Caching)

### Infrastructure
- Docker & Docker Compose
- Nginx (Load balancing)
- Volume persistence
- Health checks

## 📊 Monitoring

```bash
# Check service health
curl http://localhost:3000/health

# View database
http://localhost:8081 (Adminer)

# Monitor logs
docker-compose logs -f [service-name]
```

## 🎯 Learning Objectives

- ✅ Multi-tier architecture design
- ✅ Service separation & communication
- ✅ Polyglot persistence (MySQL + MongoDB)
- ✅ Load balancing & caching
- ✅ Container orchestration
- ✅ RESTful API design
- ✅ Authentication & authorization
- ✅ File upload handling
- ✅ Database relationships vs documents

This is a **true multi-tier application** with proper separation of concerns, not just a simple web app! 🚀