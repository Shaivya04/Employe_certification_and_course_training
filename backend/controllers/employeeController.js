const Employee = require('../models/Employee');

// ✅ POST /api/employees (admin only — enforced via middleware)
const registerEmployee = async (req, res) => {
  try {
    const { name, email, department, position, joinDate } = req.body;

    // 🔍 Basic validation
    if (!name || !email || !joinDate) {
      return res.status(400).json({ message: '⚠️ Name, Email, and Join Date are required' });
    }

    const newEmp = new Employee({
      name,
      email,
      department,
      position,
      joinDate,
    });

    const saved = await newEmp.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({
      message: '❌ Failed to register employee',
      error: err.message,
    });
  }
};

// ✅ GET /api/employees
// - Now all users (admin or employee) can see public info of all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}, 'name department position joinDate email'); // ✅ Only return public info
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({
      message: '❌ Failed to fetch employees',
      error: err.message,
    });
  }
};

module.exports = {
  registerEmployee,
  getEmployees
};
