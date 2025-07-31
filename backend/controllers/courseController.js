const Course = require('../models/Course');

// ✅ GET /api/courses (admin sees all, employee sees only their assigned courses)
const getCourses = async (req, res) => {
  try {
    let courses;

    if (req.user.role === 'admin') {
      // Admin sees all courses
      courses = await Course.find().sort({ startDate: -1 });
    } else {
      // Employee sees only courses they are assigned to
      courses = await Course.find({ assignedEmployees: req.user._id }).sort({ startDate: -1 });
    }

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: '❌ Error fetching courses', error: err.message });
  }
};

// ✅ POST /api/courses (admin only — enforced via route middleware)
const createCourse = async (req, res) => {
  try {
    const { name, description, instructor, duration, startDate, assignedEmployees } = req.body;

    if (!name || !instructor || !duration || !startDate) {
      return res.status(400).json({ message: '⚠️ All required fields must be filled' });
    }

    const newCourse = new Course({
      name,
      description,
      instructor,
      duration,
      startDate,
      assignedEmployees: assignedEmployees || [] // optional
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(400).json({ message: '❌ Failed to create course', error: err.message });
  }
};

// ✅ DELETE /api/courses/:id (admin only — extra check for safety)
const deleteCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '❌ Only admins can delete courses' });
    }

    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: '⚠️ Course not found' });
    }
    res.json({ message: '✅ Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to delete course', error: err.message });
  }
};

// ✅ PUT /api/courses/:id (admin only — extra check for safety)
const updateCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '❌ Only admins can update courses' });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: '⚠️ Course not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to update course', error: err.message });
  }
};

module.exports = {
  getCourses,
  createCourse,
  deleteCourse,
  updateCourse
};
