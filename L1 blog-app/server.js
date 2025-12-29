const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database setup
const db = new sqlite3.Database('./data/blog.db');

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    author_id INTEGER,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    author_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(author_id) REFERENCES users(id)
  )`);
});

// File upload configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auth routes
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
    [username, email, hashedPassword], function(err) {
    if (err) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
    res.json({ token, user: { id: this.lastID, username, email } });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

// Blog routes
app.get('/api/posts', (req, res) => {
  db.all(`SELECT p.*, u.username as author FROM posts p 
          JOIN users u ON p.author_id = u.id 
          ORDER BY p.created_at DESC`, (err, posts) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(posts);
  });
});

app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.filename : null;
  
  db.run('INSERT INTO posts (title, content, author_id, image) VALUES (?, ?, ?, ?)',
    [title, content, req.user.id, image], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    db.get(`SELECT p.*, u.username as author FROM posts p 
            JOIN users u ON p.author_id = u.id 
            WHERE p.id = ?`, [this.lastID], (err, post) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(post);
    });
  });
});

app.get('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  
  db.get(`SELECT p.*, u.username as author FROM posts p 
          JOIN users u ON p.author_id = u.id 
          WHERE p.id = ?`, [postId], (err, post) => {
    if (err || !post) return res.status(404).json({ error: 'Post not found' });
    
    db.all(`SELECT c.*, u.username as author FROM comments c 
            JOIN users u ON c.author_id = u.id 
            WHERE c.post_id = ? ORDER BY c.created_at ASC`, [postId], (err, comments) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ ...post, comments });
    });
  });
});

app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  
  db.run('INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
    [postId, req.user.id, content], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    db.get(`SELECT c.*, u.username as author FROM comments c 
            JOIN users u ON c.author_id = u.id 
            WHERE c.id = ?`, [this.lastID], (err, comment) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(comment);
    });
  });
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const postId = req.params.id;
  
  db.get('SELECT * FROM posts WHERE id = ? AND author_id = ?', [postId, req.user.id], (err, post) => {
    if (err || !post) return res.status(404).json({ error: 'Post not found or unauthorized' });
    
    if (post.image) {
      fs.unlink(path.join('./uploads', post.image), () => {});
    }
    
    db.run('DELETE FROM comments WHERE post_id = ?', [postId]);
    db.run('DELETE FROM posts WHERE id = ?', [postId], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Post deleted' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Blog server running on http://localhost:${PORT}`);
});