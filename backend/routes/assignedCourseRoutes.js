const express = require('express');
const router = express.Router();
const AssignedCourse = require('../models/AssignedCourse');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ✅ GET all assigned courses — Admin Only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const assignedCourses = await AssignedCourse.find().populate('employee course');
    res.json(assignedCourses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assigned courses: ' + err.message });
  }
});

// ✅ GET assigned courses for the logged-in employee
router.get('/my', protect, async (req, res) => {
  try {
    if (!req.user.employee) {
      return res.status(400).json({ message: 'Employee profile not linked' });
    }

    const assignedCourses = await AssignedCourse.find({
      employee: req.user.employee, // 👈 This is the correct reference
    }).populate('course');

    res.json(assignedCourses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your assigned courses: ' + err.message });
  }
});

// ✅ POST assign course to employee — Admin Only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { employee, course } = req.body;

    // Prevent duplicate assignment
    const existing = await AssignedCourse.findOne({ employee, course });
    if (existing) {
      return res.status(400).json({ message: 'Course already assigned to this employee' });
    }

    const assigned = new AssignedCourse({ employee, course });
    await assigned.save();
    res.status(201).json(assigned);
  } catch (err) {
    res.status(400).json({ message: 'Failed to assign course: ' + err.message });
  }
});

module.exports = router;
