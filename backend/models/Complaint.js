const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Road & Infrastructure', 'Garbage & Sanitation', 'Water Supply', 'Street Lights', 'Public Safety', 'Other']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  image: {
    type: String,
    default: null
  },
  // User who filed the complaint
  filedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  // Users who supported/upvoted
  supporters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  supportCount: {
    type: Number,
    default: 0
  },
  priority_score: {
    type: Number,
    default: 5.0
  },
  priority_label: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  priority_category: {
    type: String,
    default: 'General'
  },
  // Admin response/notes
  adminNote: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Index for searching
complaintSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);
