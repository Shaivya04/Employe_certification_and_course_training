const AssignedCourse = require('../models/AssignedCourse');

exports.assignCourse = async (req, res) => {
  try {
    const { employee, course } = req.body;

    const existing = await AssignedCourse.findOne({ employee, course });
    if (existing) return res.status(400).json({ message: 'Course already assigned to employee' });

    const assigned = await AssignedCourse.create({ employee, course });
    res.status(201).json(assigned);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssignedCourses = async (req, res) => {
  try {
    const assigned = await AssignedCourse.find().populate('employee').populate('course');
    res.json(assigned);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
