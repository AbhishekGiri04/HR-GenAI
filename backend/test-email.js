require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'abhishekgiri0405@gmail.com',
  subject: 'Test Email from HR-GenAI',
  html: '<h1>Test Email</h1><p>If you receive this, email service is working!</p>'
}, (error, info) => {
  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Email sent:', info.response);
  }
  process.exit();
});
