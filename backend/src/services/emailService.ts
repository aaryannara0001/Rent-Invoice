import nodemailer from 'nodemailer';
import { z } from 'zod';

// Email configuration schema
const EmailConfigSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM_EMAIL: z.string().email(),
  SMTP_FROM_NAME: z.string().min(1),
});

type EmailConfig = z.infer<typeof EmailConfigSchema>;

// Validate email config
const validateEmailConfig = (): EmailConfig => {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
  };

  return EmailConfigSchema.parse(config);
};

// Create transporter
let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (transporter) return transporter;

  const config = validateEmailConfig();

  const transporterConfig: any = {
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  };

  // If using Gmail, use the official 'gmail' service setting for better compatibility
  if (config.SMTP_HOST.includes('gmail.com')) {
    transporterConfig.service = 'gmail';
  } else {
    transporterConfig.host = config.SMTP_HOST;
    transporterConfig.port = config.SMTP_PORT;
    transporterConfig.secure = config.SMTP_PORT === 465;
  }

  transporter = nodemailer.createTransport(transporterConfig);

  return transporter;
};

// Email templates
export const emailTemplates = {
  tempPassword: (userName: string, email: string, tempPassword: string, appUrl: string = 'http://localhost:5173') => ({
    subject: '🔐 Welcome to Rent Invoice System - Temporary Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .password-box { background: #fff; border: 2px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .password-box .label { font-size: 12px; text-transform: uppercase; color: #666; letter-spacing: 1px; }
            .password-box .value { font-size: 24px; font-weight: bold; color: #667eea; font-family: 'Courier New', monospace; letter-spacing: 2px; margin: 10px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning strong { color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Rent Invoice System</h1>
              <p>Your account has been created</p>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              
              <p>Your administrator has created an account for you. Here are your login credentials:</p>
              
              <p><strong>Email:</strong> ${email}</p>
              
              <div class="password-box">
                <div class="label">Your Temporary Password</div>
                <div class="value">${tempPassword}</div>
                <p style="font-size: 12px; color: #999; margin: 10px 0 0;">This password will expire after first use</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This is a temporary password. On your first login, you will be required to set a new password that meets our security requirements.
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/login" class="button">Login to Rent Invoice</a>
              </div>
              
              <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Next Steps:</strong></p>
                <ol>
                  <li>Click the login button above</li>
                  <li>Enter your email and temporary password</li>
                  <li>Create a new secure password</li>
                  <li>Start using Rent Invoice System</li>
                </ol>
              </div>
              
              <p style="color: #666; font-size: 13px;">
                <strong>Password Requirements:</strong><br>
                • Minimum 8 characters<br>
                • At least 1 uppercase letter (A-Z)<br>
                • At least 1 lowercase letter (a-z)<br>
                • At least 1 number (0-9)<br>
                • At least 1 special character (!@#$%^&* etc)
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you did not request this account or have any questions, please contact your administrator.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Rent Invoice System. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  passwordResetConfirmation: (userName: string) => ({
    subject: '✅ Password Successfully Updated',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .success-box .icon { font-size: 40px; }
            .success-box p { color: #155724; margin: 10px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Welcome Aboard!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              
              <p>Great news! Your password has been successfully updated and your account is now fully active.</p>
              
              <div class="success-box">
                <div class="icon">✓</div>
                <p><strong>Account Activated</strong></p>
                <p>You can now access all features of Rent Invoice System</p>
              </div>
              
              <p>You can now log in with your new credentials and start using the system.</p>
              
              <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Security Tips:</strong></p>
                <ul>
                  <li>Keep your password secure and do not share it with anyone</li>
                  <li>Use a unique password that you don't use elsewhere</li>
                  <li>If you suspect unauthorized access, change your password immediately</li>
                </ul>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you have any questions or need assistance, please contact your administrator.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Rent Invoice System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Send email interface
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Main email sending function
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const config = validateEmailConfig();
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `${config.SMTP_FROM_NAME} <${config.SMTP_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`✅ Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Send temp password email
export const sendTempPasswordEmail = async (
  userName: string,
  email: string,
  tempPassword: string,
  appUrl?: string
): Promise<void> => {
  const template = emailTemplates.tempPassword(userName, email, tempPassword, appUrl);
  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (
  userName: string,
  email: string
): Promise<void> => {
  const template = emailTemplates.passwordResetConfirmation(userName);
  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
};

// Test email connection
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
};
