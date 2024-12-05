// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_jwt_secret_key'; // replace with your secret key

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
const mongoURI = 'mongodb://localhost:27017/S18db';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

  const reportSchema = new mongoose.Schema({
    category: String,
    percentage: Number
  });

  const Report = mongoose.model('reports', reportSchema);

// Mock user data (for demo purposes)
const users = [
  {
    id: 1,
    username: 'user1',
    password: bcrypt.hashSync('password', 8) // Pre-hashed password
  }
];

// Login route for authenticating users
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  //console.log(authHeader)
  const token = authHeader && authHeader.split(' ')[1];
  //console.log(token)
  if (!token) return res.status(403).send({ message: 'No token provided.' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).send({ message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
}

// Protected routes
app.get('/api/dashboard', verifyToken, (req, res) => {
  res.json({ message: 'Welcome to the Dashboard!' });
});

// Chart Data Endpoints
app.get('/charts/summary-chart', verifyToken, (req, res) => {
  res.json({
    title: 'Clean Energy Production by Source',
    data: [
      { source: 'Solar', value: 45 },
      { source: 'Wind', value: 30 },
      { source: 'Hydro', value: 15 },
      { source: 'Nuclear', value: 10 },
    ],
  });
});

app.get('/charts/reports-chart', verifyToken, async (req, res) => {
  try {
    // Query MongoDB for all report data
    const reportsData = await Report.find();

    if (reportsData.length === 0) {
      return res.status(404).json({ message: 'No reports data found in the database.' });
    }

    // Return the fetched data
    res.json({
      title: 'Carbon Emissions Reduction by Year',
      data: reportsData
    });
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    res.status(500).json({ message: 'Error fetching data from MongoDB' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
