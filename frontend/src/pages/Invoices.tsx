import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { toast } from 'sonner';

const Invoices = () => {
	const navigate = useNavigate();
	const { invoices, deleteInvoice } = useApp();
	
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [sortBy, setSortBy] = useState('date');
	const [sortOrder, setSortOrder] = useState('desc');

	const filteredInvoices = invoices
		.filter(inv => 
			inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			inv.customerPhone.includes(searchTerm)
		)
		.filter(inv => statusFilter === 'all' || inv.status === statusFilter)
		.sort((a, b) => {
			if (sortBy === 'date') {
				return sortOrder === 'asc' 
					? new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()
					: new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
			}
			if (sortBy === 'amount') {
				return sortOrder === 'asc' ? a.grandTotal - b.grandTotal : b.grandTotal - a.grandTotal;
			}
			return 0;
		});

	const handleDelete = (id: string) => {
		deleteInvoice(id);
		toast.success('Invoice deleted successfully');
	};

	const stats = {
		total: invoices.length,
		paid: invoices.filter(i => i.status === 'paid').length,
		pending: invoices.filter(i => i.status === 'pending' || i.status === 'sent').length,
		overdue: invoices.filter(i => i.status === 'overdue').length,
		totalAmount: invoices.reduce((sum, i) => sum + i.grandTotal, 0)
	};

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-2 sm:gap-3">
						<FileText className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-white">Invoices</h1>
							<p className="text-gray-400 text-sm mt-1">{stats.total} total invoices • ₹{stats.totalAmount.toLocaleString()}</p>
						</div>
					</div>
					<Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto" onClick={() => navigate('/invoices/create')}>
						<Plus className="h-4 w-4 mr-2" />
						Create Invoice
					</Button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-4">
							<p className="text-gray-400 text-sm">Total</p>
							<p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
						</CardContent>
					</Card>
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-4">
							<p className="text-gray-400 text-sm">Paid</p>
							<p className="text-2xl font-bold text-green-400 mt-1">{stats.paid}</p>
						</CardContent>
					</Card>
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-4">
							<p className="text-gray-400 text-sm">Pending</p>
							<p className="text-2xl font-bold text-blue-400 mt-1">{stats.pending}</p>
						</CardContent>
					</Card>
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-4">
							<p className="text-gray-400 text-sm">Overdue</p>
							<p className="text-2xl font-bold text-red-400 mt-1">{stats.overdue}</p>
						</CardContent>
					</Card>
				</div>

				{/* Search and Filters */}
				<Card className="bg-[#111827] border-[#1F2937]">
					<CardContent className="p-4 sm:p-6">
						<div className="flex flex-col lg:flex-row gap-4">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input 
										placeholder="Search by invoice number, customer name, or phone..." 
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10 bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
									/>
								</div>
							</div>
							<div className="flex flex-col sm:flex-row gap-4">
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-full sm:w-48 bg-[#0B0F19] border-[#1F2937] text-gray-300">
										<SelectValue placeholder="Filter by status" />
									</SelectTrigger>
									<SelectContent className="bg-[#111827] border-[#1F2937]">
										<SelectItem value="all" className="text-gray-300">All Status</SelectItem>
										<SelectItem value="draft" className="text-gray-300">Draft</SelectItem>
										<SelectItem value="sent" className="text-gray-300">Sent</SelectItem>
										<SelectItem value="pending" className="text-gray-300">Pending</SelectItem>
										<SelectItem value="paid" className="text-gray-300">Paid</SelectItem>
										<SelectItem value="overdue" className="text-gray-300">Overdue</SelectItem>
									</SelectContent>
								</Select>
								<Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
									const [by, order] = value.split('-');
									setSortBy(by);
									setSortOrder(order);
								}}>
									<SelectTrigger className="w-full sm:w-48 bg-[#0B0F19] border-[#1F2937] text-gray-300">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent className="bg-[#111827] border-[#1F2937]">
										<SelectItem value="date-desc" className="text-gray-300">Date (Newest)</SelectItem>
										<SelectItem value="date-asc" className="text-gray-300">Date (Oldest)</SelectItem>
										<SelectItem value="amount-desc" className="text-gray-300">Amount (High)</SelectItem>
										<SelectItem value="amount-asc" className="text-gray-300">Amount (Low)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Invoices Table */}
				{filteredInvoices.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-gray-500">No invoices found. Create one to get started!</p>
						<Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/invoices/create')}>
							<Plus className="h-4 w-4 mr-2" />
							Create First Invoice
						</Button>
					</div>
				) : (
					<div className="overflow-x-auto rounded-lg border border-[#1F2937] mt-6">
						<table className="min-w-full divide-y divide-[#1F2937] text-gray-300">
							<thead className="bg-[#111827]">
								<tr>
									<th className="px-4 py-3 text-left font-semibold">Number</th>
									<th className="px-4 py-3 text-left font-semibold">Customer</th>
									<th className="px-4 py-3 text-left font-semibold">Amount</th>
									<th className="px-4 py-3 text-left font-semibold">Date</th>
									<th className="px-4 py-3 text-left font-semibold">Status</th>
									<th className="px-4 py-3 text-center font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-[#0B0F19] divide-y divide-[#1F2937]">
								{filteredInvoices.map((invoice) => (
									<tr key={invoice.id} className="hover:bg-[#1F2937] transition">
										<td className="px-4 py-3 whitespace-nowrap font-mono">{invoice.invoiceNumber}</td>
										<td className="px-4 py-3 whitespace-nowrap">{invoice.customerName}</td>
										<td className="px-4 py-3 whitespace-nowrap">₹{invoice.grandTotal.toLocaleString()}</td>
										<td className="px-4 py-3 whitespace-nowrap">{invoice.invoiceDate}</td>
										<td className="px-4 py-3 whitespace-nowrap">
											<span className={`px-2 py-1 rounded text-xs font-semibold ${
												invoice.status === 'paid' ? 'bg-green-900 text-green-400' :
												invoice.status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
												invoice.status === 'overdue' ? 'bg-red-900 text-red-400' :
												'bg-gray-800 text-gray-400'
											}`}>
												{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
											</span>
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-center flex gap-2 justify-center">
											<Button size="icon" variant="ghost" className="text-blue-400" title="View" onClick={() => navigate(`/invoices/${invoice.id}?view=true`)}>
												<Search className="h-4 w-4" />
											</Button>
											<Button size="icon" variant="ghost" className="text-gray-400" title="Edit" onClick={() => navigate(`/invoices/${invoice.id}`)}>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button size="icon" variant="ghost" className="text-red-400" title="Delete" onClick={() => handleDelete(invoice.id)}>
												<Trash2 className="h-4 w-4" />
											</Button>
											<Button size="icon" variant="ghost" className="text-green-400" title="PDF" onClick={() => navigate(`/invoices/${invoice.id}?pdf=true`)}>
												<FileText className="h-4 w-4" />
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</MainLayout>
	);
};

export default Invoices;
