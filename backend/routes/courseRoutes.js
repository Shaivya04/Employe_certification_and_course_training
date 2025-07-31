const express = require('express');
const router = express.Router();

const {
  getCourses,
  createCourse,
  deleteCourse,
  updateCourse
} = require('../controllers/courseController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// ✅ GET all courses (employees see only their courses, admins see all)
router.get('/', protect, getCourses);

// ✅ POST a new course (admin only)
router.post('/', protect, adminOnly, createCourse);

// ✅ DELETE a course by ID (admin only)
router.delete('/:id', protect, adminOnly, deleteCourse);

// ✅ PUT (update) a course by ID (admin only)
router.put('/:id', protect, adminOnly, updateCourse);

module.exports = router;
