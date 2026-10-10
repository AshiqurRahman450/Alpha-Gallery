const express = require('express');
const router = express.Router();
const ClientProject = require('../models/ClientProject');
const Media = require('../models/Media');

// @desc    Get published project gallery by slug
// @route   GET /api/public/galleries/:slug
// @access  Public
router.get('/galleries/:slug', async (req, res) => {
  try {
    const project = await ClientProject.findOne({ 
      slug: req.params.slug,
      visibility: 'PUBLISHED' 
    });

    if (!project) {
      return res.status(404).json({ message: 'Gallery not found or not published' });
    }

    const media = await Media.find({ projectId: project._id }).sort({ displayOrder: 1 });

    res.json({
      project: {
        clientName: project.clientName,
        buildingLevel: project.buildingLevel,
        location: project.location,
        description: project.description,
        coverImage: project.coverImage,
      },
      media
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
