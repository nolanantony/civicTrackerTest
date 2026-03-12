const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/complaints
// @desc    Get all complaints (public, with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('filedBy', 'name');

    res.json({
      complaints,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get single complaint
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('filedBy', 'name email');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   POST /api/complaints
// @desc    File a new complaint
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, category } = req.body;

    if (!title || !description || !location || !category) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    let priority_score = 5.0;
    let priority_label = 'Medium';
    let priority_category = category;
    try {
      const mlResponse = await fetch('http://localhost:5000/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint: title + ' ' + description, category })
      });
      const mlData = await mlResponse.json();
      priority_score = mlData.priority_score;
      priority_label = mlData.priority_label;
      priority_category = mlData.category;
    } catch (err) {
      console.warn('ML API unreachable, using default property.');
    }
    const complaint = await Complaint.create({
      title,
      description,
      location,
      category,
      filedBy: req.user._id,
      userName: req.user.name,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      priority_score,
      priority_label,
      priority_category
    });
    // Increment user complaint count
    await User.findByIdAndUpdate(req.user._id, { $inc: { complaintsCount: 1 } });

    res.status(201).json({
      message: 'Complaint filed successfully!',
      complaint
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('File complaint error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   POST /api/complaints/:id/support
// @desc    Support / upvote a complaint
// @access  Private
router.post('/:id/support', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const userId = req.user._id;
    const alreadySupported = complaint.supporters.includes(userId);

    if (alreadySupported) {
      // Unsupport
      complaint.supporters = complaint.supporters.filter(
        (id) => id.toString() !== userId.toString()
      );
      complaint.supportCount = Math.max(0, complaint.supportCount - 1);
    } else {
      complaint.supporters.push(userId);
      complaint.supportCount += 1;
    }

    await complaint.save();

    res.json({
      message: alreadySupported ? 'Support removed.' : 'Complaint supported!',
      supportCount: complaint.supportCount,
      supported: !alreadySupported
    });
  } catch (error) {
    console.error('Support complaint error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/complaints/user/my
// @desc    Get complaints filed by the logged-in user
// @access  Private
router.get('/user/my', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ filedBy: req.user._id }).sort('-createdAt');
    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
