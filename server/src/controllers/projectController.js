const ClientProject = require('../models/ClientProject');
const Media = require('../models/Media');

// Helper to generate a slug
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  const { clientName, buildingLevel, location, description, assignedBdm, visibility } = req.body;

  try {
    // Only Admin can create projects
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins are authorized to create projects' });
    }

    // Since only Admin can create, assignedBdm comes from request body
    const bdmId = assignedBdm;

    const slug = generateSlug(clientName);

    const project = await ClientProject.create({
      clientName,
      buildingLevel,
      location,
      description,
      assignedBdm: bdmId,
      slug,
      visibility: visibility || 'DRAFT',
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all projects (Admin sees all, BDM sees assigned)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};

    // Filter by assignedBdm if BDM is logged in
    if (req.user.role === 'BDM') {
      query.assignedBdm = req.user._id;
    }

    const projects = await ClientProject.find(query).populate('assignedBdm', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await ClientProject.findById(req.params.id).populate('assignedBdm', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership for BDM
    if (req.user.role === 'BDM' && project.assignedBdm._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PATCH /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    let project = await ClientProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership/permissions (Only Admin can edit)
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins are authorized to update projects' });
    }

    const { clientName, buildingLevel, location, description, visibility, coverImage } = req.body;

    project.clientName = clientName || project.clientName;
    project.buildingLevel = buildingLevel || project.buildingLevel;
    project.location = location || project.location;
    project.description = description !== undefined ? description : project.description;
    project.visibility = visibility || project.visibility;
    project.coverImage = coverImage || project.coverImage;

    // Only Admin can change assignedBdm
    if (req.user.role === 'ADMIN' && req.body.assignedBdm) {
        project.assignedBdm = req.body.assignedBdm;
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin can delete any, BDM only their own)
const deleteProject = async (req, res) => {
  try {
    const project = await ClientProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership/permissions (Only Admin can delete)
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins are authorized to delete projects' });
    }

    // Delete associated media logic would go here (e.g. from Cloudinary and DB)
    await Media.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
