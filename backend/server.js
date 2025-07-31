const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // ✅ Load .env FIRST

const cron = require('node-cron'); // ✅ Scheduled tasks
const Certification = require('./models/Certification'); // ✅ Mongoose model
const sendReminderEmail = require('./utils/mailer'); // ✅ Email sender

const app = express();

// ✅ Middlewares
app.use(cors());              // Enable CORS for frontend-backend communication
app.use(express.json());     // Parse JSON request bodies

// ✅ Serve Uploaded PDF Files
app.use('/files', express.static('uploads')); // ✅ Expose /uploads folder as /files route

// ✅ API Routes
const courseRoutes = require('./routes/courseRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ Auth route added
const assignedCourseRoutes = require('./routes/assignedCourseRoutes'); // ✅ Assigned course route added

app.use('/api/courses', courseRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/auth', authRoutes); // ✅ Mount auth routes
app.use('/api/assigned-courses', assignedCourseRoutes); // ✅ Mount assigned-courses route

// ✅ Test Route
app.get('/', (req, res) => {
  res.send('✅ Backend is working!');
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ✅ Manual Test Email Route (use for quick verification)
app.get('/test-email', async (req, res) => {
  const testEmail = 'ayushjunior506@gmail.com'; // 🔁 Replace with your real email
  try {
    await sendReminderEmail(
      testEmail,
      '📧 Test Email from Training System',
      '✅ This is a test email. Email service is working.'
    );
    console.log(`✅ Test email sent to ${testEmail}`);
    res.send('✅ Test email sent successfully!');
  } catch (err) {
    console.error('❌ Test email failed:', err.message);
    res.status(500).send('❌ Test email failed: ' + err.message);
  }
});

// ✅ CRON Job: Send expiry reminders every minute (TEMPORARY for testing)
cron.schedule('* * * * *', async () => {
  console.log('⏰ Running test CRON every minute at', new Date().toLocaleString());

  const now = new Date();
  const in7Days = new Date();
  in7Days.setDate(now.getDate() + 7);

  try {
    const expiringCerts = await Certification.find({
      expiryDate: { $gte: now, $lte: in7Days }
    }).populate('employee');

    if (expiringCerts.length === 0) {
      console.log('✅ No certifications expiring in the next 7 days.');
      return;
    }

    for (const cert of expiringCerts) {
      const employee = cert.employee;
      if (employee && employee.email) {
        const subject = `🔔 Certification Expiring Soon: ${cert.title}`;
        const body = `Dear ${employee.name},\n\nYour certification "${cert.title}" is expiring on ${new Date(cert.expiryDate).toLocaleDateString()}.\n\nPlease renew it in time.\n\n- Training System`;

        try {
          await sendReminderEmail(employee.email, subject, body);
          console.log(`📨 Reminder sent to ${employee.email}`);
        } catch (err) {
          console.error(`❌ Failed to send to ${employee.email}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Cron job error:', err.message);
  }
});
