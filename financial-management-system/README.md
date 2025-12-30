# 💰 FinanceTracker Pro - Multi-Tier Financial Management Platform

A comprehensive financial management system built with Flask demonstrating advanced multi-tier architecture with personal finance tracking, investment portfolio management, and financial advisory features.

## 🏗️ Multi-Tier Architecture

### **Tier 1: Presentation Layer**
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Features**: Dashboard analytics, account management, transaction tracking, budget planning
- **Styling**: Tailwind CSS with responsive design
- **Charts**: Chart.js for financial visualizations

### **Tier 2: Application Layer**
- **Backend**: Python Flask REST API
- **Authentication**: JWT with role-based access (Client, Advisor, Admin)
- **File Upload**: Receipt and document management
- **Real-time**: Redis for session management and caching
- **Port**: 5000

### **Tier 3: Data Layer**
- **MySQL**: User management, accounts, financial goals, advisor profiles
- **MongoDB**: Transactions, budgets, investment portfolios, financial insights
- **Redis**: Session storage, caching, real-time data
- **Strategy**: Structured financial data vs. flexible transaction/analytics data

## 📁 Project Structure

```
financial-management-system/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables
├── frontend/
│   ├── index.html            # Main UI
│   ├── styles.css            # Custom styling
│   └── script.js             # Frontend logic
└── database/
    ├── mysql-schema.sql      # MySQL database schema
    └── mongo-data.js         # MongoDB sample data
```

## 🐳 Docker Containerization Requirements

### **Backend Dockerfile Requirements**
```dockerfile
# Use Python 3.11 slim for smaller image size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/receipts uploads/documents

# Expose application port
EXPOSE 5000

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start application with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

### **Frontend Dockerfile Requirements**
```dockerfile
# Use Nginx Alpine for serving static files
FROM nginx:alpine

# Copy frontend files
COPY . /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name localhost;
    
    # Serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to Flask backend
    location /api/ {
        proxy_pass http://financial-backend:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Handle file uploads
    client_max_body_size 10M;
}
```

### **Docker Compose Configuration**
```yaml
version: '3.8'

services:
  # Frontend Service
  financial-frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - financial-backend
    networks:
      - financial-network
    restart: unless-stopped

  # Backend Service
  financial-backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=mysql://financial_user:secure_password@mysql-db/financial_db
      - MONGO_URL=mongodb://mongodb:27017/financial_db
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SECRET_KEY=your-super-secret-key
      - JWT_SECRET_KEY=your-jwt-secret-key
    depends_on:
      mysql-db:
        condition: service_healthy
      mongodb:
        condition: service_started
      redis:
        condition: service_started
    volumes:
      - financial_uploads:/app/uploads
    networks:
      - financial-network
    restart: unless-stopped

  # MySQL Database
  mysql-db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: financial_db
      MYSQL_USER: financial_user
      MYSQL_PASSWORD: secure_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/mysql-schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - financial-network
    restart: unless-stopped

  # MongoDB Database
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./database/mongo-data.js:/docker-entrypoint-initdb.d/mongo-data.js:ro
    networks:
      - financial-network
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - financial-network
    restart: unless-stopped

networks:
  financial-network:
    driver: bridge

volumes:
  mysql_data:
  mongo_data:
  redis_data:
  financial_uploads:
```

## 👤 User Roles & Features

### **Client Features**
- 💳 **Account Management** - Multiple account types (checking, savings, investment, credit)
- 📊 **Transaction Tracking** - Categorized income/expense tracking with receipt uploads
- 📈 **Budget Planning** - Create and monitor budgets with spending alerts
- 🎯 **Financial Goals** - Set and track progress toward financial objectives
- 💼 **Investment Portfolio** - Track stocks, bonds, ETFs, and cryptocurrency holdings
- 📱 **Dashboard Analytics** - Visual spending patterns and financial insights
- 🔔 **Smart Notifications** - Budget alerts, goal milestones, bill reminders

### **Financial Advisor Features**
- 👥 **Client Management** - Manage multiple client portfolios and relationships
- 📋 **Financial Planning** - Create comprehensive financial plans and recommendations
- 📊 **Portfolio Analysis** - Advanced investment analysis and risk assessment
- 💬 **Client Communication** - Secure messaging and consultation scheduling
- 📈 **Performance Reporting** - Generate detailed financial performance reports
- 🎓 **Educational Resources** - Share financial literacy content with clients

### **Admin Features**
- 👨‍💼 **User Management** - Manage clients, advisors, and system users
- 🏢 **Platform Analytics** - System-wide usage and performance metrics
- ⚙️ **System Configuration** - Platform settings, fee structures, compliance
- 🔐 **Security Management** - Access controls, audit logs, compliance reporting
- 📊 **Business Intelligence** - Revenue analytics, user engagement metrics

## 🗄️ Database Design

### **MySQL (Structured Data)**
```sql
-- User management and authentication
users (id, username, email, password_hash, first_name, last_name, role)

-- Financial accounts
accounts (id, user_id, account_number, account_type, balance, currency)

-- Financial goals and planning
financial_goals (id, user_id, goal_name, target_amount, target_date, priority)

-- Financial advisor profiles
advisors (id, user_id, license_number, specialization, hourly_rate, rating)

-- Client-advisor relationships
client_advisor_relationships (id, client_id, advisor_id, relationship_type)

-- Recurring transactions
recurring_transactions (id, user_id, frequency, amount, next_execution_date)
```

### **MongoDB (Flexible Data)**
```javascript
// Transaction records with rich metadata
Transactions {
  user_id, account_id, transaction_type, category, amount,
  description, date, tags[], location, receipt_url, created_at
}

// Budget planning and tracking
Budgets {
  user_id, name, categories[], total_allocated, period,
  start_date, end_date, status, created_at
}

// Investment portfolio management
Portfolios {
  user_id, holdings[], total_value, total_gain_loss,
  asset_allocation, risk_profile, created_at
}

// Financial insights and recommendations
Insights {
  user_id, insight_type, title, description, priority,
  category, action_items[], created_at, is_read
}

// Financial reports and analytics
Reports {
  user_id, report_type, period, data, generated_at
}
```

## 🔧 Key Dependencies

### **Backend Dependencies**
```python
Flask==2.3.3                 # Web framework
Flask-SQLAlchemy==3.0.5      # ORM for MySQL
Flask-JWT-Extended==4.5.2    # JWT authentication
Flask-Bcrypt==1.0.1          # Password hashing
Flask-CORS==4.0.0            # Cross-origin requests
Flask-Migrate==4.0.5         # Database migrations
PyMySQL==1.1.0               # MySQL connector
pymongo==4.5.0               # MongoDB driver
redis==4.6.0                 # Redis client
gunicorn==21.2.0             # WSGI server
```

### **Frontend Dependencies**
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive financial charts
- **Font Awesome** - Icon library
- **Vanilla JavaScript** - No framework dependencies

## 🚀 Container Orchestration Features

### **Health Checks**
- Flask application health endpoint
- MySQL connection monitoring
- MongoDB availability checks
- Redis cache connectivity

### **Volume Management**
- Persistent MySQL financial data
- MongoDB transaction storage
- Redis session persistence
- File upload storage (receipts, documents)

### **Network Security**
- Internal service communication
- API rate limiting
- CORS configuration
- JWT token validation

### **Scaling Considerations**
- Gunicorn multi-worker setup
- Database connection pooling
- Redis session clustering
- Load balancer ready

## 🔐 Security Requirements

### **Authentication & Authorization**
- JWT token-based authentication
- Role-based access control (Client, Advisor, Admin)
- Password hashing with bcrypt
- Session management with Redis

### **Data Protection**
- Financial data encryption
- Secure file upload handling
- API input validation
- SQL injection prevention

### **Container Security**
- Non-root user execution
- Minimal base images
- Security scanning integration
- Environment variable encryption

## 📊 Financial Analytics Features

### **Dashboard Metrics**
- Net worth tracking
- Cash flow analysis
- Spending categorization
- Budget variance reporting

### **Investment Analytics**
- Portfolio performance tracking
- Asset allocation analysis
- Risk assessment metrics
- Market data integration

### **Reporting Capabilities**
- Monthly financial summaries
- Tax preparation reports
- Goal progress tracking
- Advisor performance metrics

## 🎯 Docker Best Practices

### **Image Optimization**
- Multi-stage builds where applicable
- Alpine Linux base images
- Layer caching optimization
- .dockerignore configuration

### **Development Workflow**
- Hot reload for development
- Environment-specific configurations
- Database seeding scripts
- Testing container setup

### **Production Deployment**
- Container health monitoring
- Automated backup procedures
- SSL/TLS certificate management
- Log aggregation setup

## 🚀 Getting Started

### **Prerequisites**
- Docker Desktop
- Python 3.11+
- MySQL 8.0+
- MongoDB 7.0+
- Redis 7.0+

### **Quick Start**
1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Build and run with Docker Compose
4. Access the application at http://localhost

### **Default Accounts**
- **Admin**: admin / password
- **Advisor**: advisor1 / password  
- **Client**: client1 / password

This financial management system demonstrates enterprise-level Flask application containerization with comprehensive financial features, multi-database architecture, and production-ready deployment strategies! 💰🐳