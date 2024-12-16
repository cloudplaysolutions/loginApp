// routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('./models/User');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const secret = 'abc123';

// Middleware to protect routes
const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access Denied');
  try {
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const user = new User({ email, password });
  try {
    await user.save();
    res.send('User registered');
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Email or password is wrong');
  const validPass = await user.comparePassword(password);
  if (!validPass) return res.status(400).send('Invalid password');
  const token = jwt.sign({ _id: user._id }, secret);
  res.header('auth-token', token).send(token);
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.send(user);
});

// Update Profile
router.put('/profile', auth, upload.single('profilePicture'), async (req, res) => {
  const { fullName, address } = req.body;
  const profilePicture = req.file ? req.file.path : undefined;
  const updateData = { fullName, address, profilePicture };
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
  res.send(user);
});

module.exports = router;
