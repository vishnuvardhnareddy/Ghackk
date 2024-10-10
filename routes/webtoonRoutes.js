const express = require('express');
const router = express.Router();
const Webtoon = require('../models/Webtoon');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authentication token is required' });
  }
};

// GET all webtoons
router.get('/', async (req, res) => {
  try {
    const webtoons = await Webtoon.find({}, 'title description characters');
    res.json(webtoons);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching webtoons', error: err.message });
  }
});

// GET a specific webtoon by ID
router.get('/:id', async (req, res) => {
  try {
    const webtoon = await Webtoon.findById(req.params.id);
    if (!webtoon) {
      return res.status(404).json({ message: 'Webtoon not found' });
    }
    res.json(webtoon);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching webtoon', error: err.message });
  }
});

// POST a new webtoon
router.post('/', [
  authenticateJWT,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('characters').isArray().withMessage('Characters must be an array')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const webtoon = new Webtoon({
    title: req.body.title,
    description: req.body.description,
    characters: req.body.characters,
    author: req.body.author
  });

  try {
    const newWebtoon = await webtoon.save();
    res.status(201).json(newWebtoon);
  } catch (err) {
    res.status(400).json({ message: 'Error creating webtoon', error: err.message });
  }
});

// DELETE a webtoon
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const webtoon = await Webtoon.findById(req.params.id);
    if (!webtoon) {
      return res.status(404).json({ message: 'Webtoon not found' });
    }
    await webtoon.remove();
    res.json({ message: 'Webtoon deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting webtoon', error: err.message });
  }
});

module.exports = router;