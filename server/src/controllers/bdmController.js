const User = require('../models/User');
const bcrypt = require('bcrypt');

// @desc    Create a new BDM
// @route   POST /api/bdms
// @access  Private/Admin
const createBdm = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const bdm = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: 'BDM',
    });

    if (bdm) {
      res.status(201).json({
        _id: bdm._id,
        name: bdm.name,
        email: bdm.email,
        role: bdm.role,
        isActive: bdm.isActive,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all BDMs
// @route   GET /api/bdms
// @access  Private/Admin
const getBdms = async (req, res) => {
  try {
    const bdms = await User.find({ role: 'BDM' }).select('-passwordHash');
    res.json(bdms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get BDM by ID
// @route   GET /api/bdms/:id
// @access  Private/Admin
const getBdmById = async (req, res) => {
  try {
    const bdm = await User.findById(req.params.id).select('-passwordHash');
    if (bdm) {
      res.json(bdm);
    } else {
      res.status(404).json({ message: 'BDM not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update BDM
// @route   PATCH /api/bdms/:id
// @access  Private/Admin
const updateBdm = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const bdm = await User.findById(req.params.id);

    if (bdm) {
      bdm.name = name || bdm.name;
      bdm.email = email || bdm.email;
      bdm.phone = phone || bdm.phone;

      const updatedBdm = await bdm.save();
      res.json({
        _id: updatedBdm._id,
        name: updatedBdm.name,
        email: updatedBdm.email,
        phone: updatedBdm.phone,
        isActive: updatedBdm.isActive,
      });
    } else {
      res.status(404).json({ message: 'BDM not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update BDM status (Activate/Deactivate)
// @route   PATCH /api/bdms/:id/status
// @access  Private/Admin
const updateBdmStatus = async (req, res) => {
  const { isActive } = req.body;

  try {
    const bdm = await User.findById(req.params.id);

    if (bdm) {
      bdm.isActive = isActive;
      const updatedBdm = await bdm.save();
      res.json({
        _id: updatedBdm._id,
        isActive: updatedBdm.isActive,
      });
    } else {
      res.status(404).json({ message: 'BDM not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset BDM Password
// @route   POST /api/bdms/:id/reset-password
// @access  Private/Admin
const resetBdmPassword = async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const bdm = await User.findById(req.params.id);

    if (bdm) {
      const salt = await bcrypt.genSalt(10);
      bdm.passwordHash = await bcrypt.hash(newPassword, salt);
      await bdm.save();
      res.json({ message: 'Password reset successfully' });
    } else {
      res.status(404).json({ message: 'BDM not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBdm,
  getBdms,
  getBdmById,
  updateBdm,
  updateBdmStatus,
  resetBdmPassword,
};
