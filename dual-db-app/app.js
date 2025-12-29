const express = require('express');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL Connection
const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER ,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

// MongoDB Connection
const mongoUrl = process.env.MONGO_URL;

// MongoDB Schema for Activity Logs
const logSchema = new mongoose.Schema({
  action: String,
  userId: Number,
  userName: String,
  timestamp: { type: Date, default: Date.now },
  details: String
});

const ActivityLog = mongoose.model('ActivityLog', logSchema);

// Initialize MySQL Table
async function initMySQL() {
  const connection = await mysql.createConnection(mysqlConfig);
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.end();
}

// Log activity to MongoDB
async function logActivity(action, userId, userName, details) {
  try {
    await new ActivityLog({ action, userId, userName, details }).save();
  } catch (err) {
    console.error('Log error:', err);
  }
}

// Routes
app.get('/api/users', async (req, res) => {
  const connection = await mysql.createConnection(mysqlConfig);
  const [rows] = await connection.execute('SELECT * FROM users ORDER BY created_at DESC');
  await connection.end();
  res.json(rows);
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const connection = await mysql.createConnection(mysqlConfig);
  const [result] = await connection.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
  await connection.end();
  
  const newUser = { id: result.insertId, name, email };
  await logActivity('USER_CREATED', newUser.id, name, `New user registered: ${email}`);
  res.json(newUser);
});

app.delete('/api/users/:id', async (req, res) => {
  const connection = await mysql.createConnection(mysqlConfig);
  const [user] = await connection.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
  await connection.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
  await connection.end();
  
  if (user[0]) {
    await logActivity('USER_DELETED', user[0].id, user[0].name, `User deleted: ${user[0].email}`);
  }
  res.json({ message: 'User deleted' });
});

app.get('/api/logs', async (req, res) => {
  const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(50);
  res.json(logs);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
Promise.all([
  initMySQL(),
  mongoose.connect(mongoUrl)
]).then(() => {
  console.log('Connected to MySQL and MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => console.error('Database connection error:', err));