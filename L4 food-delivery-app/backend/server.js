const express = require('express');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MySQL Configuration (Users & Restaurants)
const mysqlConfig = {
  host: process.env.MYSQL_HOST ,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

// MongoDB Configuration (Menu Items & Orders)
const mongoUrl = process.env.MONGO_URL;

// MongoDB Schemas
const menuItemSchema = new mongoose.Schema({
  restaurantId: Number,
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  available: { type: Boolean, default: true },
  rating: { type: Number, default: 4.0 },
  preparationTime: Number
});

const orderSchema = new mongoose.Schema({
  userId: Number,
  restaurantId: Number,
  items: [{
    menuItemId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  status: { type: String, default: 'pending' },
  deliveryAddress: String,
  orderTime: { type: Date, default: Date.now },
  estimatedDelivery: Date
});

const cartSchema = new mongoose.Schema({
  userId: Number,
  restaurantId: Number,
  items: [{
    menuItemId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  updatedAt: { type: Date, default: Date.now }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.model('Order', orderSchema);
const Cart = mongoose.model('Cart', cartSchema);

// File upload
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  })
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
      role ENUM('customer', 'restaurant', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      cuisine_type VARCHAR(50),
      address TEXT,
      phone VARCHAR(20),
      rating DECIMAL(2,1) DEFAULT 4.0,
      delivery_time INT DEFAULT 30,
      delivery_fee DECIMAL(5,2) DEFAULT 2.99,
      min_order DECIMAL(6,2) DEFAULT 15.00,
      image VARCHAR(255),
      owner_id INT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);
  
  await connection.end();
}

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'food-secret');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// User Routes
app.post('/api/register', async (req, res) => {
  const { username, email, password, fullName, phone, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const connection = await mysql.createConnection(mysqlConfig);
  try {
    await connection.execute(
      'INSERT INTO users (username, email, password, fullName, phone, role) VALUES (?, ?, ?, ?, ?, ?)', 
      [username, email, hashedPassword, fullName, phone, role || 'customer']
    );
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  } finally {
    await connection.end();
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const connection = await mysql.createConnection(mysqlConfig);
  const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
  await connection.end();
  
  if (users.length === 0 || !await bcrypt.compare(password, users[0].password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: users[0].id, username: users[0].username, role: users[0].role }, 
    process.env.JWT_SECRET || 'food-secret'
  );
  res.json({ token, user: { username: users[0].username, role: users[0].role } });
});

// Restaurant Routes
app.get('/api/restaurants', async (req, res) => {
  const connection = await mysql.createConnection(mysqlConfig);
  const [restaurants] = await connection.execute('SELECT * FROM restaurants WHERE is_active = true');
  await connection.end();
  res.json(restaurants);
});

app.post('/api/restaurants', auth, upload.single('image'), async (req, res) => {
  const { name, description, cuisine_type, address, phone, delivery_time, delivery_fee, min_order } = req.body;
  const image = req.file ? req.file.filename : null;
  
  const connection = await mysql.createConnection(mysqlConfig);
  const [result] = await connection.execute(
    'INSERT INTO restaurants (name, description, cuisine_type, address, phone, delivery_time, delivery_fee, min_order, image, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, description, cuisine_type, address, phone, delivery_time, delivery_fee, min_order, image, req.user.id]
  );
  await connection.end();
  
  res.json({ id: result.insertId, name, description, cuisine_type });
});

// Menu Routes
app.get('/api/restaurants/:id/menu', async (req, res) => {
  const menuItems = await MenuItem.find({ restaurantId: req.params.id, available: true });
  res.json(menuItems);
});

app.post('/api/menu', auth, upload.single('image'), async (req, res) => {
  const { restaurantId, name, description, price, category, preparationTime } = req.body;
  const image = req.file ? req.file.filename : null;
  
  const menuItem = new MenuItem({
    restaurantId, name, description, price: parseFloat(price), 
    category, image, preparationTime: parseInt(preparationTime)
  });
  
  await menuItem.save();
  res.json(menuItem);
});

// Cart Routes
app.get('/api/cart/:userId', async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId }) || { items: [] };
  res.json(cart);
});

app.post('/api/cart', async (req, res) => {
  const { userId, restaurantId, menuItemId, name, price } = req.body;
  
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, restaurantId, items: [] });
  }
  
  // Check if adding from different restaurant
  if (cart.restaurantId && cart.restaurantId !== parseInt(restaurantId)) {
    return res.status(400).json({ error: 'Cannot add items from different restaurants' });
  }
  
  cart.restaurantId = restaurantId;
  const existingItem = cart.items.find(item => item.menuItemId === menuItemId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ menuItemId, name, price, quantity: 1 });
  }
  
  await cart.save();
  res.json(cart);
});

// Order Routes
app.post('/api/orders', async (req, res) => {
  const { userId, restaurantId, items, total, deliveryAddress } = req.body;
  
  const estimatedDelivery = new Date();
  estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 45);
  
  const order = new Order({
    userId, restaurantId, items, total, deliveryAddress, estimatedDelivery
  });
  
  await order.save();
  await Cart.findOneAndDelete({ userId });
  
  res.json(order);
});

app.get('/api/orders/:userId', async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId }).sort({ orderTime: -1 });
  res.json(orders);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Food Delivery API' });
});

// Initialize and start server
Promise.all([
  initMySQL(),
  mongoose.connect(mongoUrl)
]).then(() => {
  console.log('Connected to MySQL and MongoDB');
  app.listen(PORT, () => {
    console.log(`Food Delivery API running on port ${PORT}`);
  });
}).catch(err => console.error('Database connection error:', err));