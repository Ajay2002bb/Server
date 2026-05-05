require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const User = require('./models/User');
const Template = require('./models/Template');
const Favorite = require('./models/Favorite');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors({
  origin: [
    'https://unique-lily-fcd63d.netlify.app',
    'http://localhost:3000', // Allow local development as well
  ]
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied, missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- TEMPLATES ROUTES ---
app.get('/api/templates', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const templates = await Template.find(query);
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- FAVORITES ROUTES (Protected) ---
app.post('/api/favorites/:templateId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user.id;

    // Check if template exists
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const existingFavorite = await Favorite.findOne({ user_id: userId, template_id: templateId });

    if (existingFavorite) {
      // If already favorited, remove it (toggle behavior)
      await Favorite.deleteOne({ _id: existingFavorite._id });
      return res.json({ message: 'Removed from favorites', favorited: false });
    } else {
      // Add to favorites
      await Favorite.create({ user_id: userId, template_id: templateId });
      return res.json({ message: 'Added to favorites', favorited: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ user_id: userId }).populate('template_id');
    
    // Extract templates from favorites
    const favoriteTemplates = favorites
      .map(fav => fav.template_id)
      .filter(template => template != null); // filter out nulls if a template was deleted
      
    res.json(favoriteTemplates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
