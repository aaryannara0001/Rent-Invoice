import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/useApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Login = () => {
	const navigate = useNavigate();
	const { login } = useApp();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		
		// Artificial delay for premium feel
		await new Promise(r => setTimeout(r, 800));
		
		const success = await login(email, password);
		if (success) {
			// Check if this is a temporary password login
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
									<button type="button" className="text-[10px] text-primary hover:underline uppercase tracking-wider font-semibold">Forgot?</button>
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

						<div className="mt-8 pt-6 border-t border-white/5 text-center">
							<p className="text-sm text-gray-500 italic">
								Hint: nishunara862@gmail.com / 12345678
							</p>
						</div>
					</CardContent>
				</Card>
				
				<p className="text-center mt-8 text-gray-600 text-xs tracking-wider uppercase">
					&copy; 2026 Digital Rent Flow. All rights reserved.
				</p>
			</motion.div>
		</div>
	);
};

export default Login;
