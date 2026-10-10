const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientProject',
    required: false,
    index: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBdm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Required for BDM isolation, but could be optional for admin-only assets
    index: true,
  },
  type: {
    type: String,
    enum: ['IMAGE', 'VIDEO'],
    required: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  caption: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  duration: {
    type: Number, // for videos
  },
  displayOrder: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
