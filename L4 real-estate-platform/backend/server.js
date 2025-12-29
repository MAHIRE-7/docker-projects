const express = require('express');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// MySQL Configuration (Users & Agents)
const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

// MongoDB Configuration (Properties & Inquiries)
const mongoUrl = process.env.MONGO_URL;

// MongoDB Schemas
const propertySchema = new mongoose.Schema({
  agentId: Number,
  title: String,
  description: String,
  price: Number,
  propertyType: String, // house, apartment, commercial, land
  status: { type: String, default: 'available' }, // available, sold, rented
  bedrooms: Number,
  bathrooms: Number,
  area: Number, // in sq ft
  address: String,
  city: String,
  state: String,
  zipCode: String,
  images: [String],
  amenities: [String],
  yearBuilt: Number,
  parking: Number,
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const inquirySchema = new mongoose.Schema({
  propertyId: String,
  userId: Number,
  agentId: Number,
  name: String,
  email: String,
  phone: String,
  message: String,
  inquiryType: String, // viewing, info, purchase, rent
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const favoriteSchema = new mongoose.Schema({
  userId: Number,
  propertyId: String,
  createdAt: { type: Date, default: Date.now }
});

const Property = mongoose.model('Property', propertySchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);
const Favorite = mongoose.model('Favorite', favoriteSchema);

// File upload
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  }),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Initialize MySQL
async function initMySQL() {
  const connection = await mysql.createConnection(mysqlConfig);
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      fullName VARCHAR(100),
      phone VARCHAR(20),
      address TEXT,
      role ENUM('buyer', 'agent', 'admin') DEFAULT 'buyer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS agents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE,
      license_number VARCHAR(50),
      agency_name VARCHAR(100),
      specialization VARCHAR(100),
      experience_years INT,
      rating DECIMAL(2,1) DEFAULT 0.0,
      total_sales INT DEFAULT 0,
      bio TEXT,
      profile_image VARCHAR(255),
      is_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  await connection.end();
}

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'realestate-secret');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// User Routes
app.post('/register', async (req, res) => {
  console.log('Registration attempt:', req.body);
  const { username, email, password, fullName, phone, role } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const connection = await mysql.createConnection(mysqlConfig);
  try {
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, fullName, phone, role) VALUES (?, ?, ?, ?, ?, ?)', 
      [username, email, hashedPassword, fullName, phone, role || 'buyer']
    );
    
    // If agent, create agent profile
    if (role === 'agent') {
      await connection.execute(
        'INSERT INTO agents (user_id) VALUES (?)', 
        [result.insertId]
      );
    }
    
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: 'User already exists' });
  } finally {
    await connection.end();
  }
});

app.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  
  const connection = await mysql.createConnection(mysqlConfig);
  const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
  await connection.end();
  
  if (users.length === 0 || !await bcrypt.compare(password, users[0].password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: users[0].id, username: users[0].username, role: users[0].role }, 
    process.env.JWT_SECRET || 'realestate-secret'
  );
  res.json({ token, user: { id: users[0].id, username: users[0].username, role: users[0].role } });
});

// Agent Routes
app.get('/api/agents', async (req, res) => {
  const connection = await mysql.createConnection(mysqlConfig);
  const [agents] = await connection.execute(`
    SELECT a.*, u.fullName, u.email, u.phone 
    FROM agents a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.is_verified = true
  `);
  await connection.end();
  res.json(agents);
});

app.put('/api/agents/profile', auth, upload.single('profileImage'), async (req, res) => {
  const { licenseNumber, agencyName, specialization, experienceYears, bio } = req.body;
  const profileImage = req.file ? req.file.filename : null;
  
  const connection = await mysql.createConnection(mysqlConfig);
  await connection.execute(
    'UPDATE agents SET license_number = ?, agency_name = ?, specialization = ?, experience_years = ?, bio = ?, profile_image = ? WHERE user_id = ?',
    [licenseNumber, agencyName, specialization, experienceYears, bio, profileImage, req.user.id]
  );
  await connection.end();
  
  res.json({ message: 'Agent profile updated' });
});

// Property Routes
app.get('/api/properties', async (req, res) => {
  const { type, city, minPrice, maxPrice, bedrooms, status } = req.query;
  let query = {};
  
  if (type) query.propertyType = type;
  if (city) query.city = new RegExp(city, 'i');
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  if (bedrooms) query.bedrooms = parseInt(bedrooms);
  if (status) query.status = status;
  
  const properties = await Property.find(query).sort({ createdAt: -1 });
  res.json(properties);
});

app.get('/api/properties/:id', async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found' });
  
  // Increment views
  await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  
  res.json(property);
});

app.post('/api/properties', auth, upload.array('images', 10), async (req, res) => {
  if (req.user.role !== 'agent') return res.status(403).json({ error: 'Agent access required' });
  
  const {
    title, description, price, propertyType, bedrooms, bathrooms, area,
    address, city, state, zipCode, amenities, yearBuilt, parking
  } = req.body;
  
  const images = req.files ? req.files.map(file => file.filename) : [];
  
  const property = new Property({
    agentId: req.user.id,
    title, description, price: parseFloat(price), propertyType,
    bedrooms: parseInt(bedrooms), bathrooms: parseInt(bathrooms),
    area: parseFloat(area), address, city, state, zipCode,
    images, amenities: amenities ? amenities.split(',') : [],
    yearBuilt: parseInt(yearBuilt), parking: parseInt(parking)
  });
  
  await property.save();
  res.json(property);
});

app.put('/api/properties/:id', auth, async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property || property.agentId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedProperty);
});

// Inquiry Routes
app.post('/api/inquiries', async (req, res) => {
  const { propertyId, name, email, phone, message, inquiryType } = req.body;
  
  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ error: 'Property not found' });
  
  const inquiry = new Inquiry({
    propertyId, userId: req.user?.id, agentId: property.agentId,
    name, email, phone, message, inquiryType
  });
  
  await inquiry.save();
  res.json(inquiry);
});

app.get('/api/inquiries', auth, async (req, res) => {
  let query = {};
  if (req.user.role === 'agent') {
    query.agentId = req.user.id;
  } else if (req.user.role === 'buyer') {
    query.userId = req.user.id;
  }
  
  const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
  res.json(inquiries);
});

// Favorites Routes
app.post('/api/favorites', auth, async (req, res) => {
  const { propertyId } = req.body;
  
  const existingFavorite = await Favorite.findOne({ userId: req.user.id, propertyId });
  if (existingFavorite) {
    return res.status(400).json({ error: 'Already in favorites' });
  }
  
  const favorite = new Favorite({ userId: req.user.id, propertyId });
  await favorite.save();
  res.json(favorite);
});

app.get('/api/favorites', auth, async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user.id });
  const propertyIds = favorites.map(f => f.propertyId);
  const properties = await Property.find({ _id: { $in: propertyIds } });
  res.json(properties);
});

app.delete('/api/favorites/:propertyId', auth, async (req, res) => {
  await Favorite.findOneAndDelete({ userId: req.user.id, propertyId: req.params.propertyId });
  res.json({ message: 'Removed from favorites' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Real Estate API' });
});

// Initialize and start server
Promise.all([
  initMySQL(),
  mongoose.connect(mongoUrl)
]).then(() => {
  console.log('Connected to MySQL and MongoDB');
  app.listen(PORT, () => {
    console.log(`Real Estate API running on port ${PORT}`);
  });
}).catch(err => console.error('Database connection error:', err));