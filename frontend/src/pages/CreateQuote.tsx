import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Download, Eye, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { toast } from 'sonner';
import { Quote, RentalItem } from '@/context/types';
import { generateQuotePDF } from '@/lib/pdfGenerator';

const CreateQuote = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { quotes, customers, addQuote, updateQuote, getQuote, addCustomer } = useApp();
	const [showPreview, setShowPreview] = useState(false);
	const [showNewCustomer, setShowNewCustomer] = useState(false);
	const [newCustomer, setNewCustomer] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
		gstin: '',
	});

	const [quoteData, setQuoteData] = useState<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>({
		customerId: '',
		customerName: '',
		customerPhone: '',
		customerEmail: '',
		customerAddress: '',
		customerGstin: '',
		quoteNumber: `QT-${Date.now()}`,
		quoteDate: new Date().toISOString().split('T')[0],
		validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		items: [
			{
				id: '1',
				itemName: '',
				description: '',
				quantity: 1,
				days: 1,
				pricePerDay: 0,
				discount: 0,
				discountType: 'amount',
				gstPercent: 18,
				total: 0,
			},
		],
		subtotal: 0,
		totalDiscount: 0,
		totalGST: 0,
		grandTotal: 0,
		status: 'draft',
		notes: '',
	});

	// Load quote if editing
	useEffect(() => {
		if (id) {
			const existingQuote = getQuote(id);
			if (existingQuote) {
				const { id: _, createdAt, updatedAt, ...rest } = existingQuote;
				setQuoteData(rest);
			}
		}
	}, [id, getQuote]);

	// Calculate totals
	useEffect(() => {
		const subtotal = quoteData.items.reduce((sum, item) => {
			const itemSubtotal = item.quantity * item.days * item.pricePerDay;
			return sum + itemSubtotal;
		}, 0);

		let totalDiscount = 0;
		quoteData.items.forEach(item => {
			const itemSubtotal = item.quantity * item.days * item.pricePerDay;
			if (item.discountType === 'amount') {
				totalDiscount += item.discount;
			} else {
				totalDiscount += (itemSubtotal * item.discount) / 100;
			}
		});

		const subtotalAfterDiscount = subtotal - totalDiscount;
		const totalGST = quoteData.items.reduce((sum, item) => {
			const itemSubtotal = item.quantity * item.days * item.pricePerDay;
			const itemAfterDiscount = item.discountType === 'amount'
				? itemSubtotal - item.discount
				: itemSubtotal - (itemSubtotal * item.discount) / 100;
			return sum + (itemAfterDiscount * item.gstPercent) / 100;
		}, 0);

		const grandTotal = subtotalAfterDiscount + totalGST;

		setQuoteData(prev => ({
			...prev,
			subtotal: Math.max(0, subtotalAfterDiscount),
			totalDiscount: Math.max(0, totalDiscount),
			totalGST: Math.max(0, totalGST),
			grandTotal: Math.max(0, grandTotal),
		}));
	}, [quoteData.items]);

	const updateItem = (itemId: string, field: keyof RentalItem, value: string | number | boolean) => {
		setQuoteData(prev => ({
			...prev,
			items: prev.items.map(item => {
				if (item.id === itemId) {
					const updated = { ...item, [field]: value };

					// Calculate item total
					const itemSubtotal = updated.quantity * updated.days * updated.pricePerDay;
					let discount = updated.discount;
					if (updated.discountType === 'percent') {
						discount = (itemSubtotal * updated.discount) / 100;
					}
					const afterDiscount = itemSubtotal - discount;
					const gst = (afterDiscount * updated.gstPercent) / 100;
					updated.total = afterDiscount + gst;

					return updated;
				}
				return item;
			}),
		}));
	};

	const addItem = () => {
		const newItem: RentalItem = {
			id: Date.now().toString(),
			itemName: '',
			description: '',
			quantity: 1,
			days: 1,
			pricePerDay: 0,
			discount: 0,
			discountType: 'amount',
			gstPercent: 18,
			total: 0,
		};
		setQuoteData(prev => ({
			...prev,
			items: [...prev.items, newItem],
		}));
	};

	const removeItem = (itemId: string) => {
		if (quoteData.items.length > 1) {
			setQuoteData(prev => ({
				...prev,
				items: prev.items.filter(item => item.id !== itemId),
			}));
		} else {
			toast.error('Quote must have at least one item');
		}
	};

	const handleAddNewCustomer = () => {
		if (!newCustomer.name.trim()) {
			toast.error('Please enter customer name');
			return;
		}
		
		const customerId = `CUST-${Date.now()}`;
		const now = new Date().toISOString();
		const customerData = {
			id: customerId,
			...newCustomer,
			createdAt: now,
			updatedAt: now,
		};
		
		addCustomer(customerData);
		
		setQuoteData(prev => ({
			...prev,
			customerId: customerId,
			customerName: newCustomer.name,
			customerPhone: newCustomer.phone,
			customerEmail: newCustomer.email,
			customerAddress: newCustomer.address,
			customerGstin: newCustomer.gstin,
		}));
		
		setNewCustomer({
			name: '',
			phone: '',
			email: '',
			address: '',
			gstin: '',
		});
		setShowNewCustomer(false);
		toast.success('Customer added successfully');
	};

	const handleSave = () => {
		if (!quoteData.customerId) {
			toast.error('Please select a customer');
			return;
		}
		if (quoteData.items.length === 0) {
			toast.error('Add at least one item');
			return;
		}

		const now = new Date().toISOString();
		if (id) {
			updateQuote(id, {
				...quoteData,
				id,
				createdAt: getQuote(id)?.createdAt || now,
				updatedAt: now,
			});
			toast.success('Quote updated successfully');
		} else {
			addQuote({
				...quoteData,
				id: quoteData.quoteNumber,
				createdAt: now,
				updatedAt: now,
			});
			toast.success('Quote created successfully');
		}
		navigate('/quotes');
	};

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-2 sm:gap-4">
						<Button variant="ghost" onClick={() => navigate('/quotes')} className="text-gray-400 hover:text-gray-300">
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="text-2xl sm:text-3xl font-bold text-white">{id ? 'Edit Quote' : 'Create Quote'}</h1>
					</div>
					<div className="flex flex-wrap gap-2 sm:gap-3">
						{id && (
							<>
								<Button
									variant="outline"
									className="bg-[#1F2937] border-[#1F2937] text-gray-300 hover:bg-[#374151] text-sm"
									onClick={() => setShowPreview(true)}
								>
									<Eye className="h-4 w-4 mr-2" />
									Preview
								</Button>
								<Button
									variant="outline"
									className="bg-green-600 border-green-600 text-white hover:bg-green-700 text-sm"
									onClick={() => generateQuotePDF(id, quoteData.customerName || 'Quote')}
								>
									<Download className="h-4 w-4 mr-2" />
									Download PDF
								</Button>
							</>
						)}
						<Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
							<Save className="h-4 w-4 mr-2" />
							Save Quote
						</Button>
					</div>
				</div>

				{/* Form */}
				<div className="space-y-6">
					{/* Customer Selection */}
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardHeader>
							<CardTitle className="text-white">Select Customer</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="flex items-center gap-2 mb-2">
									<Label className="text-gray-300">Customer</Label>
									<Button 
										size="sm" 
										className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
										onClick={() => setShowNewCustomer(true)}
									>
										<Plus className="h-4 w-4 mr-1" />
										New Customer
									</Button>
								</div>
								<Select value={quoteData.customerId} onValueChange={(customerId) => {
									const customer = customers.find(c => c.id === customerId);
									if (customer) {
										setQuoteData(prev => ({
											...prev,
											customerId: customer.id,
											customerName: customer.name,
											customerPhone: customer.phone,
											customerEmail: customer.email,
											customerAddress: customer.address,
											customerGstin: customer.gstin,
										}));
									}
								}}>
									<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-gray-300">
										<SelectValue placeholder="Select a customer..." />
									</SelectTrigger>
									<SelectContent className="bg-[#111827] border-[#1F2937]">
										{customers.map(customer => (
											<SelectItem key={customer.id} value={customer.id} className="text-gray-300">
												{customer.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{quoteData.customerId && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-[#0B0F19] rounded-lg border border-[#1F2937]">
									<div>
										<Label className="text-gray-400 text-sm">Name</Label>
										<p className="text-gray-300">{quoteData.customerName}</p>
									</div>
									<div>
										<Label className="text-gray-400 text-sm">Phone</Label>
										<p className="text-gray-300">{quoteData.customerPhone}</p>
									</div>
									<div>
										<Label className="text-gray-400 text-sm">Email</Label>
										<p className="text-gray-300">{quoteData.customerEmail}</p>
									</div>
									<div>
										<Label className="text-gray-400 text-sm">GSTIN</Label>
										<p className="text-gray-300">{quoteData.customerGstin}</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Quote Details */}
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardHeader>
							<CardTitle className="text-white">Quote Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label className="text-gray-300">Quote Number</Label>
									<Input
										value={quoteData.quoteNumber}
										onChange={(e) => setQuoteData(prev => ({ ...prev, quoteNumber: e.target.value }))}
										className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
									/>
								</div>
								<div>
									<Label className="text-gray-300">Quote Date</Label>
									<Input
										type="date"
										value={quoteData.quoteDate}
										onChange={(e) => setQuoteData(prev => ({ ...prev, quoteDate: e.target.value }))}
										className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
									/>
								</div>
								<div>
									<Label className="text-gray-300">Valid Until</Label>
									<Input
										type="date"
										value={quoteData.validUntil}
										onChange={(e) => setQuoteData(prev => ({ ...prev, validUntil: e.target.value }))}
										className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
									/>
								</div>
								<div>
									<Label className="text-gray-300">Status</Label>
									<Select value={quoteData.status} onValueChange={(status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted') => setQuoteData(prev => ({ ...prev, status }))}>
										<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-gray-300">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-[#111827] border-[#1F2937]">
											<SelectItem value="draft" className="text-gray-300">Draft</SelectItem>
											<SelectItem value="sent" className="text-gray-300">Sent</SelectItem>
											<SelectItem value="accepted" className="text-gray-300">Accepted</SelectItem>
											<SelectItem value="rejected" className="text-gray-300">Rejected</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Items */}
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-white">Rental Items</CardTitle>
							<Button onClick={addItem} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
								<Plus className="h-4 w-4 mr-2" />
								Add Item
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							{quoteData.items.map((item, index) => (
								<div key={item.id} className="border border-[#1F2937] rounded-lg p-4 space-y-4">
									<div className="flex items-center justify-between">
										<h4 className="text-white font-medium">Item {index + 1}</h4>
										{quoteData.items.length > 1 && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => removeItem(item.id)}
												className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										<div>
											<Label className="text-gray-300">Item Name</Label>
											<Input
												value={item.itemName}
												onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
												className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
												placeholder="e.g., Wedding Tent"
											/>
										</div>
										<div>
											<Label className="text-gray-300">Description</Label>
											<Input
												value={item.description}
												onChange={(e) => updateItem(item.id, 'description', e.target.value)}
												className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
											/>
										</div>
										<div>
											<Label className="text-gray-300">Quantity</Label>
											<Input
												type="number"
												value={item.quantity}
												onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
												className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
												min="1"
											/>
										</div>
										<div>
											<Label className="text-gray-300">Days</Label>
											<Input
												type="number"
												value={item.days}
												onChange={(e) => updateItem(item.id, 'days', parseInt(e.target.value) || 1)}
												className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
												min="1"
											/>
										</div>
										<div>
											<Label className="text-gray-300">Price per Day (₹)</Label>
											<Input
												type="number"
												value={item.pricePerDay}
												onChange={(e) => updateItem(item.id, 'pricePerDay', parseFloat(e.target.value) || 0)}
												className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
												min="0"
												step="0.01"
											/>
										</div>
										<div>
											<Label className="text-gray-300">Discount</Label>
											<div className="flex gap-2">
												<Input
													type="number"
													value={item.discount}
													onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
													className="bg-[#0B0F19] border-[#1F2937] text-gray-300 flex-1"
													min="0"
													step="0.01"
												/>
												<Select value={item.discountType} onValueChange={(value: 'amount' | 'percent') => updateItem(item.id, 'discountType', value)}>
													<SelectTrigger className="w-20 bg-[#0B0F19] border-[#1F2937] text-gray-300">
														<SelectValue />
													</SelectTrigger>
													<SelectContent className="bg-[#111827] border-[#1F2937]">
														<SelectItem value="amount" className="text-gray-300">₹</SelectItem>
														<SelectItem value="percent" className="text-gray-300">%</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div>
											<Label className="text-gray-300">GST (%)</Label>
											<Input
												type="number"
												value={item.gstPercent}
												onChange={(e) => updateItem(item.id, 'gstPercent', parseFloat(e.target.value) || 0)}
												className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
												min="0"
												step="0.01"
											/>
										</div>
										<div>
											<Label className="text-gray-300">Total (₹)</Label>
											<Input
												type="number"
												value={item.total.toFixed(2)}
												readOnly
												className="bg-[#1F2937] border-[#1F2937] text-gray-300"
											/>
										</div>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Summary */}
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardHeader>
							<CardTitle className="text-white">Quote Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-gray-300">
								<span>Subtotal:</span>
								<span>₹{quoteData.subtotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-gray-300">
								<span>Total Discount:</span>
								<span>-₹{quoteData.totalDiscount.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-gray-300">
								<span>Total GST:</span>
								<span>₹{quoteData.totalGST.toFixed(2)}</span>
							</div>
							<div className="border-t border-[#1F2937] pt-3 flex justify-between text-lg font-semibold text-white">
								<span>Grand Total:</span>
								<span>₹{quoteData.grandTotal.toFixed(2)}</span>
							</div>
						</CardContent>
					</Card>

					{/* Notes */}
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardHeader>
							<CardTitle className="text-white">Notes</CardTitle>
						</CardHeader>
						<CardContent>
							<Textarea
								value={quoteData.notes}
								onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
								placeholder="Add any additional notes..."
								rows={4}
							/>
						</CardContent>
					</Card>

					{/* Actions */}
					<div className="flex justify-end gap-4">
						<Button variant="outline" onClick={() => navigate('/quotes')} className="border-[#1F2937] text-gray-300 hover:bg-[#1F2937]">
							Cancel
						</Button>
						<Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
							<Save className="h-4 w-4 mr-2" />
							{id ? 'Update Quote' : 'Create Quote'}
						</Button>
					</div>
				</div>

				{/* Hidden Quote Preview for PDF */}
				<div
					id={`quote-${id || 'new'}`}
					style={{ display: 'none' }}
					className="p-12 bg-white text-black"
				>
					<div className="max-w-4xl mx-auto space-y-6">
						{/* Header */}
						<div className="flex justify-between items-start">
							<div>
								<h1 className="text-4xl font-bold">QUOTE</h1>
								<p className="text-gray-600">{quoteData.quoteNumber}</p>
							</div>
							<div className="text-right">
								<p className="font-semibold">Quote Date: {quoteData.quoteDate}</p>
								<p className="font-semibold">Valid Until: {quoteData.validUntil}</p>
							</div>
						</div>

						{/* From To */}
						<div className="grid grid-cols-2 gap-8 py-6 border-t-2 border-b-2">
							<div>
								<p className="font-bold text-lg mb-2">From:</p>
								<p className="text-gray-700">Your Company Name</p>
								<p className="text-gray-700">Company Address</p>
							</div>
							<div>
								<p className="font-bold text-lg mb-2">Quote For:</p>
								<p className="font-semibold">{quoteData.customerName}</p>
								<p className="text-gray-700">{quoteData.customerAddress}</p>
								<p className="text-gray-700">{quoteData.customerEmail}</p>
								<p className="text-gray-700">{quoteData.customerPhone}</p>
								{quoteData.customerGstin && (
									<p className="text-gray-700">GSTIN: {quoteData.customerGstin}</p>
								)}
							</div>
						</div>

						{/* Items Table */}
						<div>
							<table className="w-full border-collapse">
								<thead>
									<tr className="bg-gray-200">
										<th className="border p-2 text-left">Item</th>
										<th className="border p-2 text-center">Qty</th>
										<th className="border p-2 text-center">Days</th>
										<th className="border p-2 text-right">Price/Day</th>
										<th className="border p-2 text-right">Discount</th>
										<th className="border p-2 text-right">GST</th>
										<th className="border p-2 text-right">Total</th>
									</tr>
								</thead>
								<tbody>
									{quoteData.items.map((item, idx) => (
										<tr key={idx} className="border">
											<td className="border p-2">
												<p className="font-semibold">{item.itemName}</p>
												<p className="text-sm text-gray-700">{item.description}</p>
											</td>
											<td className="border p-2 text-center">{item.quantity}</td>
											<td className="border p-2 text-center">{item.days}</td>
											<td className="border p-2 text-right">₹{item.pricePerDay.toFixed(2)}</td>
											<td className="border p-2 text-right">
												₹{item.discountType === 'percent'
													? ((item.quantity * item.days * item.pricePerDay * item.discount) / 100).toFixed(2)
													: item.discount.toFixed(2)}
											</td>
											<td className="border p-2 text-right">
												₹{(
													((item.quantity * item.days * item.pricePerDay -
														(item.discountType === 'percent'
															? (item.quantity * item.days * item.pricePerDay * item.discount) / 100
															: item.discount)) *
														item.gstPercent) /
													100
												).toFixed(2)}
											</td>
											<td className="border p-2 text-right font-semibold">₹{item.total.toFixed(2)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Totals */}
						<div className="flex justify-end">
							<div className="w-64">
								<div className="flex justify-between py-2 border-t-2">
									<span>Subtotal:</span>
									<span>₹{quoteData.subtotal.toFixed(2)}</span>
								</div>
								<div className="flex justify-between py-2">
									<span>Total Discount:</span>
									<span>-₹{quoteData.totalDiscount.toFixed(2)}</span>
								</div>
								<div className="flex justify-between py-2">
									<span>Total GST:</span>
									<span>₹{quoteData.totalGST.toFixed(2)}</span>
								</div>
								<div className="flex justify-between py-2 text-lg font-bold border-t-2 border-b-2">
									<span>Grand Total:</span>
									<span>₹{quoteData.grandTotal.toFixed(2)}</span>
								</div>
							</div>
						</div>

						{/* Notes */}
						{quoteData.notes && (
							<div className="border-t-2 pt-4">
								<p className="font-bold">Notes:</p>
								<p className="text-gray-700 whitespace-pre-wrap">{quoteData.notes}</p>
							</div>
						)}

						{/* Footer */}
						<div className="border-t-2 pt-4 text-center text-sm text-gray-600">
							<p>Thank you for your interest!</p>
						</div>
					</div>
				</div>

				{/* Preview Modal */}
				<Dialog open={showPreview} onOpenChange={setShowPreview}>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#111827] border-[#1F2937]">
						<DialogHeader className="sticky top-0 bg-[#111827] z-10">
							<div className="flex items-center justify-between">
								<DialogTitle className="text-white">Quote Preview</DialogTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowPreview(false)}
									className="text-gray-400 hover:text-gray-300"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</DialogHeader>
						<div className="bg-white text-black rounded-lg p-8 mt-4">
							<div className="max-w-4xl mx-auto space-y-6">
								{/* Header */}
								<div className="flex justify-between items-start">
									<div>
										<h1 className="text-4xl font-bold">QUOTE</h1>
										<p className="text-gray-600">{quoteData.quoteNumber}</p>
									</div>
									<div className="text-right">
										<p className="font-semibold">Quote Date: {quoteData.quoteDate}</p>
										<p className="font-semibold">Valid Until: {quoteData.validUntil}</p>
									</div>
								</div>

								{/* From To */}
								<div className="grid grid-cols-2 gap-8 py-6 border-t-2 border-b-2">
									<div>
										<p className="font-bold text-lg mb-2">From:</p>
										<p className="text-gray-700">Your Company Name</p>
										<p className="text-gray-700">Company Address</p>
									</div>
									<div>
										<p className="font-bold text-lg mb-2">Quote For:</p>
										<p className="font-semibold">{quoteData.customerName}</p>
										<p className="text-gray-700">{quoteData.customerAddress}</p>
										<p className="text-gray-700">{quoteData.customerEmail}</p>
										<p className="text-gray-700">{quoteData.customerPhone}</p>
										{quoteData.customerGstin && (
											<p className="text-gray-700">GSTIN: {quoteData.customerGstin}</p>
										)}
									</div>
								</div>

								{/* Items Table */}
								<div>
									<table className="w-full border-collapse">
										<thead>
											<tr className="bg-gray-200">
												<th className="border p-2 text-left">Item</th>
												<th className="border p-2 text-center">Qty</th>
												<th className="border p-2 text-center">Days</th>
												<th className="border p-2 text-right">Price/Day</th>
												<th className="border p-2 text-right">Discount</th>
												<th className="border p-2 text-right">GST</th>
												<th className="border p-2 text-right">Total</th>
											</tr>
										</thead>
										<tbody>
											{quoteData.items.map((item, idx) => (
												<tr key={idx} className="border">
													<td className="border p-2">
														<p className="font-semibold">{item.itemName}</p>
														<p className="text-sm text-gray-700">{item.description}</p>
													</td>
													<td className="border p-2 text-center">{item.quantity}</td>
													<td className="border p-2 text-center">{item.days}</td>
													<td className="border p-2 text-right">₹{item.pricePerDay.toFixed(2)}</td>
													<td className="border p-2 text-right">
														₹{item.discountType === 'percent'
															? ((item.quantity * item.days * item.pricePerDay * item.discount) / 100).toFixed(2)
															: item.discount.toFixed(2)}
													</td>
													<td className="border p-2 text-right">
														₹{(
															((item.quantity * item.days * item.pricePerDay -
																(item.discountType === 'percent'
																	? (item.quantity * item.days * item.pricePerDay * item.discount) / 100
																	: item.discount)) *
																item.gstPercent) /
															100
														).toFixed(2)}
													</td>
													<td className="border p-2 text-right font-semibold">₹{item.total.toFixed(2)}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Totals */}
								<div className="flex justify-end">
									<div className="w-64">
										<div className="flex justify-between py-2 border-t-2">
											<span>Subtotal:</span>
											<span>₹{quoteData.subtotal.toFixed(2)}</span>
										</div>
										<div className="flex justify-between py-2">
											<span>Total Discount:</span>
											<span>-₹{quoteData.totalDiscount.toFixed(2)}</span>
										</div>
										<div className="flex justify-between py-2">
											<span>Total GST:</span>
											<span>₹{quoteData.totalGST.toFixed(2)}</span>
										</div>
										<div className="flex justify-between py-2 text-lg font-bold border-t-2 border-b-2">
											<span>Grand Total:</span>
											<span>₹{quoteData.grandTotal.toFixed(2)}</span>
										</div>
									</div>
								</div>

								{/* Notes */}
								{quoteData.notes && (
									<div className="border-t-2 pt-4">
										<p className="font-bold">Notes:</p>
										<p className="text-gray-700 whitespace-pre-wrap">{quoteData.notes}</p>
									</div>
								)}

								{/* Footer */}
								<div className="border-t-2 pt-4 text-center text-sm text-gray-600">
									<p>Thank you for your interest!</p>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>

			{/* New Customer Dialog */}
			<Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
				<DialogContent className="bg-[#111827] border-[#1F2937] max-w-md">
					<DialogHeader>
						<DialogTitle className="text-white">Add New Customer</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label className="text-gray-300">Name *</Label>
							<Input
								value={newCustomer.name}
								onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
								placeholder="Customer name"
							/>
						</div>
						<div>
							<Label className="text-gray-300">Phone</Label>
							<Input
								value={newCustomer.phone}
								onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
								placeholder="Phone number"
							/>
						</div>
						<div>
							<Label className="text-gray-300">Email</Label>
							<Input
								value={newCustomer.email}
								onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
								placeholder="Email address"
								type="email"
							/>
						</div>
						<div>
							<Label className="text-gray-300">Address</Label>
							<Textarea
								value={newCustomer.address}
								onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
								placeholder="Street address"
								rows={2}
							/>
						</div>
						<div>
							<Label className="text-gray-300">GSTIN</Label>
							<Input
								value={newCustomer.gstin}
								onChange={(e) => setNewCustomer(prev => ({ ...prev, gstin: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
								placeholder="GSTIN (optional)"
							/>
						</div>
						<div className="flex gap-3 pt-4">
							<Button
								variant="outline"
								onClick={() => setShowNewCustomer(false)}
								className="flex-1 border-[#1F2937] text-gray-300 hover:bg-[#1F2937]"
							>
								Cancel
							</Button>
							<Button
								onClick={handleAddNewCustomer}
								className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
							>
								Add Customer
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			</div>
		</MainLayout>
	);
};

export default CreateQuote;
