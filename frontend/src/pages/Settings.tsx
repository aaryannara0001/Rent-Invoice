import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Shield, Smartphone, Monitor, Palette, Globe, HardDrive } from 'lucide-react';

const Settings = () => {
	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
				<div>
					<h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
					<p className="text-muted-foreground mt-1 text-sm">Configure application behavior and global preferences</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Navigation Sidebar (Local to Settings) */}
					<div className="lg:col-span-1 space-y-2">
						{[
							{ icon: Bell, label: 'Notifications', active: true },
							{ icon: Shield, label: 'Security & Privacy' },
							{ icon: Palette, label: 'Appearance' },
							{ icon: Globe, label: 'Localization' },
							{ icon: HardDrive, label: 'Data & Storage' },
						].map((item) => (
							<button 
								key={item.label}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
									item.active 
										? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
										: 'text-gray-400 hover:text-white hover:bg-white/5'
								}`}
							>
								<item.icon className="h-4 w-4" />
								{item.label}
							</button>
						))}
					</div>

					{/* Content Area */}
					<div className="lg:col-span-2 space-y-6">
						<Card className="bg-white/5 border-white/10 backdrop-blur-xl">
							<CardHeader>
								<CardTitle className="text-white">Email Notifications</CardTitle>
								<CardDescription className="text-gray-400">Manage when and how you receive emails.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
									<div className="space-y-0.5">
										<Label className="text-white text-base">Payment Receipts</Label>
										<p className="text-sm text-gray-400">Receive an email when a payment is confirmed.</p>
									</div>
									<Switch defaultChecked />
								</div>

								<div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
									<div className="space-y-0.5">
										<Label className="text-white text-base">Daily Reports</Label>
										<p className="text-sm text-gray-400">Get a summary of daily rental activities every morning.</p>
									</div>
									<Switch />
								</div>
								
								<div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
									<div className="space-y-0.5">
										<Label className="text-white text-base">Overdue Alerts</Label>
										<p className="text-sm text-gray-400">Immediate notifications for invoices past their due date.</p>
									</div>
									<Switch defaultChecked />
								</div>
							</CardContent>
						</Card>

						<Card className="bg-white/5 border-white/10 backdrop-blur-xl">
							<CardHeader>
								<CardTitle className="text-white">App Preferences</CardTitle>
								<CardDescription className="text-gray-400">Customize the application interface logic.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
									<div className="space-y-0.5">
										<Label className="text-white text-base">Compact View</Label>
										<p className="text-sm text-gray-400">Display more items in tables by reducing vertical padding.</p>
									</div>
									<Switch />
								</div>
								
								<div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
									<div className="space-y-0.5">
										<Label className="text-white text-base">Auto-Save Drafts</Label>
										<p className="text-sm text-gray-400">Automatically save invoice drafts as you type.</p>
									</div>
									<Switch defaultChecked />
								</div>
							</CardContent>
						</Card>

						<div className="flex justify-end gap-3 pt-4">
							<Button variant="ghost" className="text-gray-400 hover:text-white">Reset to Default</Button>
							<Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">Apply Settings</Button>
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
};

export default Settings;
