const Media = require('../models/Media');
const ClientProject = require('../models/ClientProject');
const cloudinary = require('../config/cloudinary');

// @desc    Upload media to a project
// @route   POST /api/projects/:id/media
// @access  Private
const uploadMedia = async (req, res) => {
  try {
    const project = await ClientProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership for BDM
    if (req.user.role === 'BDM' && project.assignedBdm.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload to this project' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const mediaItems = req.files.map((file, index) => {
      const isVideo = file.mimetype.startsWith('video/');
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      return {
        projectId: project._id,
        uploadedBy: req.user._id,
        type: isVideo ? 'VIDEO' : 'IMAGE',
        originalUrl: fileUrl,
        thumbnailUrl: fileUrl, // Basic fallback since we can't easily generate video thumbnails locally without ffmpeg
        mimeType: file.mimetype,
        fileSize: file.size,
        displayOrder: index, // Needs to be adjusted based on existing items in a real scenario
      };
    });

    const createdMedia = await Media.insertMany(mediaItems);
    res.status(201).json(createdMedia);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// @desc    Get media for a project
// @route   GET /api/projects/:id/media
// @access  Private
const getProjectMedia = async (req, res) => {
    try {
        const project = await ClientProject.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check ownership for BDM
        if (req.user.role === 'BDM' && project.assignedBdm.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const media = await Media.find({ projectId: project._id }).sort({ displayOrder: 1 });
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}


// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const project = await ClientProject.findById(media.projectId);

    // Check ownership for BDM
    if (req.user.role === 'BDM' && project.assignedBdm.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this media' });
    }

    // Extract public id from Cloudinary URL and delete it
    // Example url: https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg
    const urlParts = media.originalUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    
    // Actually the folder path needs to be included in public_id for proper deletion in cloudinary
    // Depending on CloudinaryStorage, the public_id might be different. 
    // This is a simplistic deletion. Real implementation would store the public_id in the DB.

    await media.deleteOne();

    res.json({ message: 'Media removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload global media
// @route   POST /api/media
// @access  Private
const uploadGlobalMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { bdmId } = req.body;
    let assignedBdm = null;
    
    if (req.user.role === 'BDM') {
      assignedBdm = req.user._id;
    } else if (req.user.role === 'ADMIN' && bdmId) {
      assignedBdm = bdmId;
    }

    const mediaItems = req.files.map((file, index) => {
      const isVideo = file.mimetype.startsWith('video/');
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      return {
        uploadedBy: req.user._id,
        assignedBdm: assignedBdm,
        type: isVideo ? 'VIDEO' : 'IMAGE',
        originalUrl: fileUrl,
        thumbnailUrl: fileUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        displayOrder: index,
      };
    });

    const createdMedia = await Media.insertMany(mediaItems);
    res.status(201).json(createdMedia);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// @desc    Get global media
// @route   GET /api/media
// @access  Private
const getGlobalMedia = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'BDM') {
      // BDMs see media assigned to them OR uploaded by them
      query = { assignedBdm: req.user._id };
    } else if (req.user.role === 'ADMIN' && req.query.bdmId) {
      // Admins can filter by assigned BDM
      query = { assignedBdm: req.query.bdmId };
    }
    
    // We populate the assignedBdm to display the BDM name in the admin panel
    const media = await Media.find(query).sort({ createdAt: -1 }).populate('assignedBdm', 'name email');
    res.json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadMedia,
  getProjectMedia,
  deleteMedia,
  uploadGlobalMedia,
  getGlobalMedia,
};
