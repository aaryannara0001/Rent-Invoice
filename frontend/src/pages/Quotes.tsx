import React, { useState } from 'react';
import { Plus, Download, Search, Trash2, Eye, Edit, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { toast } from 'sonner';
import { generateQuotePDF } from '@/lib/pdfGenerator';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import { Quote } from '@/context/types';

const statusColors = {
	draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
	sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
	accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
	rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
	converted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const Quotes = () => {
	const navigate = useNavigate();
	const { quotes, deleteQuote, updateQuote, convertQuoteToInvoice } = useApp();
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
	const [convertDialogOpen, setConvertDialogOpen] = useState(false);
	const [quoteToConvert, setQuoteToConvert] = useState<string | null>(null);
	const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	const filteredQuotes = quotes
		.filter(quote =>
			quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			quote.customerPhone.includes(searchTerm)
		)
		.filter(quote => statusFilter === 'all' || quote.status === statusFilter)
		.sort((a, b) => new Date(b.quoteDate).getTime() - new Date(a.quoteDate).getTime());

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedQuotes(filteredQuotes.map(q => q.id));
		} else {
			setSelectedQuotes([]);
		}
	};

	const handleSelectQuote = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedQuotes([...selectedQuotes, id]);
		} else {
			setSelectedQuotes(selectedQuotes.filter(qId => qId !== id));
		}
	};

	const handleDeleteQuote = () => {
		if (quoteToDelete) {
			deleteQuote(quoteToDelete);
			setDeleteDialogOpen(false);
			setQuoteToDelete(null);
			toast.success('Quote deleted successfully');
		}
	};

	const handleConvertQuote = () => {
		if (quoteToConvert) {
			const invoice = convertQuoteToInvoice(quoteToConvert);
			if (invoice) {
				setConvertDialogOpen(false);
				setQuoteToConvert(null);
				toast.success('Quote converted to invoice');
				navigate(`/invoices/${invoice.id}`);
			}
		}
	};

	const handleBulkDelete = () => {
		selectedQuotes.forEach(id => deleteQuote(id));
		setSelectedQuotes([]);
		toast.success(`${selectedQuotes.length} quote(s) deleted`);
	};

	const handleBulkStatusChange = (status: string) => {
		selectedQuotes.forEach(id => {
			const quote = quotes.find(q => q.id === id);
			if (quote) {
				updateQuote(id, {
					...quote,
					status: status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted',
					updatedAt: new Date().toISOString(),
				});
			}
		});
		setSelectedQuotes([]);
		toast.success(`Status updated for ${selectedQuotes.length} quote(s)`);
	};

	return (
		<MainLayout>
			<div className="p-6 space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold text-white">Quotes</h1>
					<div className="flex flex-wrap gap-2 sm:gap-3">
						<Button variant="outline" className="bg-[#1F2937] border-[#1F2937] text-gray-300 hover:bg-[#374151] text-sm">
							<Download className="h-4 w-4 mr-2" />
							Export
						</Button>
						<Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => navigate('/quotes/create')}>
							<Plus className="h-4 w-4 mr-2" />
							Create Quote
						</Button>
					</div>
				</div>

				{/* Filters */}
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
							<Select value={statusFilter} onValueChange={setStatusFilter}>
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
						</div>
					</CardContent>
				</Card>

				{/* Bulk Actions */}
				{selectedQuotes.length > 0 && (
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-4">
							<div className="flex flex-col sm:flex-row sm:items-center gap-4">
								<span className="text-gray-300">{selectedQuotes.length} selected</span>
								<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
									<Select value="" onValueChange={(status) => handleBulkStatusChange(status)}>
										<SelectTrigger className="w-full sm:w-48 bg-[#0B0F19] border-[#1F2937] text-gray-300">
											<SelectValue placeholder="Change status..." />
										</SelectTrigger>
										<SelectContent className="bg-[#111827] border-[#1F2937]">
											<SelectItem value="draft" className="text-gray-300">Draft</SelectItem>
											<SelectItem value="sent" className="text-gray-300">Sent</SelectItem>
											<SelectItem value="accepted" className="text-gray-300">Accepted</SelectItem>
											<SelectItem value="rejected" className="text-gray-300">Rejected</SelectItem>
										</SelectContent>
									</Select>
									<Button variant="outline" size="sm" className="bg-red-600 hover:bg-red-700 text-white border-red-600 w-full sm:w-auto">
										<Trash2 className="h-4 w-4 mr-2" />
										Delete
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Table */}
				<Card className="bg-[#111827] border-[#1F2937]">
					<CardContent className="p-0">
						{filteredQuotes.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-gray-500">No quotes found. Create one to get started!</p>
								<Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/quotes/create')}>
									<Plus className="h-4 w-4 mr-2" />
									Create First Quote
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="border-[#1F2937] hover:bg-[#1F2937]/50">
											<TableHead className="w-12">
												<Checkbox
													checked={selectedQuotes.length === filteredQuotes.length && filteredQuotes.length > 0}
													onCheckedChange={handleSelectAll}
												/>
											</TableHead>
											<TableHead className="text-gray-300">Quote #</TableHead>
											<TableHead className="text-gray-300">Customer</TableHead>
											<TableHead className="text-gray-300">Amount</TableHead>
											<TableHead className="text-gray-300">Status</TableHead>
											<TableHead className="text-gray-300">Date</TableHead>
											<TableHead className="text-gray-300">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredQuotes.map((quote) => (
											<TableRow key={quote.id} className="border-[#1F2937] hover:bg-[#1F2937]/30 transition-colors">
												<TableCell>
													<Checkbox
														checked={selectedQuotes.includes(quote.id)}
														onCheckedChange={(checked) => handleSelectQuote(quote.id, checked as boolean)}
													/>
												</TableCell>
												<TableCell className="text-gray-300 font-medium">{quote.quoteNumber}</TableCell>
												<TableCell className="text-gray-300">{quote.customerName}</TableCell>
												<TableCell className="text-gray-300 font-semibold">₹{quote.grandTotal.toFixed(2)}</TableCell>
												<TableCell>
													<Badge className={`${statusColors[quote.status as keyof typeof statusColors]} border`}>
														{quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
													</Badge>
												</TableCell>
												<TableCell className="text-gray-300">{new Date(quote.quoteDate).toLocaleDateString()}</TableCell>
												<TableCell>
													<div className="flex gap-2">
														<Button
															variant="ghost"
															size="sm"
															className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
															onClick={() => {
																setPreviewQuote(quote);
																setIsPreviewOpen(true);
															}}
														>
															<Eye className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
															onClick={() => navigate(`/quotes/${quote.id}`)}
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
															onClick={() => generateQuotePDF(quote.id, quote.customerName)}
														>
															<Download className="h-4 w-4" />
														</Button>
														{quote.status !== 'converted' && quote.status !== 'rejected' && (
															<Button
																variant="ghost"
																size="sm"
																className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
																onClick={() => {
																	setQuoteToConvert(quote.id);
																	setConvertDialogOpen(true);
																}}
																title="Convert to Invoice"
															>
																<ArrowRight className="h-4 w-4" />
															</Button>
														)}
														<Button
															variant="ghost"
															size="sm"
															className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
															onClick={() => {
																setQuoteToDelete(quote.id);
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

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="bg-[#111827] border-[#1F2937]">
					<DialogHeader>
						<DialogTitle className="text-white">Delete Quote</DialogTitle>
						<DialogDescription className="text-gray-400">
							Are you sure you want to delete this quote? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-[#1F2937] text-gray-300">
							Cancel
						</Button>
						<Button onClick={handleDeleteQuote} className="bg-red-600 hover:bg-red-700 text-white">
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Convert to Invoice Dialog */}
			<Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
				<DialogContent className="bg-[#111827] border-[#1F2937]">
					<DialogHeader>
						<DialogTitle className="text-white">Convert to Invoice</DialogTitle>
						<DialogDescription className="text-gray-400">
							Convert this quote to an invoice? The quote status will be marked as converted.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConvertDialogOpen(false)} className="border-[#1F2937] text-gray-300">
							Cancel
						</Button>
						<Button onClick={handleConvertQuote} className="bg-green-600 hover:bg-green-700 text-white">
							Convert
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<PDFPreviewModal
				isOpen={isPreviewOpen}
				onClose={() => setIsPreviewOpen(false)}
				type="quote"
				data={previewQuote}
			/>
		</MainLayout>
	);
};

export default Quotes;
