const express = require('express');
const router = express.Router();
const Article = require('../models/article');
require('dotenv').config()
const User = require('../models/user');

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.user = user;
    next();
  });
};

// Authorization middleware
const authorizeUser = (req, res, next) => {
  const isAdmin = req.user.isAdmin;

  if (!isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};

// CREATE an article
router.post('/articles', (req, res) => {
  const newArticle = new Article({
    title: req.body.title,
    body: req.body.body,
    author: req.body.author,
    published: req.body.published,
    tags: req.body.tags
  });
  newArticle.save()
    .then(article => res.status(201).json(article))
    .catch(err => res.status(400).json({ message: err.message }));
});

// READ all articles
router.get('/articles', (req, res) => {
  Article.find()
    .then(articles => res.json(articles))
    .catch(err => res.status(500).json({ message: err.message }));
});

// READ one article by ID
router.get('/articles/:id', (req, res) => {
  Article.findById(req.params.id)
    .then(article => res.json(article))
    .catch(err => res.status(404).json({ message: 'Article not found' }));
});

// UPDATE an article by ID
router.put('/articles/:id', (req, res) => {
  Article.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(article => res.json(article))
    .catch(err => res.status(404).json({ message: 'Article not found' }));
});

// DELETE an article by ID
router.delete('/articles/:id', (req, res) => {
  Article.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).send())
    .catch(err => res.status(404).json({ message: 'Article not found' }));
});

// DELETE an article by ID (only for admin)
router.delete('/articles/:id', authenticateUser, authorizeUser, (req, res) => {
    Article.findByIdAndDelete(req.params.id)
      .then(() => res.status(204).send())
      .catch(err => res.status(404).json({ message: 'Article not found' }));
  });

  
// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    // Find the user by username and password
    const user = await User.findOne({ username, password });
  
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    // Generate a JWT token
    const token = jwt.sign({ username: user.username, isAdmin: user.isAdmin }, process.env.ACCESS_TOKEN_SECRET);
  
    res.json({ token });
  });

// READ all unpublished articles - restricted to admin only
router.get('/unpublished', authenticateUser, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admin can access this resource' });
    }
  
    Article.find({ published: false })
      .then(articles => res.json(articles))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  // PUBLISH an unpublished article - restricted to admin only
  router.put('/publish/:id', authenticateUser, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admin can access this resource' });
    }
  
    Article.findByIdAndUpdate(req.params.id, { published: true }, { new: true })
      .then(article => res.json(article))
      .catch(err => res.status(404).json({ message: 'Article not found' }));
  });

module.exports = router;
