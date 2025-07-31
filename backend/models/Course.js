const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
    },
    duration: {
      type: String, // Example: "4 weeks"
      required: [true, 'Duration is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    // ✅ New field: Link this course to specific employees (users)
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // reference to your User model
      }
    ]
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('Course', courseSchema);
