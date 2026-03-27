import React, { useState } from 'react';
import { Plus, Search, Trash2, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { toast } from 'sonner';
import { Customer } from '@/context/types';

const Customers = () => {
	const navigate = useNavigate();
	const { customers, addCustomer, updateCustomer, deleteCustomer, getCustomerInvoices, getCustomerRevenue } = useApp();
	const [searchTerm, setSearchTerm] = useState('');
	const [addCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
		gstin: '',
	});

	const filteredCustomers = customers.filter(customer =>
		customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		customer.phone.includes(searchTerm) ||
		customer.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleOpenAddDialog = () => {
		setEditingCustomer(null);
		setFormData({
			name: '',
			phone: '',
			email: '',
			address: '',
			gstin: '',
		});
		setAddCustomerDialogOpen(true);
	};

	const handleOpenEditDialog = (customer: Customer) => {
		setEditingCustomer(customer);
		setFormData({
			name: customer.name,
			phone: customer.phone,
			email: customer.email,
			address: customer.address,
			gstin: customer.gstin,
		});
		setAddCustomerDialogOpen(true);
	};

	const handleSaveCustomer = () => {
		if (!formData.name || !formData.phone || !formData.email) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (editingCustomer) {
			updateCustomer(editingCustomer.id, {
				...editingCustomer,
				...formData,
				updatedAt: new Date().toISOString(),
			});
			toast.success('Customer updated successfully');
		} else {
			const newCustomer: Customer = {
				id: `CUST-${Date.now()}`,
				...formData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			addCustomer(newCustomer);
			toast.success('Customer added successfully');
		}

		setAddCustomerDialogOpen(false);
		setFormData({
			name: '',
			phone: '',
			email: '',
			address: '',
			gstin: '',
		});
	};

	const handleDeleteCustomer = () => {
		if (customerToDelete) {
			deleteCustomer(customerToDelete);
			setDeleteDialogOpen(false);
			setCustomerToDelete(null);
			toast.success('Customer deleted successfully');
		}
	};

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold text-white">Customers</h1>
					<Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm w-full sm:w-auto" onClick={handleOpenAddDialog}>
						<Plus className="h-4 w-4 mr-2" />
						Add Customer
					</Button>
				</div>

				{/* Search */}
				<Card className="bg-[#111827] border-[#1F2937]">
					<CardContent className="p-4 sm:p-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Search by name, phone, or email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Table */}
				<Card className="bg-[#111827] border-[#1F2937]">
					<CardContent className="p-0">
						{filteredCustomers.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-gray-500">No customers found. Add one to get started!</p>
								<Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleOpenAddDialog}>
									<Plus className="h-4 w-4 mr-2" />
									Add First Customer
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="border-[#1F2937] hover:bg-[#1F2937]/50">
											<TableHead className="text-gray-300">Name</TableHead>
											<TableHead className="text-gray-300">Phone</TableHead>
											<TableHead className="text-gray-300">Email</TableHead>
											<TableHead className="text-gray-300">Address</TableHead>
											<TableHead className="text-gray-300">Invoices</TableHead>
											<TableHead className="text-gray-300">Total Revenue</TableHead>
											<TableHead className="text-gray-300">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredCustomers.map((customer) => {
											const invoices = getCustomerInvoices(customer.id);
											const revenue = getCustomerRevenue(customer.id);

											return (
												<TableRow key={customer.id} className="border-[#1F2937] hover:bg-[#1F2937]/30 transition-colors">
													<TableCell className="text-gray-300 font-medium">{customer.name}</TableCell>
													<TableCell className="text-gray-300">{customer.phone}</TableCell>
													<TableCell className="text-gray-300">{customer.email}</TableCell>
													<TableCell className="text-gray-300 text-sm">{customer.address.substring(0, 30)}...</TableCell>
													<TableCell className="text-gray-300">
														<Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
															{invoices.length}
														</Badge>
													</TableCell>
													<TableCell className="text-gray-300 font-semibold">₹{revenue.toFixed(2)}</TableCell>
													<TableCell>
														<div className="flex gap-2">
															<Button
																variant="ghost"
																size="sm"
																className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
																onClick={() => navigate(`/customers/${customer.id}`)}
															>
																<Eye className="h-4 w-4" />
															</Button>
															<Button
																variant="ghost"
																size="sm"
																className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
																onClick={() => handleOpenEditDialog(customer)}
															>
																<Edit className="h-4 w-4" />
															</Button>
															<Button
																variant="ghost"
																size="sm"
																className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
																onClick={() => {
																	setCustomerToDelete(customer.id);
																	setDeleteDialogOpen(true);
																}}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Add/Edit Customer Dialog */}
			<Dialog open={addCustomerDialogOpen} onOpenChange={setAddCustomerDialogOpen}>
				<DialogContent className="bg-[#111827] border-[#1F2937]">
					<DialogHeader>
						<DialogTitle className="text-white">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
						<DialogDescription className="text-gray-400">
							{editingCustomer ? 'Update customer information' : 'Add a new customer to your list'}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label className="text-gray-300">Name *</Label>
							<Input
								value={formData.name}
								onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
								placeholder="John Doe"
							/>
						</div>

						<div>
							<Label className="text-gray-300">Phone *</Label>
							<Input
								value={formData.phone}
								onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
								placeholder="+1 234 567 8900"
							/>
						</div>

						<div>
							<Label className="text-gray-300">Email *</Label>
							<Input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
								placeholder="john@example.com"
							/>
						</div>

						<div>
							<Label className="text-gray-300">Address</Label>
							<Input
								value={formData.address}
								onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
								placeholder="123 Main St, City, State 12345"
							/>
						</div>

						<div>
							<Label className="text-gray-300">GSTIN</Label>
							<Input
								value={formData.gstin}
								onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
								placeholder="22AAAAA0000A1Z5"
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setAddCustomerDialogOpen(false)} className="border-[#1F2937] text-gray-300">
							Cancel
						</Button>
						<Button onClick={handleSaveCustomer} className="bg-blue-600 hover:bg-blue-700 text-white">
							{editingCustomer ? 'Update' : 'Add'} Customer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="bg-[#111827] border-[#1F2937]">
					<DialogHeader>
						<DialogTitle className="text-white">Delete Customer</DialogTitle>
						<DialogDescription className="text-gray-400">
							Are you sure you want to delete this customer? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-[#1F2937] text-gray-300">
							Cancel
						</Button>
						<Button onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700 text-white">
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</MainLayout>
	);
};

export default Customers;
