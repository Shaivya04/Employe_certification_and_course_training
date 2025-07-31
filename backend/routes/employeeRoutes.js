const express = require('express');
const router = express.Router();
const { registerEmployee, getEmployees } = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // ✅ Import middleware

// ✅ POST: Register new employee (Admins only)
router.post('/', protect, adminOnly, registerEmployee);

// ✅ GET: Get all employees (Any logged-in user)
router.get('/', protect, getEmployees);

module.exports = router;
