import { Router, Request, Response } from 'express';
import { sendTempPasswordEmail, sendPasswordResetConfirmation } from '../services/emailService.js';
import { z } from 'zod';

const router = Router();

// Schema for sending temp password email
const SendTempPasswordSchema = z.object({
  userName: z.string().min(1, 'User name is required'),
  email: z.string().email('Invalid email address'),
  tempPassword: z.string().min(1, 'Temp password is required'),
  appUrl: z.string().url('Invalid URL').optional(),
});

// Schema for password reset confirmation
const SendPasswordResetSchema = z.object({
  userName: z.string().min(1, 'User name is required'),
  email: z.string().email('Invalid email address'),
});

/**
 * POST /api/email/send-temp-password
 * Send temporary password email to new user
 */
router.post('/send-temp-password', async (req: Request, res: Response) => {
  try {
    const validatedData = SendTempPasswordSchema.parse(req.body);

    await sendTempPasswordEmail(
      validatedData.userName,
      validatedData.email,
      validatedData.tempPassword,
      validatedData.appUrl
    );

    res.json({
      success: true,
      message: `Temporary password email sent to ${validatedData.email}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error sending temp password email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/email/send-password-reset-confirmation
 * Send password reset confirmation email
 */
router.post('/send-password-reset-confirmation', async (req: Request, res: Response) => {
  try {
    const validatedData = SendPasswordResetSchema.parse(req.body);

    await sendPasswordResetConfirmation(validatedData.userName, validatedData.email);

    res.json({
      success: true,
      message: `Password reset confirmation email sent to ${validatedData.email}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error sending password reset confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/email/test
 * Test SMTP connection
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    const { testEmailConnection } = await import('../services/emailService.js');
    const isConnected = await testEmailConnection();

    if (isConnected) {
      res.json({
        success: true,
        message: 'SMTP connection verified successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'SMTP connection failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test connection',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
