const User = require('../models/User');

const getMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('name email role createdAt');
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch members.', error: error.message });
  }
};

module.exports = { getMembers };
