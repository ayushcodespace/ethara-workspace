const Task = require('../models/Task');

const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const baseFilter = req.user.role === 'admin' ? { user: req.user._id } : { assignedTo: req.user._id };

    const [total, completed, pending, overdue] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: 'completed' }),
      Task.countDocuments({ ...baseFilter, status: { $ne: 'completed' } }),
      Task.countDocuments({
        ...baseFilter,
        status: { $ne: 'completed' },
        dueDate: { $lt: now },
      }),
    ]);

    res.status(200).json({ total, completed, pending, overdue });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary.', error: error.message });
  }
};

module.exports = { getDashboardSummary };
