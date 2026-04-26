import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/useApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { validatePassword } from '@/utils/passwordUtils';

const ResetPassword = () => {
	const navigate = useNavigate();
	const { user, resetPassword } = useApp();
	
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

	// Validate password strength
	React.useEffect(() => {
		if (newPassword) {
			const validation = validatePassword(newPassword);
			setPasswordErrors(validation.errors);
		} else {
			setPasswordErrors([]);
		}
	}, [newPassword]);

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!newPassword || !confirmPassword) {
			toast.error('Please fill in all fields');
			return;
		}

		if (passwordErrors.length > 0) {
			toast.error('Password does not meet security requirements');
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		if (!user?.email) {
			toast.error('User information not found');
			return;
		}

		setIsLoading(true);
		const success = await resetPassword(user.email, newPassword);
		
		if (success) {
			toast.success('Password reset successfully!');
			// Redirect to dashboard
			navigate('/');
		} else {
			toast.error('Failed to reset password');
		}
		setIsLoading(false);
	};

	const isPasswordValid = passwordErrors.length === 0 && newPassword.length > 0;
	const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden">
			{/* Animated Background Blobs */}
			<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
			<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/20 rounded-full blur-[120px] animate-pulse delay-700" />
			
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="w-full max-w-md p-4 relative z-10"
			>
				{/* Logo Section */}
				<div className="flex flex-col items-center mb-8">
					<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)] mb-4">
						<Lock className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-white tracking-tight">Reset Password</h1>
					<p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] mt-1">Create Your New Password</p>
				</div>

				<Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border">
					<CardHeader className="space-y-1 pb-6">
						<CardTitle className="text-xl text-white font-bold">Set New Password</CardTitle>
						<CardDescription className="text-gray-400">
							This is your first login. Please create a strong password to secure your account.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleResetPassword} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="newPassword" className="text-gray-300 ml-1">New Password</Label>
								<div className="relative group">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
									<Input
										id="newPassword"
										type={showPassword ? "text" : "password"}
										placeholder="Enter new password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="bg-black/40 border-white/10 pl-10 pr-10 h-12 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							{/* Password Requirements */}
							{newPassword && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2"
								>
									<p className="text-xs font-medium text-gray-300">Password Requirements:</p>
									<div className="space-y-1">
										{passwordErrors.map((error, index) => (
											<div key={index} className="flex items-start gap-2 text-xs text-red-400">
												<AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
												<span>{error}</span>
											</div>
										))}
										{isPasswordValid && (
											<div className="flex items-start gap-2 text-xs text-green-400">
												<CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
												<span>Password meets all requirements</span>
											</div>
										)}
									</div>
								</motion.div>
							)}

							<div className="space-y-2">
								<Label htmlFor="confirmPassword" className="text-gray-300 ml-1">Confirm Password</Label>
								<div className="relative group">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Confirm new password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="bg-black/40 border-white/10 pl-10 pr-10 h-12 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							{/* Password Match Check */}
							{confirmPassword && (
								<div className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
									passwordsMatch
										? 'bg-green-400/10 text-green-400 border border-green-400/20'
										: 'bg-red-400/10 text-red-400 border border-red-400/20'
								}`}>
									{passwordsMatch ? (
										<CheckCircle2 className="h-3 w-3" />
									) : (
										<AlertCircle className="h-3 w-3" />
									)}
									{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
								</div>
							)}
							
							<Button 
								type="submit" 
								disabled={isLoading || !isPasswordValid || !passwordsMatch}
								className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? 'Resetting...' : 'Reset Password & Continue'}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="text-center mt-4">
					<p className="text-xs text-muted-foreground">
						Your account will be fully activated after password reset
					</p>
				</div>
			</motion.div>
		</div>
	);
};

export default ResetPassword;
