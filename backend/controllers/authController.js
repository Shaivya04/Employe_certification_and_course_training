const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

// ✅ Helper: Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔐 Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ Create user first
    const user = new User({ name, email, password }); // role defaults to 'employee'
    await user.save();

    // ✅ Automatically create corresponding employee record
    const employee = new Employee({
      name: user.name,
      email: user.email,
      joinDate: new Date(), // Default to today
    });
    await employee.save();

    // ✅ Link employee to user
    user.employee = employee._id;
    await user.save();

    // ✅ Generate token and respond
    const token = generateToken(user);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee: {
          _id: employee._id,
          name: employee.name,
        }
      }
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Signup failed',
      error: err.message
    });
  }
};

// ✅ POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    // ✅ Populate employee if employee user
    let employeeDoc = null;
    if (user.role === 'employee') {
      employeeDoc = await Employee.findOne({ _id: user.employee });
    }

    res.json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee: employeeDoc
          ? {
              _id: employeeDoc._id,
              name: employeeDoc.name
            }
          : null
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: err.message
    });
  }
};
