const express = require('express');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'amazon-secret';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// MySQL Configuration (Users)
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'amazon_users'
};

// MongoDB Configuration (Products, Orders, Cart)
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo:27017/amazon_store';

// MongoDB Schemas
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  stock: Number,
  rating: { type: Number, default: 0 },
  reviews: Number,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: Number,
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: Number,
  status: { type: String, default: 'pending' },
  address: String,
  createdAt: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
  userId: Number,
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Cart = mongoose.model('Cart', cartSchema);

// File upload
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
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
      address TEXT,
      phone VARCHAR(20),
      role ENUM('customer', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.end();
}

// Auth middleware
const auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// User Routes (MySQL)
app.post('/api/register', async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const connection = await mysql.createConnection(mysqlConfig);
  try {
    await connection.execute('INSERT INTO users (username, email, password, fullName) VALUES (?, ?, ?, ?)', 
      [username, email, hashedPassword, fullName]);
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
  
  const token = jwt.sign({ id: users[0].id, username: users[0].username, role: users[0].role }, JWT_SECRET);
  res.cookie('token', token, { httpOnly: true });
  res.json({ message: 'Login successful', user: { username: users[0].username, role: users[0].role } });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// Product Routes (MongoDB)
app.get('/api/products', async (req, res) => {
  const { category, search } = req.query;
  let query = {};
  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };
  
  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/products', auth, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  const { name, description, price, category, stock } = req.body;
  const image = req.file ? req.file.filename : null;
  
  const product = new Product({
    name, description, price: parseFloat(price), category, stock: parseInt(stock), image
  });
  
  await product.save();
  res.json(product);
});

// Cart Routes (MongoDB)
app.get('/api/cart', auth, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }) || { items: [] };
  res.json(cart);
});

app.post('/api/cart', auth, async (req, res) => {
  const { productId, name, price, image } = req.body;
  
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    cart = new Cart({ userId: req.user.id, items: [] });
  }
  
  const existingItem = cart.items.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ productId, name, price, quantity: 1, image });
  }
  
  await cart.save();
  res.json(cart);
});

// Order Routes (MongoDB)
app.post('/api/orders', auth, async (req, res) => {
  const { items, total, address } = req.body;
  
  const order = new Order({
    userId: req.user.id,
    items,
    total,
    address
  });
  
  await order.save();
  
  // Clear cart
  await Cart.findOneAndDelete({ userId: req.user.id });
  
  res.json(order);
});

app.get('/api/orders', auth, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

app.get('/api/me', auth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize and start server
Promise.all([
  initMySQL(),
  mongoose.connect(mongoUrl)
]).then(() => {
  console.log('Connected to MySQL and MongoDB');
  app.listen(PORT, () => {
    console.log(`Amazon Clone server running on port ${PORT}`);
  });
}).catch(err => console.error('Database connection error:', err));