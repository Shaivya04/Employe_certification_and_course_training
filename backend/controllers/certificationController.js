const mongoose = require('mongoose');
const Certification = require('../models/Certification');
const sendReminderEmail = require('../utils/mailer');

// ✅ Assign a new certification (POST /api/certifications)
const assignCertification = async (req, res) => {
  try {
    const { title, issueDate, expiryDate, employee } = req.body;

    if (!title || !issueDate || !expiryDate || !employee) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newCert = new Certification({ title, issueDate, expiryDate, employee });
    const saved = await newCert.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({
      message: 'Failed to assign certification',
      error: err.message,
    });
  }
};

// ✅ Get all certifications (GET /api/certifications)
const getAllCertifications = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'employee') {
      const employeeId =
        typeof req.user.employee === 'object'
          ? req.user.employee._id
          : req.user.employee;

      if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID missing in token' });
      }

      console.log('🔍 Filtering for employee ID:', employeeId);
      query.employee = new mongoose.Types.ObjectId(employeeId);
    }

    const certs = await Certification.find(query).populate('employee', 'name email');
    console.log('📦 Final query results:', certs);
    res.json(certs);
  } catch (err) {
    console.error('❌ Error in getAllCertifications:', err);
    res.status(500).json({ message: 'Failed to fetch certifications' });
  }
};

// ✅ Get certifications expiring in next 30 days (GET /api/certifications/expiring-soon)
const getExpiringSoon = async (req, res) => {
  try {
    const today = new Date();
    const soon = new Date();
    soon.setDate(today.getDate() + 30);

    const query = {
      expiryDate: { $gte: today, $lte: soon }
    };

    if (req.user.role === 'employee') {
      const employeeId =
        typeof req.user.employee === 'object'
          ? req.user.employee._id
          : req.user.employee;

      if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID missing in token' });
      }

      console.log('🔍 Expiring filter for employee ID:', employeeId);
      query.employee = new mongoose.Types.ObjectId(employeeId);
    }

    const expiring = await Certification.find(query).populate('employee', 'name email');
    res.json(expiring);
  } catch (err) {
    console.error('❌ Error fetching expiring certifications:', err);
    res.status(500).json({ message: 'Error fetching expiring certifications' });
  }
};

// ✅ Send email reminders for certifications expiring in 7 days (GET /api/certifications/send-reminders)
const sendExpiryReminders = async (req, res) => {
  try {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + 7);

    const expiring = await Certification.find({
      expiryDate: { $gte: today, $lte: limit }
    }).populate('employee');

    const sentEmails = [];

    for (const cert of expiring) {
      if (!cert.employee?.email) continue;

      const emailText = `Hi ${cert.employee.name},

Your certification "${cert.title}" is expiring on ${new Date(cert.expiryDate).toDateString()}.

Please renew it before expiry.

- Corporate Training System`;

      try {
        await sendReminderEmail(cert.employee.email, '📢 Certification Expiry Reminder', emailText);
        console.log(`✅ Reminder sent to ${cert.employee.email} for "${cert.title}"`);
        sentEmails.push({
          employee: cert.employee.name,
          email: cert.employee.email,
          title: cert.title,
          expiryDate: cert.expiryDate,
          status: 'sent'
        });
      } catch (err) {
        console.error(`❌ Failed to send to ${cert.employee.email}: ${err.message}`);
        sentEmails.push({
          employee: cert.employee.name,
          email: cert.employee.email,
          title: cert.title,
          expiryDate: cert.expiryDate,
          status: 'failed',
          error: err.message
        });
      }
    }

    res.json({
      message: 'Emails processed',
      count: sentEmails.length,
      details: sentEmails
    });
  } catch (err) {
    console.error('❌ Error in sendExpiryReminders:', err.message);
    res.status(500).json({ message: 'Failed to send reminders', error: err.message });
  }
};

module.exports = {
  assignCertification,
  getAllCertifications,
  getExpiringSoon,
  sendExpiryReminders
};
