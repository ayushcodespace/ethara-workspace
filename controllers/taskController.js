const Task = require('../models/Task');
const Project = require('../models/Project');

// Return only tasks that belong to the signed-in user.
const getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'admin') {
      filter.user = req.user._id;
    } else {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

// Fetch one task while enforcing owner-level isolation.
const getTaskById = async (req, res) => {
  try {
    const ownershipFilter =
      req.user.role === 'admin'
        ? { _id: req.params.id, user: req.user._id }
        : { _id: req.params.id, assignedTo: req.user._id };
    const task = await Task.findOne(ownershipFilter);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
};

// Create a task with server-side validation and user ownership.
const createTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create and assign tasks.' });
    }

    const title = req.body?.title?.trim();
    const description = req.body?.description?.trim() || '';
    const status = req.body?.status || 'pending';
    const priority = req.body?.priority || 'medium';
    const assignedTo = req.body?.assignedTo;
    const projectId = req.body?.project;

    if (!title || !assignedTo || !projectId) {
      return res
        .status(400)
        .json({ message: 'Title, assignedTo, and project are required.' });
    }

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found for this admin.' });
    }

    if (!project.members.map(String).includes(String(assignedTo))) {
      return res.status(400).json({ message: 'Assigned user is not a member of this project.' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: req.body?.dueDate,
      assignedTo,
      project: projectId,
      user: req.user._id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create task', error: error.message });
  }
};

// Update only fields allowed for the current user's task.
const updateTask = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (typeof updates.title === 'string') {
      updates.title = updates.title.trim();
      if (!updates.title) {
        return res.status(400).json({ message: 'Title cannot be empty.' });
      }
    }

    if (typeof updates.description === 'string') {
      updates.description = updates.description.trim();
    }

    delete updates.user;
    delete updates.project;
    delete updates.assignedTo;

    const filter =
      req.user.role === 'admin'
        ? { _id: req.params.id, user: req.user._id }
        : { _id: req.params.id, assignedTo: req.user._id };

    // Members can only move status; admins can update all editable task fields.
    if (req.user.role === 'member') {
      Object.keys(updates).forEach((key) => {
        if (key !== 'status') delete updates[key];
      });
    }

    const task = await Task.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update task', error: error.message });
  }
};

// Delete only the current user's task.
const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks.' });
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
