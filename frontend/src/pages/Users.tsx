import React, { useState } from 'react';
import { Plus, Search, Trash2, Pencil, Users as UsersIcon, Shield, Mail, UserPlus, Copy, Check, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { toast } from 'sonner';
import { User } from '@/context/types';
import { generateTempPassword } from '@/utils/passwordUtils';
import { sendTempPasswordEmail } from '@/services/emailService';

const Users = () => {
	const { users, addUser, updateUser, deleteUser, user: currentUser } = useApp();
	
	const [searchTerm, setSearchTerm] = useState('');
	const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<string | null>(null);
	const [generatedTempPassword, setGeneratedTempPassword] = useState<string | null>(null);
	const [copySuccess, setCopySuccess] = useState(false);
	const [isSendingEmail, setIsSendingEmail] = useState(false);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
	});

	const filteredUsers = users.filter(u =>
		u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		u.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleOpenAddDialog = () => {
		setEditingUser(null);
		setGeneratedTempPassword(null);
		setCopySuccess(false);
		setFormData({
			name: '',
			email: '',
		});
		setAddUserDialogOpen(true);
	};

	const handleOpenEditDialog = (u: User) => {
		setEditingUser(u);
		setGeneratedTempPassword(null);
		setCopySuccess(false);
		setFormData({
			name: u.name,
			email: u.email,
		});
		setAddUserDialogOpen(true);
	};

	const handleSaveUser = async () => {
		if (!formData.name || !formData.email) {
			toast.error('Please fill in required fields');
			return;
		}

		if (editingUser) {
			updateUser(editingUser.email, {
				name: formData.name,
				email: formData.email,
			});
			toast.success('User updated successfully');
			setAddUserDialogOpen(false);
		} else {
			// Generate temporary password for new user
			const tempPass = generateTempPassword();
			
			// Add user to database first
			const resultPass = await addUser({
				name: formData.name,
				email: formData.email,
				password: tempPass
			});

			if (!resultPass) {
				// addUser already showed a toast error
				return;
			}

			// Send email directly with result password
			setIsSendingEmail(true);
			try {
				await sendTempPasswordEmail({
					userName: formData.name,
					email: formData.email,
					tempPassword: resultPass,
					appUrl: window.location.origin,
				});

				toast.success(`✅ User created and temporary password sent to ${formData.email}`);
				setAddUserDialogOpen(false);
				setGeneratedTempPassword(null);
			} catch (error) {
				console.error('Error sending email:', error);
				toast.error(`User created but email failed: ${error instanceof Error ? error.message : 'Unknown error'}. Temp password: ${resultPass}`);
				setGeneratedTempPassword(resultPass); // Show temp password if email fails
			} finally {
				setIsSendingEmail(false);
			}
		}
	};

	const handleDeleteUser = () => {
		if (userToDelete) {
			if (userToDelete === currentUser?.email) {
				toast.error("You cannot delete yourself");
				return;
			}
			deleteUser(userToDelete);
			setDeleteDialogOpen(false);
			setUserToDelete(null);
			toast.success('User deleted successfully');
		}
	};

	const handleSendTempPasswordEmail = async () => {
		if (!generatedTempPassword || !formData.email || !formData.name) {
			toast.error('Missing required information');
			return;
		}

		setIsSendingEmail(true);
		try {
			await sendTempPasswordEmail({
				userName: formData.name,
				email: formData.email,
				tempPassword: generatedTempPassword,
				appUrl: window.location.origin,
			});

			toast.success(`✅ Temporary password email resent to ${formData.email}`);
			setAddUserDialogOpen(false);
			setGeneratedTempPassword(null);
		} catch (error) {
			console.error('Error sending email:', error);
			toast.error(`Failed to send email. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setIsSendingEmail(false);
		}
	};

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
						  <UsersIcon className="h-6 w-6 text-primary" />
            </div>
						<div>
              <h1 className="text-2xl font-bold text-white tracking-tight">System Users</h1>
              <p className="text-sm text-muted-foreground">Manage administrative access</p>
            </div>
					</div>
					<Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300" 
            onClick={handleOpenAddDialog}
          >
						<UserPlus className="h-4 w-4 mr-2" />
						Create User
					</Button>
				</div>

				{/* Search */}
				<Card className="bg-sidebar/40 border-white/5 backdrop-blur-xl">
					<CardContent className="p-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search users by name or email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 bg-black/20 border-white/5 text-white placeholder-gray-500 focus:ring-primary/50"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Table */}
				<Card className="bg-sidebar/40 border-white/5 backdrop-blur-xl overflow-hidden">
					<CardContent className="p-0">
						{filteredUsers.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-muted-foreground">No users found. Create one to get started!</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="border-white/5 hover:bg-white/5">
											<TableHead className="text-muted-foreground font-medium uppercase text-xs tracking-wider">User</TableHead>
											<TableHead className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Email</TableHead>
											<TableHead className="text-muted-foreground font-medium uppercase text-xs tracking-wider text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredUsers.map((u, idx) => (
											<TableRow key={`${u.email}-${idx}`} className="border-white/5 hover:bg-white/5 transition-colors group">
												<TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{u.name}</span>
                          </div>
                        </TableCell>
												<TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 opacity-50" />
                            {u.email}
                          </div>
                        </TableCell>
												<TableCell className="text-right">
													<div className="flex gap-2 justify-end">
														<Button
															variant="ghost"
															size="sm"
															className="text-muted-foreground hover:text-white hover:bg-white/10"
															onClick={() => handleOpenEditDialog(u)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
															onClick={() => {
																setUserToDelete(u.email);
																setDeleteDialogOpen(true);
															}}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Add/Edit User Dialog */}
			<Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
				<DialogContent className="bg-sidebar border-white/10 backdrop-blur-2xl">
					<DialogHeader>
						<DialogTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {editingUser ? 'Edit System User' : 'Create New User'}
            </DialogTitle>
						<DialogDescription className="text-muted-foreground">
							{editingUser ? 'Update user permissions and profile' : 'Add a new administrative user to the system'}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label className="text-white text-sm font-medium">Full Name</Label>
							<Input
								value={formData.name}
								onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
								className="bg-black/20 border-white/10 text-white placeholder-gray-600"
								placeholder="e.g. John Smith"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-white text-sm font-medium">Email Address</Label>
							<Input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
								className="bg-black/20 border-white/10 text-white placeholder-gray-600"
								placeholder="email@example.com"
                disabled={!!editingUser}
							/>
						</div>

						{!editingUser && (
							<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
								<p className="text-xs text-blue-200">
									✉️ A temporary password will be generated and sent directly to their email upon creation.
								</p>
							</div>
						)}

						{generatedTempPassword && (
							<div className="space-y-2 bg-primary/10 border border-primary/20 rounded-lg p-4">
								<Label className="text-white text-sm font-medium flex items-center gap-2">
									<Shield className="h-4 w-4 text-primary" />
									Temporary Password
								</Label>
								<div className="flex items-center gap-2">
									<div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm tracking-widest">
										{generatedTempPassword}
									</div>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										className="text-primary hover:bg-primary/10"
										onClick={() => {
											navigator.clipboard.writeText(generatedTempPassword);
											setCopySuccess(true);
											setTimeout(() => setCopySuccess(false), 2000);
										}}
									>
										{copySuccess ? (
											<Check className="h-4 w-4" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>
								<p className="text-[10px] text-muted-foreground">
									Email sending failed. Share this password manually with the user or try resending.
								</p>
							</div>
						)}
					</div>

					<DialogFooter className="gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row">
						<Button 
							variant="ghost" 
							onClick={() => setAddUserDialogOpen(false)} 
							className="text-muted-foreground hover:text-white"
						>
							{generatedTempPassword ? 'Close' : 'Cancel'}
						</Button>
						{!editingUser && !generatedTempPassword && (
							<Button 
								onClick={handleSaveUser}
								disabled={isSendingEmail}
								className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
							>
								{isSendingEmail ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Creating & Sending...
									</>
								) : (
									<>
										<UserPlus className="h-4 w-4" />
										Create User & Send Email
									</>
								)}
							</Button>
						)}
						{editingUser && (
							<Button 
								onClick={handleSaveUser} 
								className="bg-primary hover:bg-primary/90 text-primary-foreground"
							>
								Save Changes
							</Button>
						)}
						{generatedTempPassword && (
							<Button 
								onClick={handleSendTempPasswordEmail}
								disabled={isSendingEmail}
								className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
							>
								{isSendingEmail ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Sending...
									</>
								) : (
									<>
										<Send className="h-4 w-4" />
										Resend Email
									</>
								)}
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="bg-sidebar border-white/10 backdrop-blur-2xl">
					<DialogHeader>
						<DialogTitle className="text-white">Remove User Access?</DialogTitle>
						<DialogDescription className="text-muted-foreground">
							This will permanently revoke all access for this user. This action cannot be reversed.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} className="text-muted-foreground hover:text-white">
							Cancel
						</Button>
						<Button onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
							Delete User
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</MainLayout>
	);
};

export default Users;
