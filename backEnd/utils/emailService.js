// utils/emailService.js
const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendStateChangeEmail = async (email, name, action) => {
  try {
    let subject, templateName;
    
    switch(action) {
      case 'activate':
        subject = 'Account Activated';
        templateName = 'accountActivated';
        break;
      case 'deactivate':
        subject = 'Account Deactivated';
        templateName = 'accountDeactivated';
        break;
      case 'delete':
        subject = 'Account Deleted';
        templateName = 'accountDeleted';
        break;
      default:
        throw new Error('Invalid action type');
    }

    const templatePath = path.join(__dirname, `../emailTemplates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, { name });

    const data = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });
    console.log(`Notification email sent to ${email}`, data);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error; // Rethrow to handle in calling function
  }
};

// Password reset email
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  
  const mailOptions = {
    from: '"Your App Name" <noreply@yourapp.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>Hello ${name},</p>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, please ignore this email.</p>
        <p style="margin-top: 30px; color: #6b7280; font-size: 0.9em;">
          This link will expire in 1 hour.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send appointment notification email
exports.sendAppointmentEmail = async (userEmail, userName, lawyerEmail, lawyerName, appointmentTime, reason, action) => {
  try {
    const formattedTime = new Date(appointmentTime).toLocaleString();
    let subject, text;
    
    switch (action) {
      case 'created':
        subject = `New Appointment Scheduled with ${lawyerName}`;
        text = `Dear ${userName},\n\nYour appointment with ${lawyerName} has been scheduled for ${formattedTime}.\n\nReason: ${reason}\n\nThank you!`;
        break;
      case 'confirmed':
        subject = `Appointment Confirmed by ${lawyerName}`;
        text = `Dear ${userName},\n\nYour appointment with ${lawyerName} on ${formattedTime} has been confirmed.\n\nReason: ${reason}\n\nThank you!`;
        break;
      case 'cancelled':
        subject = `Appointment Cancellation`;
        text = `Dear ${userName},\n\nYour appointment with ${lawyerName} on ${formattedTime} has been cancelled.\n\nReason: ${reason}\n\nThank you!`;
        break;
      case 'completed':
        subject = `Appointment Completed`;
        text = `Dear ${userName},\n\nYour appointment with ${lawyerName} on ${formattedTime} has been marked as completed.\n\nThank you!`;
        break;
      default:
        return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject,
      text
    });

    // Also notify lawyer for certain actions
    if (action === 'created' || action === 'cancelled') {
      const lawyerSubject = `Appointment ${action === 'created' ? 'Request' : 'Cancellation'}`;
      const lawyerText = `Dear ${lawyerName},\n\n${userName} has ${action === 'created' ? 'requested' : 'cancelled'} an appointment on ${formattedTime}.\n\nReason: ${reason}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: lawyerEmail,
        subject: lawyerSubject,
        text: lawyerText
      });
    }
  } catch (error) {
    console.error('Email sending error:', error);
  }
}; 

module.exports = {
  sendStateChangeEmail,
  sendStateChangeEmail,
  sendPasswordResetEmail
};

