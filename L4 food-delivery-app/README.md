# 🍕 FoodExpress - Multi-Tier Food Delivery Platform

A comprehensive food delivery platform demonstrating multi-tier architecture with separate databases for different data types.

## 🏗️ Multi-Tier Architecture

### **Tier 1: Presentation Layer**
- **Frontend**: HTML, CSS, JavaScript
- **Features**: Restaurant browsing, menu viewing, cart management, order placement

### **Tier 2: Application Layer**
- **Backend**: Node.js, Express.js REST API
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer for restaurant and menu images
- **Port**: 5000

### **Tier 3: Data Layer**
- **MySQL**: User management, restaurant information
- **MongoDB**: Menu items, orders, shopping carts
- **Separation**: Structured data vs. flexible document data

## 📁 Project Structure

```
food-delivery-app/
├── backend/
│   ├── server.js          # Main API server
│   ├── package.json       # Dependencies
│   └── .env.example       # Environment variables
├── frontend/
│   ├── index.html         # Main UI
│   ├── styles.css         # Styling
│   └── app.js            # Frontend logic
└── database/
    ├── mysql-schema.sql   # MySQL database schema
    └── mongo-data.js      # MongoDB sample data
```

## 🚀 Setup Instructions

### **Prerequisites**
- Node.js (v14+)
- MySQL (v8.0+)
- MongoDB (v4.4+)

### **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

### **Database Setup**

#### MySQL
```bash
mysql -u root -p < database/mysql-schema.sql
```

#### MongoDB
```bash
mongosh < database/mongo-data.js
```

### **Frontend Setup**
Open `frontend/index.html` in a web browser or serve with a local server.

## 👤 Default Accounts

### Customer Account
- **Username**: customer1
- **Password**: password
- **Features**: Browse restaurants, order food

### Restaurant Owner
- **Username**: restaurant1  
- **Password**: password
- **Features**: Add restaurants, manage menu items

### Admin Account
- **Username**: admin
- **Password**: password
- **Features**: Full system access

## 🍽️ Features

### **Customer Features**
- 🔍 **Restaurant Discovery** - Browse by cuisine type
- 📋 **Menu Browsing** - View detailed menu items
- 🛒 **Cart Management** - Add items from single restaurant
- 💳 **Order Placement** - Checkout with delivery address
- 📦 **Order Tracking** - View order history

### **Restaurant Owner Features**
- 🏪 **Restaurant Management** - Add restaurant details
- 📝 **Menu Management** - Add menu items with images
- 📊 **Order Management** - View incoming orders
- 💰 **Pricing Control** - Set delivery fees and minimums

### **System Features**
- 🔐 **Multi-Role Authentication** - Customer, Restaurant, Admin
- 🖼️ **Image Upload** - Restaurant and menu item photos
- 🚚 **Delivery Estimation** - Time and fee calculation
- 📱 **Responsive Design** - Mobile-friendly interface

## 🗄️ Database Design

### **MySQL (Structured Data)**
```sql
-- Users (customers, restaurant owners, admins)
users (id, username, email, password, fullName, phone, address, role)

-- Restaurant information
restaurants (id, name, description, cuisine_type, address, phone, 
            rating, delivery_time, delivery_fee, min_order, owner_id)
```

### **MongoDB (Flexible Data)**
```javascript
// Menu items with varying attributes
MenuItems {
  restaurantId, name, description, price, category,
  image, available, rating, preparationTime
}

// Orders with dynamic item lists
Orders {
  userId, restaurantId, items[], total, status,
  deliveryAddress, orderTime, estimatedDelivery
}

// Shopping carts
Carts {
  userId, restaurantId, items[], updatedAt
}
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/register` - User registration
- `POST /api/login` - User login

### **Restaurants (MySQL)**
- `GET /api/restaurants` - List all restaurants
- `POST /api/restaurants` - Add restaurant (auth required)

### **Menu (MongoDB)**
- `GET /api/restaurants/:id/menu` - Get restaurant menu
- `POST /api/menu` - Add menu item (auth required)

### **Cart (MongoDB)**
- `GET /api/cart/:userId` - Get user cart
- `POST /api/cart` - Add item to cart

### **Orders (MongoDB)**
- `GET /api/orders/:userId` - Get user orders
- `POST /api/orders` - Place new order

## 🎯 Key Learning Concepts

### **Multi-Tier Architecture**
- Clear separation of presentation, application, and data layers
- Independent scaling of each tier
- Technology specialization per layer

### **Polyglot Persistence**
- MySQL for structured, relational data (users, restaurants)
- MongoDB for flexible, document data (menus, orders)
- Choosing right database for data characteristics

### **Authentication & Authorization**
- JWT token-based authentication
- Role-based access control (customer, restaurant, admin)
- Secure password hashing with bcrypt

### **File Upload Handling**
- Multer middleware for image uploads
- File storage and serving
- Image optimization considerations

## 🛠️ Technologies Used

### **Frontend**
- HTML5, CSS3, Vanilla JavaScript
- Responsive design principles
- Modern UI/UX patterns

### **Backend**
- Node.js & Express.js
- JWT authentication
- Multer file uploads
- CORS handling

### **Databases**
- MySQL 8.0 (Relational data)
- MongoDB 7.0 (Document data)
- Database indexing for performance

## 🚀 Running the Application

1. **Start MySQL and MongoDB services**
2. **Initialize databases** with provided scripts
3. **Start backend server**: `npm start` in backend/
4. **Open frontend**: Serve frontend/ directory
5. **Access application**: http://localhost:3000 (or your server port)

## 📱 Usage Flow

1. **Register** as customer or restaurant owner
2. **Browse restaurants** by cuisine type
3. **View menu items** for selected restaurant
4. **Add items to cart** (single restaurant only)
5. **Place order** with delivery address
6. **Track order status** in order history

## 🔮 Future Enhancements

- Real-time order tracking
- Payment gateway integration
- Delivery driver management
- Restaurant analytics dashboard
- Push notifications
- Rating and review system
- Advanced search and filtering

This food delivery platform demonstrates enterprise-level multi-tier architecture with proper data separation and role-based functionality! 🚀