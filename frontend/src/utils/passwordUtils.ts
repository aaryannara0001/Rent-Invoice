/**
 * Utility functions for temporary password generation and management
 */

/**
 * Generate a secure temporary password (8 chars: mix of uppercase, lowercase, numbers, special chars)
 */
export const generateTempPassword = (): string => {
	const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const lowercase = 'abcdefghijklmnopqrstuvwxyz';
	const numbers = '0123456789';
	const special = '!@#$%^&*';
	
	const allChars = uppercase + lowercase + numbers + special;
	let password = '';
	
	// Ensure at least one char from each category
	password += uppercase[Math.floor(Math.random() * uppercase.length)];
	password += lowercase[Math.floor(Math.random() * lowercase.length)];
	password += numbers[Math.floor(Math.random() * numbers.length)];
	password += special[Math.floor(Math.random() * special.length)];
	
	// Fill the rest randomly
	for (let i = password.length; i < 8; i++) {
		password += allChars[Math.floor(Math.random() * allChars.length)];
	}
	
	// Shuffle the password
	return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];
	
	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}
	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}
	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}
	if (!/\d/.test(password)) {
		errors.push('Password must contain at least one number');
	}
	if (!/[!@#$%^&*()_+=\-[\]{};:'",./<>?\\|`~]/.test(password)) {
		errors.push('Password must contain at least one special character');
	}
	
	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Check if a password is likely a temporary password (simple heuristic)
 */
export const isTempPassword = (password: string): boolean => {
	// A simple heuristic: temp passwords are 8 characters with specific pattern
	// In real implementation, you'd check against a `is_temp_password` flag in DB
	return password.length === 8;
};

/**
 * Generate email body for temporary password
 */
export const generateTempPasswordEmail = (userName: string, email: string, tempPassword: string, loginUrl: string): { subject: string; body: string } => {
	return {
		subject: 'Your RentFlow Account is Ready - Set Your Password',
		body: `
Hello ${userName},

Your RentFlow account has been created! 

To get started, please log in using your temporary password and then set a permanent password.

Email: ${email}
Temporary Password: ${tempPassword}

Login here: ${loginUrl}

⚠️ IMPORTANT: Your temporary password will expire after your first login. You will be required to set a new password immediately.

If you did not request this account, please contact our support team immediately.

Best regards,
RentFlow Team
		`.trim(),
	};
};
