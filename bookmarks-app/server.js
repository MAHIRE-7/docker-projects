const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
};

let db;

async function initDB() {
  try {
    const tempDb = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    await tempDb.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempDb.end();
    
    db = await mysql.createConnection(dbConfig);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(100) DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Bookmarks database initialized');
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/bookmarks', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM bookmarks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookmarks', async (req, res) => {
  try {
    const { title, url, description, category } = req.body;
    const [result] = await db.execute(
      'INSERT INTO bookmarks (title, url, description, category) VALUES (?, ?, ?, ?)',
      [title, url, description, category || 'General']
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bookmarks/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM bookmarks WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Bookmarks app running on port ${PORT}`);
  });
});