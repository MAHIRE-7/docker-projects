# 🏠 RealEstate Pro - Multi-Tier Property Management Platform

A comprehensive real estate platform demonstrating advanced multi-tier architecture with role-based access and property management features.

## 🏗️ Multi-Tier Architecture

### **Tier 1: Presentation Layer**
- **Frontend**: HTML, CSS, JavaScript
- **Features**: Property browsing, agent profiles, inquiry system, favorites

### **Tier 2: Application Layer**
- **Backend**: Node.js, Express.js REST API
- **Authentication**: JWT with role-based access (Buyer, Agent, Admin)
- **File Upload**: Multiple property images with Multer
- **Email**: Nodemailer for inquiry notifications
- **Port**: 5000

### **Tier 3: Data Layer**
- **MySQL**: User management, agent profiles, authentication
- **MongoDB**: Property listings, inquiries, favorites
- **Strategy**: Structured user data vs. flexible property data

## 📁 Project Structure

```
real-estate-platform/
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

### Buyer Account
- **Username**: buyer1
- **Password**: password
- **Features**: Browse properties, save favorites, submit inquiries

### Real Estate Agent
- **Username**: agent1
- **Password**: password
- **Features**: Add properties, manage listings, handle inquiries

### Admin Account
- **Username**: admin
- **Password**: password
- **Features**: Full system access, user management

## 🏠 Features

### **Buyer Features**
- 🔍 **Advanced Property Search** - Filter by type, price, location, bedrooms
- 📋 **Property Details** - High-resolution images, specifications, amenities
- ❤️ **Favorites System** - Save and manage favorite properties
- 📞 **Inquiry System** - Contact agents directly for viewings/information
- 🏘️ **Agent Profiles** - View agent ratings, experience, specializations

### **Agent Features**
- 🏠 **Property Management** - Add, edit, and manage property listings
- 📸 **Multi-Image Upload** - Upload multiple property photos
- 📊 **Inquiry Management** - Handle buyer inquiries and requests
- 👤 **Profile Management** - Update license, agency, specialization info
- 📈 **Performance Tracking** - View property views and engagement

### **Advanced Features**
- 🔐 **Role-Based Authentication** - Buyer, Agent, Admin access levels
- 🖼️ **Image Gallery** - Multiple property images with gallery view
- 📱 **Responsive Design** - Mobile-optimized interface
- 🏷️ **Property Status** - Available, Sold, Rented status tracking
- ⭐ **Featured Properties** - Highlight premium listings

## 🗄️ Database Design

### **MySQL (Structured Data)**
```sql
-- User management and authentication
users (id, username, email, password, fullName, phone, address, role)

-- Agent profiles and credentials
agents (id, user_id, license_number, agency_name, specialization, 
        experience_years, rating, total_sales, bio, profile_image, is_verified)
```

### **MongoDB (Flexible Data)**
```javascript
// Property listings with dynamic attributes
Properties {
  agentId, title, description, price, propertyType, status,
  bedrooms, bathrooms, area, address, city, state, zipCode,
  images[], amenities[], yearBuilt, parking, featured, views
}

// Buyer inquiries and communications
Inquiries {
  propertyId, userId, agentId, name, email, phone,
  message, inquiryType, status, createdAt
}

// User favorites and saved properties
Favorites {
  userId, propertyId, createdAt
}
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/register` - User registration with role selection
- `POST /api/login` - User authentication

### **Properties (MongoDB)**
- `GET /api/properties` - List properties with filters
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Add property (agent only)
- `PUT /api/properties/:id` - Update property (owner only)

### **Agents (MySQL)**
- `GET /api/agents` - List verified agents
- `PUT /api/agents/profile` - Update agent profile

### **Inquiries (MongoDB)**
- `POST /api/inquiries` - Submit property inquiry
- `GET /api/inquiries` - Get user/agent inquiries

### **Favorites (MongoDB)**
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:propertyId` - Remove favorite

## 🎯 Key Learning Concepts

### **Multi-Tier Architecture**
- Clear separation of concerns across tiers
- Independent scaling and technology choices
- Specialized data storage strategies

### **Role-Based Access Control**
- JWT authentication with role claims
- Route-level authorization middleware
- Feature access based on user roles

### **Polyglot Persistence**
- MySQL for structured user/agent data
- MongoDB for flexible property/inquiry data
- Optimized queries and indexing

### **File Upload Management**
- Multiple image upload with Multer
- File storage and serving strategies
- Image optimization considerations

### **Real Estate Domain Logic**
- Property status management
- Agent-buyer communication flow
- Search and filtering algorithms

## 🛠️ Technologies Used

### **Frontend**
- HTML5, CSS3, Vanilla JavaScript
- Responsive grid layouts
- Modal-based interactions
- Dynamic content rendering

### **Backend**
- Node.js & Express.js
- JWT authentication
- Multer file uploads
- Nodemailer email integration
- CORS handling

### **Databases**
- MySQL 8.0 (User/Agent data)
- MongoDB 7.0 (Property/Inquiry data)
- Optimized indexing strategies

## 🚀 Running the Application

1. **Start MySQL and MongoDB services**
2. **Initialize databases** with provided scripts
3. **Start backend server**: `npm start` in backend/
4. **Open frontend**: Serve frontend/ directory
5. **Access application**: http://localhost:5000

## 📱 Usage Flow

### **For Buyers**
1. **Register** as a buyer
2. **Browse properties** with advanced filters
3. **View detailed** property information
4. **Save favorites** for later viewing
5. **Submit inquiries** to contact agents

### **For Agents**
1. **Register** as an agent
2. **Complete profile** with license and experience
3. **Add property listings** with multiple photos
4. **Manage inquiries** from potential buyers
5. **Track property** views and engagement

## 🔮 Future Enhancements

- **Virtual Tours** - 360° property viewing
- **Mortgage Calculator** - Financing tools
- **Market Analytics** - Price trends and insights
- **Mobile App** - Native iOS/Android apps
- **CRM Integration** - Customer relationship management
- **Advanced Search** - Map-based property search
- **Automated Valuations** - AI-powered property pricing
- **Document Management** - Contract and paperwork handling

## 📊 Sample Data

The platform includes comprehensive sample data:
- **8 Properties** across different types (house, apartment, commercial, land)
- **2 Verified Agents** with complete profiles
- **Multiple Property Types** with realistic pricing
- **Various Locations** across different states
- **Rich Property Details** with amenities and specifications

This real estate platform demonstrates enterprise-level multi-tier architecture with sophisticated role-based functionality and real-world business logic! 🏠✨