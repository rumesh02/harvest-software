const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  switch (emailService.toLowerCase()) {
    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.ADMIN_EMAIL || 'dularamihiran@gmail.com',
          pass: process.env.ADMIN_EMAIL_PASSWORD
        }
      });
    
    case 'outlook':
      return nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASSWORD
        }
      });
    
    case 'yahoo':
      return nodemailer.createTransport({
        service: 'yahoo',
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASSWORD
        }
      });
    
    default:
      // Generic SMTP configuration
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
  }
};

// Email templates
const emailTemplates = {
  // Email to admin when new contact message is received
  adminNotification: (contactData) => ({
    from: process.env.ADMIN_EMAIL || 'dularamihiran@gmail.com',
    to: process.env.ADMIN_EMAIL || 'dularamihiran@gmail.com',
    subject: `New Contact Message from ${contactData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #f8b400; padding-bottom: 10px;">
          New Contact Message - Harvest Software
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Contact Details:</h3>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background-color: #fff; border-left: 4px solid #f8b400; padding: 20px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Message:</h3>
          <p style="line-height: 1.6; color: #555;">${contactData.message}</p>
        </div>
        
        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0; color: #34495e;">
            <strong>Action Required:</strong> Please respond to this inquiry at your earliest convenience.
          </p>
        </div>
      </div>
    `
  }),

  // Auto-reply email to user
  userConfirmation: (contactData) => ({
    from: process.env.ADMIN_EMAIL || 'dularamihiran@gmail.com',
    to: contactData.email,
    subject: 'Thank you for contacting Harvest Software',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px; background-color: #f8b400; color: white; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">Harvest Software</h1>
          <p style="margin: 5px 0 0 0;">Agricultural Marketplace Platform</p>
        </div>
        
        <div style="padding: 30px; background-color: #fff; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
          <h2 style="color: #2c3e50;">Hello ${contactData.name},</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Thank you for reaching out to us! We have received your message and our support team will review it carefully.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Your Message Summary:</h3>
            <p style="color: #666; font-style: italic;">"${contactData.message.substring(0, 150)}${contactData.message.length > 150 ? '...' : ''}"</p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            <strong>What happens next?</strong><br>
            • Our team will review your inquiry within 24 hours<br>
            • You'll receive a detailed response at this email address<br>
            • For urgent matters, please call our support hotline
          </p>
          
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #34495e;">
              <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (Sri Lanka Time)
            </p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Best regards,<br>
            <strong>Harvest Software Support Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 15px; background-color: #2c3e50; color: white; font-size: 12px;">
          <p style="margin: 0;">© 2025 Harvest Software. Connecting Farmers, Merchants & Transporters.</p>
        </div>
      </div>
    `
  })
};

// Function to send email
const sendEmail = async (emailOptions) => {
  try {
    // Test mode - simulate email sending
    if (process.env.EMAIL_TEST_MODE === 'true') {
      console.log('📧 TEST MODE - Email would be sent:');
      console.log('From:', emailOptions.from);
      console.log('To:', emailOptions.to);
      console.log('Subject:', emailOptions.subject);
      console.log('✅ Email simulated successfully');
      return { success: true, messageId: 'test-mode-' + Date.now() };
    }

    const transporter = createTransporter();
    const result = await transporter.sendMail(emailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates,
  createTransporter
};
