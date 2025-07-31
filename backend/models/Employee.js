const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    position: {
      type: String,
      default: '',
      trim: true,
    },
    joinDate: {
      type: Date,
      required: [true, 'Join date is required'],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
