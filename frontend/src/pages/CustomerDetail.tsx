import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';

const CustomerDetail = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { getCustomer, getCustomerInvoices, getCustomerRevenue } = useApp();

	const customer = id ? getCustomer(id) : null;
	const invoices = customer ? getCustomerInvoices(customer.id) : [];
	const totalRevenue = customer ? getCustomerRevenue(customer.id) : 0;

	if (!customer) {
		return (
			<MainLayout>
				<div className="p-6">
					<div className="flex items-center gap-4 mb-6">
						<Button variant="ghost" onClick={() => navigate('/customers')} className="text-gray-400 hover:text-gray-300">
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="text-3xl font-bold text-white">Customer Not Found</h1>
					</div>
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-12 text-center">
							<p className="text-gray-400 mb-4">The customer you're looking for doesn't exist.</p>
							<Button onClick={() => navigate('/customers')} className="bg-blue-600 hover:bg-blue-700 text-white">
								Back to Customers
							</Button>
						</CardContent>
					</Card>
				</div>
			</MainLayout>
		);
	}

	const statusColors = {
		paid: 'bg-green-500/10 text-green-400 border-green-500/20',
		pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
		overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
		draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
		sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
	};

	const totalPending = invoices
		.filter(inv => inv.status === 'pending' || inv.status === 'sent')
		.reduce((sum, inv) => sum + inv.grandTotal, 0);

	return (
		<MainLayout>
			<div className="p-6 max-w-6xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" onClick={() => navigate('/customers')} className="text-gray-400 hover:text-gray-300">
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="text-3xl font-bold text-white">{customer.name}</h1>
					</div>
					<Button onClick={() => navigate('/customers')} className="bg-blue-600 hover:bg-blue-700 text-white">
						Back to Customers
					</Button>
				</div>

				{/* Customer Info */}
				<Card className="bg-[#111827] border-[#1F2937]">
					<CardHeader>
						<CardTitle className="text-white">Customer Information</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="text-gray-400 text-sm">Name</label>
							<p className="text-gray-300 font-semibold">{customer.name}</p>
						</div>
						<div>
							<label className="text-gray-400 text-sm">Phone</label>
							<p className="text-gray-300 font-semibold">{customer.phone}</p>
						</div>
						<div>
							<label className="text-gray-400 text-sm">Email</label>
							<p className="text-gray-300 font-semibold">{customer.email}</p>
						</div>
						<div>
							<label className="text-gray-400 text-sm">GSTIN</label>
							<p className="text-gray-300 font-semibold">{customer.gstin || 'N/A'}</p>
						</div>
						<div className="md:col-span-2">
							<label className="text-gray-400 text-sm">Address</label>
							<p className="text-gray-300 font-semibold">{customer.address}</p>
						</div>
					</CardContent>
				</Card>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-6">
							<div className="text-sm text-gray-400 mb-2">Total Invoices</div>
							<div className="text-3xl font-bold text-white">{invoices.length}</div>
						</CardContent>
					</Card>
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-6">
							<div className="text-sm text-gray-400 mb-2">Total Revenue</div>
							<div className="text-3xl font-bold text-green-400">₹{totalRevenue.toFixed(2)}</div>
						</CardContent>
					</Card>
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-6">
							<div className="text-sm text-gray-400 mb-2">Pending Amount</div>
							<div className="text-3xl font-bold text-yellow-400">₹{totalPending.toFixed(2)}</div>
						</CardContent>
					</Card>
				</div>

				{/* Invoices */}
				<Card className="bg-[#111827] border-[#1F2937]">
					<CardHeader>
						<CardTitle className="text-white">Invoice History</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{invoices.length === 0 ? (
							<div className="p-6 text-center">
								<p className="text-gray-400">No invoices for this customer yet.</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="border-[#1F2937]">
											<TableHead className="text-gray-300">Invoice #</TableHead>
											<TableHead className="text-gray-300">Amount</TableHead>
											<TableHead className="text-gray-300">Status</TableHead>
											<TableHead className="text-gray-300">Date</TableHead>
											<TableHead className="text-gray-300">Due Date</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{invoices.map((invoice) => (
											<TableRow key={invoice.id} className="border-[#1F2937] hover:bg-[#1F2937]/30">
												<TableCell className="text-gray-300 font-medium">{invoice.invoiceNumber}</TableCell>
												<TableCell className="text-gray-300">₹{invoice.grandTotal.toFixed(2)}</TableCell>
												<TableCell>
													<Badge className={`${statusColors[invoice.status as keyof typeof statusColors]} border`}>
														{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
													</Badge>
												</TableCell>
												<TableCell className="text-gray-300">{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
												<TableCell className="text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
};

export default CustomerDetail;
