const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MySQL connection
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DB || 'notes_db'
};

let db;

// Initialize database
async function initDB() {
  try {
    // First connect without database to create it
    const tempDb = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    // Create database if not exists
    await tempDb.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempDb.end();
    
    // Now connect to the specific database
    db = await mysql.createConnection(dbConfig);
    
    // Create notes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM notes ORDER BY updated_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, content } = req.body;
    const [result] = await db.execute(
      'INSERT INTO notes (title, content) VALUES (?, ?)',
      [title, content]
    );
    res.status(201).json({ id: result.insertId, title, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    await db.execute(
      'UPDATE notes SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );
    res.json({ id, title, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM notes WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Notes app running on port ${PORT}`);
  });
});