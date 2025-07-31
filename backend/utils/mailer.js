// utils/mailer.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// ✅ Improved version with full logging and error catch
const sendReminderEmail = async (to, subject, text) => {
  console.log('-----------------------------------------');
  console.log(`📧 Attempting to send email...`);
  console.log(`🧑 To: ${to}`);
  console.log(`📨 Subject: ${subject}`);
  console.log(`📄 Body:\n${text}`);
  console.log('-----------------------------------------');

  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text
    });
    console.log(`✅ Email successfully sent to ${to}`);
    console.log(`📬 Response: ${info.response}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}`);
    console.error(`🔧 Error: ${err.message}`);
  }

  console.log('-----------------------------------------');
};

module.exports = sendReminderEmail;
