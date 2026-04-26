import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/useApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { generateTempPassword } from '@/utils/passwordUtils';
import { sendTempPasswordEmail } from '@/services/emailService';

const Login = () => {
	const navigate = useNavigate();
	const { login } = useApp();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// Forgot Password state
	const [forgotOpen, setForgotOpen] = useState(false);
	const [forgotEmail, setForgotEmail] = useState('');
	const [isForgotLoading, setIsForgotLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		
		await new Promise(r => setTimeout(r, 800));
		
		const success = await login(email, password);
		if (success) {
			const userStr = localStorage.getItem('rental_auth_session');
			if (userStr) {
				const user = JSON.parse(userStr);
				if (user.is_temp_password) {
					toast.success('Welcome! Please set up your password.');
					navigate('/reset-password');
					setIsLoading(false);
					return;
				}
			}
			toast.success('Welcome back!');
			navigate('/');
		} else {
			toast.error('Invalid email or password');
		}
		setIsLoading(false);
	};

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!forgotEmail) {
			toast.error('Please enter your email address');
			return;
		}

		setIsForgotLoading(true);

		try {
			// Check if user exists in our custom users table
			const { data, error } = await supabase
				.from('users')
				.select('name, email')
				.eq('email', forgotEmail)
				.single();

			if (error || !data) {
				toast.error('No account found with that email address');
				setIsForgotLoading(false);
				return;
			}

			// Generate a new temp password
			const newTempPassword = generateTempPassword();

			// Update Supabase with the new temp password
			const { error: updateError } = await supabase
				.from('users')
				.update({ password: newTempPassword, is_temp_password: true })
				.eq('email', forgotEmail);

			if (updateError) {
				toast.error('Failed to reset password. Please try again.');
				setIsForgotLoading(false);
				return;
			}

			// Try to send email (best-effort — user still gets the password in the toast)
			try {
				await sendTempPasswordEmail(data.email, data.name, newTempPassword);
				toast.success('A new temporary password has been sent to your email!');
			} catch {
				// Email failed but password is reset — show it to the admin
				toast.error(`Email failed. Your new temp password is: ${newTempPassword}`, {
					duration: 15000,
				});
			}

			setForgotOpen(false);
			setForgotEmail('');
		} catch (err) {
			toast.error('Something went wrong. Please try again.');
		}

		setIsForgotLoading(false);
	};

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
						<span className="text-2xl font-bold text-white tracking-widest">RF</span>
					</div>
					<h1 className="text-3xl font-bold text-white tracking-tight">RentFlow</h1>
					<p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] mt-1">Management System</p>
				</div>

				<Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border">
					<CardHeader className="space-y-1 pb-6">
						<CardTitle className="text-2xl text-white font-bold">Signin</CardTitle>
						<CardDescription className="text-gray-400">
							Enter your credentials to access your dashboard
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-gray-300 ml-1">Email</Label>
								<div className="relative group">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
									<Input
										id="email"
										type="email"
										placeholder="name@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="bg-black/40 border-white/10 pl-10 h-12 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between ml-1">
									<Label htmlFor="password" className="text-gray-300">Password</Label>
									<button
										type="button"
										onClick={() => setForgotOpen(true)}
										className="text-[10px] text-primary hover:underline uppercase tracking-wider font-semibold"
									>
										Forgot?
									</button>
								</div>
								<div className="relative group">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
									<Input
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										className="bg-black/40 border-white/10 pl-10 h-12 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
									/>
								</div>
							</div>
							
							<Button 
								type="submit" 
								disabled={isLoading}
								className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(59,130,246,0.3)] group mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
							>
								{isLoading ? (
									<Loader2 className="h-5 w-5 animate-spin" />
								) : (
									<>
										Access Dashboard
										<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
				
				<p className="text-center mt-8 text-gray-600 text-xs tracking-wider uppercase">
					&copy; 2026 Digital Rent Flow. All rights reserved.
				</p>
			</motion.div>

			{/* Forgot Password Dialog */}
			<Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
				<DialogContent className="bg-[#111827] border-[#1F2937] text-white">
					<DialogHeader>
						<DialogTitle className="text-white flex items-center gap-2">
							<Mail className="h-5 w-5 text-primary" />
							Reset Password
						</DialogTitle>
						<DialogDescription className="text-gray-400">
							Enter your email address. We'll send you a new temporary password to log back in.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleForgotPassword} className="space-y-4 mt-2">
						<div className="space-y-2">
							<Label htmlFor="forgot-email" className="text-gray-300">Email Address</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
								<Input
									id="forgot-email"
									type="email"
									placeholder="name@example.com"
									value={forgotEmail}
									onChange={(e) => setForgotEmail(e.target.value)}
									required
									className="bg-black/40 border-white/10 pl-10 h-12 text-white placeholder:text-gray-600 focus:border-primary/50 rounded-xl"
								/>
							</div>
						</div>

						<DialogFooter className="gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setForgotOpen(false)}
								className="border-[#1F2937] text-gray-300 hover:bg-[#1F2937]"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isForgotLoading}
								className="bg-primary hover:bg-primary/90 text-white font-semibold"
							>
								{isForgotLoading ? (
									<><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</>
								) : (
									'Send Reset Password'
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Login;
