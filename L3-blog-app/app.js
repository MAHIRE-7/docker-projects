const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET ;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

async function initDB() {
  const connection = await mysql.createConnection(dbConfig);
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(50) DEFAULT 'general',
      image VARCHAR(255),
      author_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);
  
  // Add category column if it doesn't exist
  try {
    await connection.execute('ALTER TABLE posts ADD COLUMN category VARCHAR(50) DEFAULT "general"');
  } catch (err) {
    // Column already exists, ignore error
  }
  
  await connection.end();
}

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

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
      [username, email, hashedPassword]);
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: 'User exists' });
  } finally {
    await connection.end();
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const connection = await mysql.createConnection(dbConfig);
  const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
  await connection.end();
  
  if (users.length === 0 || !await bcrypt.compare(password, users[0].password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: users[0].id, username: users[0].username }, JWT_SECRET);
  res.cookie('token', token, { httpOnly: true });
  res.json({ message: 'Login successful', user: { username: users[0].username } });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/posts', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  const [posts] = await connection.execute(`
    SELECT p.*, u.username FROM posts p 
    JOIN users u ON p.author_id = u.id 
    ORDER BY p.created_at DESC
  `);
  await connection.end();
  res.json(posts);
});

app.post('/api/posts', auth, upload.single('image'), async (req, res) => {
  const { title, content, category } = req.body;
  const image = req.file ? req.file.filename : null;
  const connection = await mysql.createConnection(dbConfig);
  const [result] = await connection.execute('INSERT INTO posts (title, content, category, image, author_id) VALUES (?, ?, ?, ?, ?)', 
    [title, content, category || 'general', image, req.user.id]);
  await connection.end();
  res.json({ id: result.insertId, title, content, category, image });
});

app.delete('/api/posts/:id', auth, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  await connection.execute('DELETE FROM posts WHERE id = ? AND author_id = ?', [req.params.id, req.user.id]);
  await connection.end();
  res.json({ message: 'Post deleted' });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/politics', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'politics.html'));
});

app.get('/sports', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sports.html'));
});

app.get('/business', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'business.html'));
});

app.get('/entertainment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'entertainment.html'));
});

app.get('/technology', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'technology.html'));
});

app.get('/api/posts/category/:category', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  const [posts] = await connection.execute(`
    SELECT p.*, u.username FROM posts p 
    JOIN users u ON p.author_id = u.id 
    WHERE p.category = ?
    ORDER BY p.created_at DESC
  `, [req.params.category]);
  await connection.end();
  res.json(posts);
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`Blog server running on port ${PORT}`));
}).catch(err => console.error('DB error:', err));