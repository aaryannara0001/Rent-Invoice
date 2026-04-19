import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, Camera, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
	const { user, logout } = useApp();

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h1>
						<p className="text-muted-foreground mt-1 text-sm">Manage your account information and preferences</p>
					</div>
					<Button 
						variant="outline" 
						className="border-red-500/20 text-red-400 hover:bg-red-500/10"
						onClick={logout}
					>
						<LogOut className="h-4 w-4 mr-2" />
						Logout
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Left: Avatar & Quick Info */}
					<div className="md:col-span-1 space-y-6">
						<Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
							<div className="h-24 bg-gradient-to-r from-primary/30 to-neon-purple/30" />
							<CardContent className="pt-0 flex flex-col items-center -mt-12">
								<div className="relative group">
									<div className="h-24 w-24 rounded-full p-1 bg-gradient-to-tr from-primary to-neon-purple shadow-xl">
										<div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden border-4 border-[#0B0F19]">
											<User className="h-12 w-12 text-primary" />
										</div>
									</div>
									<button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
										<Camera className="h-4 w-4" />
									</button>
								</div>
								<h3 className="mt-4 text-xl font-bold text-white">{user?.name}</h3>
							</CardContent>
						</Card>

						<Card className="bg-white/5 border-white/10 backdrop-blur-xl">
							<CardContent className="p-4 space-y-4">
								<div className="flex items-center gap-3 text-sm">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<span className="text-gray-300">{user?.email}</span>
								</div>
								<div className="flex items-center gap-3 text-sm">
									<Shield className="h-4 w-4 text-muted-foreground" />
									<span className="text-gray-300">Two-Factor Auth Enabled</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right: Detailed Edit Form */}
					<div className="md:col-span-2">
						<Card className="bg-white/5 border-white/10 backdrop-blur-xl h-full">
							<CardHeader>
								<CardTitle className="text-white">Personal Information</CardTitle>
								<CardDescription className="text-gray-400">Update your account details and how others see you.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label className="text-gray-300">Display Name</Label>
										<Input 
											defaultValue={user?.name}
											className="bg-black/20 border-white/10 h-11 text-white focus:ring-primary/20"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-gray-300">Email Address</Label>
										<Input 
											defaultValue={user?.email}
											disabled
											className="bg-black/40 border-white/5 h-11 text-gray-500 cursor-not-allowed"
										/>
									</div>
								</div>
								
								<div className="space-y-2">
									<Label className="text-gray-300">Bio</Label>
									<textarea 
										className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none h-32"
										placeholder="Tell us about yourself..."
										defaultValue="Lead Administrator at RentFlow. Managing rental operations and financial workflows."
									/>
								</div>

								<div className="pt-4 flex justify-end gap-3">
									<Button variant="ghost" className="text-gray-400 hover:text-white">Cancel</Button>
									<Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">Save Changes</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</MainLayout>
	);
};

// Simple Badge replacement if component missing
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
	<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${className}`}>
		{children}
	</span>
);

export default Profile;
