const Project = require('../models/Project');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const description = req.body?.description?.trim() || '';
    const members = Array.isArray(req.body?.members) ? req.body.members : [];

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const validMembers = await User.find({ _id: { $in: members }, role: 'member' }).select('_id');
    const memberIds = validMembers.map((member) => member._id);

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: memberIds,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project.', error: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? { createdBy: req.user._id }
        : { members: req.user._id };

    const projects = await Project.find(filter)
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects.', error: error.message });
  }
};

const addMemberToProject = async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: 'memberId is required.' });
    }

    const member = await User.findOne({ _id: memberId, role: 'member' });
    if (!member) {
      return res.status(404).json({ message: 'Member user not found.' });
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $addToSet: { members: member._id } },
      { new: true }
    ).populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member.', error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  addMemberToProject,
};
