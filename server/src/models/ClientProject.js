const mongoose = require('mongoose');

const clientProjectSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  buildingLevel: {
    type: String,
    enum: ['G+1', 'G+2', 'G+3', 'G+4', 'G+5'],
    required: true,
  },
  location: {
    type: String,
  },
  description: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  assignedBdm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  visibility: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
    index: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('ClientProject', clientProjectSchema);
