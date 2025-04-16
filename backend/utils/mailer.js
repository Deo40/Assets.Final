// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 587,
  auth: {
    user: 'd59b5fd8fd6a2d', // replace with your Mailtrap credentials
    pass: 'feaac10a8a7a0c',
  },
});

const sendMail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: '"Assets App" <no-reply@assetsapp.com>',
    to,
    subject,
    html,
  });

  console.log('✅ Email sent:', info.messageId);
};

module.exports = sendMail;
