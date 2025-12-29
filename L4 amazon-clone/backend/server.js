const express = require('express');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Redis client
const redisClient = redis.createClient({ host: 'redis' });

// MySQL config
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'amazon_users'
};

// MongoDB schemas
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  stock: Number,
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 }
});

const orderSchema = new mongoose.Schema({
  userId: Number,
  items: Array,
  total: Number,
  status: { type: String, default: 'pending' },
  address: String,
  createdAt: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
  userId: Number,
  items: Array
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Cart = mongoose.model('Cart', cartSchema);

// File upload
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  })
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

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
      role ENUM('customer', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.end();
}

// User routes
app.post('/api/register', async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const connection = await mysql.createConnection(mysqlConfig);
  try {
    await connection.execute('INSERT INTO users (username, email, password, fullName) VALUES (?, ?, ?, ?)', 
      [username, email, hashedPassword, fullName]);
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: 'User exists' });
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
  
  const token = jwt.sign({ id: users[0].id, username: users[0].username, role: users[0].role }, process.env.JWT_SECRET);
  res.json({ token, user: { username: users[0].username, role: users[0].role } });
});

// Product routes
app.get('/api/products', async (req, res) => {
  const { category, search } = req.query;
  let query = {};
  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };
  
  const products = await Product.find(query);
  res.json(products);
});

app.post('/api/products', auth, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  
  const { name, description, price, category, stock } = req.body;
  const product = new Product({
    name, description, price: parseFloat(price), category, stock: parseInt(stock),
    image: req.file ? req.file.filename : null
  });
  
  await product.save();
  res.json(product);
});

// Cart routes
app.get('/api/cart/:userId', async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId }) || { items: [] };
  res.json(cart);
});

app.post('/api/cart', async (req, res) => {
  const { userId, productId, name, price, image } = req.body;
  
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = new Cart({ userId, items: [] });
  
  const existingItem = cart.items.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ productId, name, price, quantity: 1, image });
  }
  
  await cart.save();
  res.json(cart);
});

// Order routes
app.post('/api/orders', async (req, res) => {
  const { userId, items, total, address } = req.body;
  const order = new Order({ userId, items, total, address });
  await order.save();
  
  await Cart.findOneAndDelete({ userId });
  res.json(order);
});

app.get('/api/orders/:userId', async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API' });
});

// Initialize and start
Promise.all([
  initMySQL(),
  mongoose.connect(process.env.MONGO_URL)
]).then(() => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}).catch(err => console.error('Database error:', err));