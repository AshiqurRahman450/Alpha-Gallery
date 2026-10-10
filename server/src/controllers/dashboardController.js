const User = require('../models/User');
const ClientProject = require('../models/ClientProject');
const Media = require('../models/Media');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const role = req.user.role;
    
    if (role === 'ADMIN') {
      const totalBdms = await User.countDocuments({ role: 'BDM' });
      const totalProjects = await ClientProject.countDocuments();
      const totalMedia = await Media.countDocuments();
      
      return res.json({
        totalBdms,
        totalProjects,
        totalMedia,
        activeViews: '0', // Placeholder
      });
    } else if (role === 'BDM') {
      const myProjects = await ClientProject.find({ assignedBdm: req.user._id });
      const totalProjects = myProjects.length;
      
      // Calculate unique clients from projects
      const uniqueClients = new Set(myProjects.map(p => p.clientName)).size;
      
      // Count media assigned to or uploaded by this BDM
      const totalMedia = await Media.countDocuments({ assignedBdm: req.user._id });
      
      return res.json({
        totalClients: uniqueClients,
        totalProjects,
        totalMedia,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

module.exports = { getStats };
