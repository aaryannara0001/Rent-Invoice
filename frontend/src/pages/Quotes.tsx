import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, FileText, Repeat, Quote as QuoteIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { toast } from 'sonner';

const Quotes = () => {
	const navigate = useNavigate();
	const { quotes, deleteQuote, convertQuoteToInvoice } = useApp();
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setSearchStatusFilter] = useState('all');
	const [sortBy, setSortBy] = useState('date');
	const [sortOrder, setSortOrder] = useState('desc');

	const filteredQuotes = quotes
		.filter(quote =>
			quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			quote.customerPhone.includes(searchTerm)
		)
		.filter(quote => statusFilter === 'all' || quote.status === statusFilter)
		.sort((a, b) => {
			if (sortBy === 'date') {
				return sortOrder === 'asc'
					? new Date(a.quoteDate).getTime() - new Date(b.quoteDate).getTime()
					: new Date(b.quoteDate).getTime() - new Date(a.quoteDate).getTime();
			}
			if (sortBy === 'amount') {
				return sortOrder === 'asc' ? a.grandTotal - b.grandTotal : b.grandTotal - a.grandTotal;
			}
			return 0;
		});

	const handleDelete = (id: string) => {
		deleteQuote(id);
		toast.success('Quote deleted successfully');
	};

	const handleConvert = (id: string) => {
		const invoice = convertQuoteToInvoice(id);
		if (invoice) {
			toast.success('Quote converted to invoice');
			navigate(`/invoices/${invoice.id}`);
		}
	};

	const stats = {
		total: quotes.length,
		draft: quotes.filter(q => q.status === 'draft').length,
		sent: quotes.filter(q => q.status === 'sent').length,
		accepted: quotes.filter(q => q.status === 'accepted').length,
		totalAmount: quotes.reduce((sum, q) => sum + q.grandTotal, 0),
	};

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-2 sm:gap-3">
						<QuoteIcon className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-white">Quotes</h1>
							<p className="text-gray-400 text-sm mt-1">{stats.total} total quotes • ₹{stats.totalAmount.toFixed(2)}</p>
						</div>
					</div>
					<Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto" onClick={() => navigate('/quotes/create')}>
						<Plus className="h-4 w-4 mr-2" />
						Create Quote
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
							<p className="text-gray-400 text-sm">Draft</p>
							<p className="text-2xl font-bold text-gray-400 mt-1">{stats.draft}</p>
						</CardContent>
					</Card>
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-4">
							<p className="text-gray-400 text-sm">Sent</p>
							<p className="text-2xl font-bold text-blue-400 mt-1">{stats.sent}</p>
						</CardContent>
					</Card>
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-4">
							<p className="text-gray-400 text-sm">Accepted</p>
							<p className="text-2xl font-bold text-green-400 mt-1">{stats.accepted}</p>
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
										placeholder="Search by quote number, customer name, or phone..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10 bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
									/>
								</div>
							</div>
							<div className="flex flex-col sm:flex-row gap-4">
								<Select value={statusFilter} onValueChange={setSearchStatusFilter}>
									<SelectTrigger className="w-full sm:w-48 bg-[#0B0F19] border-[#1F2937] text-gray-300">
										<SelectValue placeholder="Filter by status" />
									</SelectTrigger>
									<SelectContent className="bg-[#111827] border-[#1F2937]">
										<SelectItem value="all" className="text-gray-300">All Status</SelectItem>
										<SelectItem value="draft" className="text-gray-300">Draft</SelectItem>
										<SelectItem value="sent" className="text-gray-300">Sent</SelectItem>
										<SelectItem value="accepted" className="text-gray-300">Accepted</SelectItem>
										<SelectItem value="rejected" className="text-gray-300">Rejected</SelectItem>
										<SelectItem value="converted" className="text-gray-300">Converted</SelectItem>
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
				{/* Quotes Table */}
				{filteredQuotes.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-gray-500">No quotes found. Create one to get started!</p>
						<Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/quotes/create')}>
							<Plus className="h-4 w-4 mr-2" />
							Create First Quote
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
									<th className="px-4 py-3 text-left font-semibold">Valid Until</th>
									<th className="px-4 py-3 text-left font-semibold">Status</th>
									<th className="px-4 py-3 text-center font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-[#0B0F19] divide-y divide-[#1F2937]">
								{filteredQuotes.map((quote) => (
									<tr key={quote.id} className="hover:bg-[#1F2937] transition">
										<td className="px-4 py-3 whitespace-nowrap font-mono">{quote.quoteNumber}</td>
										<td className="px-4 py-3 whitespace-nowrap">{quote.customerName}</td>
										<td className="px-4 py-3 whitespace-nowrap">₹{quote.grandTotal.toFixed(2)}</td>
										<td className="px-4 py-3 whitespace-nowrap">{quote.quoteDate}</td>
										<td className="px-4 py-3 whitespace-nowrap">{quote.validUntil}</td>
										<td className="px-4 py-3 whitespace-nowrap">
											<span className={`px-2 py-1 rounded text-xs font-semibold ${
												quote.status === 'accepted' ? 'bg-green-900 text-green-400' :
												quote.status === 'sent' ? 'bg-blue-900 text-blue-400' :
												quote.status === 'draft' ? 'bg-gray-800 text-gray-400' :
												quote.status === 'rejected' ? 'bg-red-900 text-red-400' :
												quote.status === 'converted' ? 'bg-yellow-900 text-yellow-400' :
												'bg-gray-800 text-gray-400'
											}`}>
												{quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
											</span>
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-center flex gap-2 justify-center">
											<Button size="icon" variant="ghost" className="text-blue-400" title="View" onClick={() => navigate(`/quotes/${quote.id}?view=true`)}>
												<Search className="h-4 w-4" />
											</Button>
											<Button size="icon" variant="ghost" className="text-gray-400" title="Edit" onClick={() => navigate(`/quotes/${quote.id}`)}>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button size="icon" variant="ghost" className="text-red-400" title="Delete" onClick={() => handleDelete(quote.id)}>
												<Trash2 className="h-4 w-4" />
											</Button>
											<Button size="icon" variant="ghost" className="text-green-400" title="PDF" onClick={() => navigate(`/quotes/${quote.id}?pdf=true`)}>
												<FileText className="h-4 w-4" />
											</Button>
											{quote.status !== 'converted' && (
												<Button size="icon" variant="ghost" className="text-yellow-400" title="Convert to Invoice" onClick={() => handleConvert(quote.id)}>
													<Repeat className="h-4 w-4" />
												</Button>
											)}
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

export default Quotes;