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
const JWT_SECRET = process.env.JWT_SECRET || 'blog-secret-key';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MySQL Connection
const dbConfig = {
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'blogdb'
};

// File upload configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Initialize database
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
      image VARCHAR(255),
      author_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);
  
  await connection.end();
}

// Auth middleware
const auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
      [username, email, hashedPassword]);
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
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
  res.json({ message: 'Login successful', user: { id: users[0].id, username: users[0].username } });
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
  const { title, content } = req.body;
  const image = req.file ? req.file.filename : null;
  
  const connection = await mysql.createConnection(dbConfig);
  const [result] = await connection.execute('INSERT INTO posts (title, content, image, author_id) VALUES (?, ?, ?, ?)', 
    [title, content, image, req.user.id]);
  await connection.end();
  
  res.json({ id: result.insertId, title, content, image });
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Blog server running on port ${PORT}`);
  });
}).catch(err => console.error('Database initialization error:', err));