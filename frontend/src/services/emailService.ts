/**
 * Email Service - Frontend API Client
 * Communicates with backend email service to send emails
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface SendTempPasswordRequest {
  userName: string;
  email: string;
  tempPassword: string;
  appUrl?: string;
}

export interface SendPasswordResetRequest {
  userName: string;
  email: string;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Send temporary password email to new user
 */
export const sendTempPasswordEmail = async (data: SendTempPasswordRequest): Promise<EmailResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/send-temp-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending temp password email:', error);
    throw error;
  }
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (data: SendPasswordResetRequest): Promise<EmailResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/send-password-reset-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending password reset confirmation:', error);
    throw error;
  }
};

/**
 * Test email service connection
 */
export const testEmailConnection = async (): Promise<EmailResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to test connection');
    }

    return await response.json();
  } catch (error) {
    console.error('Error testing email connection:', error);
    throw error;
  }
};
