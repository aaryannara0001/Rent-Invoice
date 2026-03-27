import React, { useState } from 'react';
import { Plus, Download, Search, Filter, ChevronDown, Trash2, Eye, Edit } from 'lucide-react';
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
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import { Invoice } from '@/context/types';

const statusColors = {
	paid: 'bg-green-500/10 text-green-400 border-green-500/20',
	pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
	overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
	draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
	sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const Invoices = () => {
	const navigate = useNavigate();
	const { invoices, deleteInvoice, updateInvoice } = useApp();
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [sortBy, setSortBy] = useState('date');
	const [sortOrder, setSortOrder] = useState('desc');
	const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	const [statusChangeData, setStatusChangeData] = useState<{ id: string; status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' } | null>(null);
	const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	const filteredInvoices = invoices
		.filter(invoice =>
			invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			invoice.customerPhone.includes(searchTerm)
		)
		.filter(invoice => statusFilter === 'all' || invoice.status === statusFilter)
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

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedInvoices(filteredInvoices.map(inv => inv.id));
		} else {
			setSelectedInvoices([]);
		}
	};

	const handleSelectInvoice = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedInvoices([...selectedInvoices, id]);
		} else {
			setSelectedInvoices(selectedInvoices.filter(invId => invId !== id));
		}
	};

	const handleDeleteInvoice = () => {
		if (invoiceToDelete) {
			deleteInvoice(invoiceToDelete);
			setDeleteDialogOpen(false);
			setInvoiceToDelete(null);
			toast.success('Invoice deleted successfully');
		}
	};

	const handleChangeStatus = () => {
		if (statusChangeData) {
			const invoice = invoices.find(inv => inv.id === statusChangeData.id);
			if (invoice) {
				updateInvoice(statusChangeData.id, {
					...invoice,
					status: statusChangeData.status,
					updatedAt: new Date().toISOString(),
				});
				setStatusDialogOpen(false);
				setStatusChangeData(null);
				toast.success('Invoice status updated');
			}
		}
	};

	const handleBulkDelete = () => {
		selectedInvoices.forEach(id => deleteInvoice(id));
		setSelectedInvoices([]);
		toast.success(`${selectedInvoices.length} invoice(s) deleted`);
	};

	const handleBulkStatusChange = (status: string) => {
		selectedInvoices.forEach(id => {
			const invoice = invoices.find(inv => inv.id === id);
			if (invoice) {
				updateInvoice(id, {
					...invoice,
					status: status as 'draft' | 'sent' | 'pending' | 'paid' | 'overdue',
					updatedAt: new Date().toISOString(),
				});
			}
		});
		setSelectedInvoices([]);
		toast.success(`Status updated for ${selectedInvoices.length} invoice(s)`);
	};

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold text-white">Invoices</h1>
					<div className="flex flex-wrap gap-2 sm:gap-3">
						<Button variant="outline" className="bg-[#1F2937] border-[#1F2937] text-gray-300 hover:bg-[#374151] text-sm">
							<Download className="h-4 w-4 mr-2" />
							Export
						</Button>
						<Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => navigate('/invoices/create')}>
							<Plus className="h-4 w-4 mr-2" />
							Create Invoice
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

				{/* Bulk Actions */}
				{selectedInvoices.length > 0 && (
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardContent className="p-4">
							<div className="flex items-center gap-4 flex-wrap">
								<span className="text-gray-300">{selectedInvoices.length} selected</span>
								<Select value="" onValueChange={(status) => handleBulkStatusChange(status)}>
									<SelectTrigger className="w-48 bg-[#0B0F19] border-[#1F2937] text-gray-300">
										<SelectValue placeholder="Change status..." />
									</SelectTrigger>
									<SelectContent className="bg-[#111827] border-[#1F2937]">
										<SelectItem value="draft" className="text-gray-300">Draft</SelectItem>
										<SelectItem value="sent" className="text-gray-300">Sent</SelectItem>
										<SelectItem value="pending" className="text-gray-300">Pending</SelectItem>
										<SelectItem value="paid" className="text-gray-300">Paid</SelectItem>
										<SelectItem value="overdue" className="text-gray-300">Overdue</SelectItem>
									</SelectContent>
								</Select>
								<Button variant="outline" size="sm" className="bg-red-600 hover:bg-red-700 text-white border-red-600" onClick={handleBulkDelete}>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Table */}
				<Card className="bg-[#111827] border-[#1F2937]">
					<CardContent className="p-0">
						{filteredInvoices.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-gray-500">No invoices found. Create one to get started!</p>
								<Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/invoices/create')}>
									<Plus className="h-4 w-4 mr-2" />
									Create First Invoice
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="border-[#1F2937] hover:bg-[#1F2937]/50">
											<TableHead className="w-12">
												<Checkbox
													checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
													onCheckedChange={handleSelectAll}
												/>
											</TableHead>
											<TableHead className="text-gray-300">Invoice #</TableHead>
											<TableHead className="text-gray-300">Customer</TableHead>
											<TableHead className="text-gray-300">Amount</TableHead>
											<TableHead className="text-gray-300">Status</TableHead>
											<TableHead className="text-gray-300">Date</TableHead>
											<TableHead className="text-gray-300">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredInvoices.map((invoice) => (
											<TableRow key={invoice.id} className="border-[#1F2937] hover:bg-[#1F2937]/30 transition-colors">
												<TableCell>
													<Checkbox
														checked={selectedInvoices.includes(invoice.id)}
														onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
													/>
												</TableCell>
												<TableCell className="text-gray-300 font-medium">{invoice.invoiceNumber}</TableCell>
												<TableCell className="text-gray-300">{invoice.customerName}</TableCell>
												<TableCell className="text-gray-300 font-semibold">₹{invoice.grandTotal.toFixed(2)}</TableCell>
												<TableCell>
													<Badge className={`${statusColors[invoice.status as keyof typeof statusColors]} border`}>
														{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
													</Badge>
												</TableCell>
												<TableCell className="text-gray-300">{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
												<TableCell>
													<div className="flex gap-2">
														<Button
															variant="ghost"
															size="sm"
															className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
															onClick={() => {
																setPreviewInvoice(invoice);
																setIsPreviewOpen(true);
															}}
														>
															<Eye className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
															onClick={() => navigate(`/invoices/${invoice.id}`)}
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
															onClick={() => generateInvoicePDF(invoice.id, invoice.customerName)}
														>
															<Download className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
															onClick={() => {
																setInvoiceToDelete(invoice.id);
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
						<DialogTitle className="text-white">Delete Invoice</DialogTitle>
						<DialogDescription className="text-gray-400">
							Are you sure you want to delete this invoice? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-[#1F2937] text-gray-300">
							Cancel
						</Button>
						<Button onClick={handleDeleteInvoice} className="bg-red-600 hover:bg-red-700 text-white">
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<PDFPreviewModal
				isOpen={isPreviewOpen}
				onClose={() => setIsPreviewOpen(false)}
				type="invoice"
				data={previewInvoice}
			/>
		</MainLayout>
	);
};

export default Invoices;
