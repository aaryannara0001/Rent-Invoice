import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Save, Trash2, Download, Eye, X, Package, Search, Check, ChevronsUpDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/utils';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { toast } from 'sonner';
import { Invoice, RentalItem } from '@/context/types';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import InvoicePreview from '@/components/InvoicePreview';

const CreateInvoice = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { invoices, customers, addInvoice, updateInvoice, getInvoice, addCustomer, masterItems } = useApp();
	const [showPreview, setShowPreview] = useState(false);
	const [showNewCustomer, setShowNewCustomer] = useState(false);
	const [newCustomer, setNewCustomer] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
		gstin: '',
	});

	const [invoiceData, setInvoiceData] = useState<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>({
		customerId: '',
		customerName: '',
		customerPhone: '',
		customerEmail: '',
		customerAddress: '',
		customerGstin: '',
		invoiceNumber: `INV-${Date.now()}`,
		invoiceDate: new Date().toISOString().split('T')[0],
		dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
 
	const [showItemSelector, setShowItemSelector] = useState(false);
	const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
	const [itemSearchTerm, setItemSearchTerm] = useState('');

	// Load invoice if editing
	useEffect(() => {
		if (id) {
			const existingInvoice = getInvoice(id);
			if (existingInvoice) {
				const { id: _, createdAt, updatedAt, ...rest } = existingInvoice;
				setInvoiceData(rest);
			}
		}
	}, [id, getInvoice]);

	// Calculate totals
	useEffect(() => {
		const subtotal = invoiceData.items.reduce((sum, item) => {
			const itemSubtotal = item.quantity * item.days * item.pricePerDay;
			return sum + itemSubtotal;
		}, 0);

		let totalDiscount = 0;
		invoiceData.items.forEach(item => {
			const itemSubtotal = item.quantity * item.days * item.pricePerDay;
			if (item.discountType === 'amount') {
				totalDiscount += item.discount;
			} else {
				totalDiscount += (itemSubtotal * item.discount) / 100;
			}
		});

		const subtotalAfterDiscount = subtotal - totalDiscount;
		const totalGST = invoiceData.items.reduce((sum, item) => {
			const itemSubtotal = item.quantity * item.days * item.pricePerDay;
			const itemAfterDiscount = item.discountType === 'amount'
				? itemSubtotal - item.discount
				: itemSubtotal - (itemSubtotal * item.discount) / 100;
			return sum + (itemAfterDiscount * item.gstPercent) / 100;
		}, 0);

		const grandTotal = subtotalAfterDiscount + totalGST;

		setInvoiceData(prev => ({
			...prev,
			subtotal: Math.max(0, subtotalAfterDiscount),
			totalDiscount: Math.max(0, totalDiscount),
			totalGST: Math.max(0, totalGST),
			grandTotal: Math.max(0, grandTotal),
		}));
	}, [invoiceData.items]);

	const updateItem = (itemId: string, field: keyof RentalItem, value: string | number | boolean) => {
		setInvoiceData(prev => ({
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
		setInvoiceData(prev => ({
			...prev,
			items: [...prev.items, newItem],
		}));
	};

	const removeItem = (itemId: string) => {
		if (invoiceData.items.length > 1) {
			setInvoiceData(prev => ({
				...prev,
				items: prev.items.filter(item => item.id !== itemId),
			}));
		} else {
			toast.error('Invoice must have at least one item');
		}
	};

	const updateCustomerField = (field: string, value: string) => {
		setInvoiceData(prev => ({
			...prev,
			[`customer${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
		}));
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
		
		setInvoiceData(prev => ({
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
 
	const handleSelectItemFromCatalog = (masterItem: any, indexOverride?: number) => {
		const targetIndex = indexOverride !== undefined ? indexOverride : activeItemIndex;
		if (targetIndex !== null) {
			setInvoiceData(prev => ({
				...prev,
				items: prev.items.map((item, index) => {
					if (index === targetIndex) {
						const updated = {
							...item,
							itemName: masterItem.name,
							description: masterItem.description,
							pricePerDay: masterItem.pricePerDay,
							gstPercent: masterItem.gstPercent,
						};
						
						// Recalculate item total
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
			setShowItemSelector(false);
			setActiveItemIndex(null);
			toast.success(`Selected ${masterItem.name}`);
		}
	};

	const validateForm = () => {
		if (!invoiceData.customerId) {
			toast.error('Please select a customer');
			return false;
		}
		
		if (!invoiceData.invoiceNumber.trim()) {
			toast.error('Invoice number is required');
			return false;
		}

		if (invoiceData.items.length === 0) {
			toast.error('Add at least one item');
			return false;
		}

		for (let i = 0; i < invoiceData.items.length; i++) {
			const item = invoiceData.items[i];
			if (!item.itemName.trim()) {
				toast.error(`Item ${i + 1} name is required`);
				return false;
			}
			if (item.quantity <= 0) {
				toast.error(`Item ${i + 1} quantity must be greater than 0`);
				return false;
			}
			if (item.pricePerDay < 0) {
				toast.error(`Item ${i + 1} price cannot be negative`);
				return false;
			}
		}

		return true;
	};

	const handleSave = () => {
		if (!validateForm()) return;

		const now = new Date().toISOString();
		if (id) {
			updateInvoice(id, {
				...invoiceData,
				id,
				createdAt: getInvoice(id)?.createdAt || now,
				updatedAt: now,
			});
			toast.success('Invoice updated successfully');
		} else {
			addInvoice({
				...invoiceData,
				id: invoiceData.invoiceNumber,
				createdAt: now,
				updatedAt: now,
			});
			toast.success('Invoice created successfully');
		}
		navigate('/invoices');
	};

	return (
		<MainLayout>
			<div className="p-6 max-w-6xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" onClick={() => navigate('/invoices')} className="text-gray-400 hover:text-gray-300">
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="text-3xl font-bold text-white">{id ? 'Edit Invoice' : 'Create Invoice'}</h1>
					</div>
					<div className="flex gap-3">
						{id && (
							<>
								<Button
									variant="outline"
									className="bg-[#1F2937] border-[#1F2937] text-gray-300 hover:bg-[#374151]"
									onClick={() => setShowPreview(true)}
								>
									<Eye className="h-4 w-4 mr-2" />
									Preview
								</Button>
								<Button
									variant="outline"
									className="bg-green-600 border-green-600 text-white hover:bg-green-700"
									onClick={() => {
										if (validateForm()) {
											generateInvoicePDF(id, invoiceData.customerName || 'Invoice');
										}
									}}
								>
									<Download className="h-4 w-4 mr-2" />
									Download PDF
								</Button>
							</>
						)}
						<Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
							<Save className="h-4 w-4 mr-2" />
							Save Invoice
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
							<Select value={invoiceData.customerId} onValueChange={(customerId) => {
								const customer = customers.find(c => c.id === customerId);
								if (customer) {
									setInvoiceData(prev => ({
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
						</div>							{invoiceData.customerId && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-[#0B0F19] rounded-lg border border-[#1F2937]">
									<div>
										<Label className="text-gray-400 text-sm">Name</Label>
										<p className="text-gray-300">{invoiceData.customerName}</p>
									</div>
									<div>
										<Label className="text-gray-400 text-sm">Phone</Label>
										<p className="text-gray-300">{invoiceData.customerPhone}</p>
									</div>
									<div>
										<Label className="text-gray-400 text-sm">Email</Label>
										<p className="text-gray-300">{invoiceData.customerEmail}</p>
									</div>
									<div>
										<Label className="text-gray-400 text-sm">GSTIN</Label>
										<p className="text-gray-300">{invoiceData.customerGstin}</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Invoice Details */}
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardHeader>
							<CardTitle className="text-white">Invoice Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label className="text-gray-300">Invoice Number</Label>
									<Input
										value={invoiceData.invoiceNumber}
										onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
										className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
									/>
								</div>
								<div>
									<Label className="text-gray-300">Invoice Date</Label>
									<Input
										type="date"
										value={invoiceData.invoiceDate}
										onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
										className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
									/>
								</div>
								<div>
									<Label className="text-gray-300">Due Date</Label>
									<Input
										type="date"
										value={invoiceData.dueDate}
										onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
										className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
									/>
								</div>
								<div>
									<Label className="text-gray-300">Status</Label>
									<Select value={invoiceData.status} onValueChange={(status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue') => setInvoiceData(prev => ({ ...prev, status }))}>
										<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-gray-300">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-[#111827] border-[#1F2937]">
											<SelectItem value="draft" className="text-gray-300">Draft</SelectItem>
											<SelectItem value="sent" className="text-gray-300">Sent</SelectItem>
											<SelectItem value="pending" className="text-gray-300">Pending</SelectItem>
											<SelectItem value="paid" className="text-gray-300">Paid</SelectItem>
											<SelectItem value="overdue" className="text-gray-300">Overdue</SelectItem>
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
							{invoiceData.items.map((item, index) => (
								<div key={item.id} className="border border-[#1F2937] bg-[#0B0F19]/30 rounded-lg p-4 space-y-4 hover:border-blue-500/30 transition-colors group">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
												{index + 1}
											</div>
											<h4 className="text-white font-medium">Item Details</h4>
										</div>
										{invoiceData.items.length > 1 && (
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
											<div className="flex items-center justify-between mb-2">
												<Label className="text-gray-300">Item Name</Label>
												<Button 
													variant="ghost" 
													size="sm" 
													className="h-6 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs px-2"
													onClick={() => {
														setActiveItemIndex(index);
														setShowItemSelector(true);
													}}
												>
													<Search className="h-3 w-3 mr-1" />
													Search Catalog
												</Button>
											</div>
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														className={cn(
															"w-full justify-between bg-[#0B0F19] border-[#1F2937] text-gray-300 font-normal hover:bg-[#0B0F19] hover:text-gray-300",
															!item.itemName && "text-gray-500"
														)}
													>
														{item.itemName || "Select or type item..."}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-[300px] p-0 bg-[#111827] border-[#1F2937]">
													<Command className="bg-transparent">
														<CommandInput 
															placeholder="Search catalog..." 
															className="text-gray-300"
															onValueChange={(val) => {
																// Allow typing custom name
																if (!masterItems.some(m => m.name === val)) {
																	updateItem(item.id, 'itemName', val);
																}
															}}
														/>
														<CommandList>
															<CommandEmpty>No item found. Type to add custom.</CommandEmpty>
															<CommandGroup>
																{masterItems.map((mItem) => (
																	<CommandItem
																		key={mItem.id}
																		value={mItem.name}
																		onSelect={(currentValue) => {
																			const selected = masterItems.find(m => m.name === currentValue);
																			if (selected) {
																				handleSelectItemFromCatalog(selected, index);
																			}
																		}}
																		className="text-gray-300 hover:bg-[#1F2937] cursor-pointer"
																	>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				item.itemName === mItem.name ? "opacity-100" : "opacity-0"
																			)}
																		/>
																		<div className="flex flex-col">
																			<span>{mItem.name}</span>
																			<span className="text-[10px] text-gray-500">₹{mItem.pricePerDay}/day - {mItem.category}</span>
																		</div>
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
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
											<Select 
												value={item.quantity.toString()} 
												onValueChange={(val) => updateItem(item.id, 'quantity', parseInt(val) || 1)}
											>
												<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-gray-300">
													<SelectValue />
												</SelectTrigger>
												<SelectContent className="bg-[#111827] border-[#1F2937] max-h-[200px]">
													{[...Array(100)].map((_, i) => (
														<SelectItem key={i+1} value={(i+1).toString()} className="text-gray-300">
															{i+1}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label className="text-gray-300">Days</Label>
											<Select 
												value={item.days.toString()} 
												onValueChange={(val) => updateItem(item.id, 'days', parseInt(val) || 1)}
											>
												<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-gray-300">
													<SelectValue />
												</SelectTrigger>
												<SelectContent className="bg-[#111827] border-[#1F2937] max-h-[200px]">
													{[...Array(100)].map((_, i) => (
														<SelectItem key={i+1} value={(i+1).toString()} className="text-gray-300">
															{i+1}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
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
							<CardTitle className="text-white">Invoice Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-gray-300">
								<span>Subtotal:</span>
								<span>₹{invoiceData.subtotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-gray-300">
								<span>Total Discount:</span>
								<span>-₹{invoiceData.totalDiscount.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-gray-300">
								<span>Total GST:</span>
								<span>₹{invoiceData.totalGST.toFixed(2)}</span>
							</div>
							<div className="border-t border-[#1F2937] pt-3 flex justify-between text-lg font-semibold text-white">
								<span>Grand Total:</span>
								<span>₹{invoiceData.grandTotal.toFixed(2)}</span>
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
								value={invoiceData.notes}
								onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300"
								placeholder="Add any additional notes..."
								rows={4}
							/>
						</CardContent>
					</Card>

					{/* Actions */}
					<div className="flex justify-end gap-4">
						<Button variant="outline" onClick={() => navigate('/invoices')} className="border-[#1F2937] text-gray-300 hover:bg-[#1F2937]">
							Cancel
						</Button>
						<Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
							<Save className="h-4 w-4 mr-2" />
							{id ? 'Update Invoice' : 'Create Invoice'}
						</Button>
					</div>
				</div>

			{/* Hidden Invoice Preview for PDF - Using absolute positioning instead of hidden class to allow capture */}
			<div 
				className="absolute opacity-0 pointer-events-none" 
				style={{ left: '-9999px', top: '-9999px', width: '210mm' }}
			>
				<InvoicePreview invoice={invoiceData} id={id || 'new'} />
			</div>

			{/* Preview Modal */}
			<Dialog open={showPreview} onOpenChange={setShowPreview}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#111827] border-[#1F2937]">
					<DialogHeader className="sticky top-0 bg-[#111827] z-10 pr-10">
						<DialogTitle className="text-white">Invoice Preview</DialogTitle>
					</DialogHeader>
					<div className="mt-4">
						<InvoicePreview invoice={invoiceData} id={id || 'new'} />
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
 
			{/* Item Catalog Selector Dialog */}
			<Dialog open={showItemSelector} onOpenChange={setShowItemSelector}>
				<DialogContent className="bg-[#111827] border-[#1F2937] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
					<DialogHeader className="p-6 pb-0">
						<DialogTitle className="text-white">Select Item from Catalog</DialogTitle>
					</DialogHeader>
					
					<div className="p-6 flex-1 overflow-y-auto space-y-4">
						<div className="relative mb-4">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Search catalog items..."
								value={itemSearchTerm}
								onChange={(e) => setItemSearchTerm(e.target.value)}
								className="pl-10 bg-[#0B0F19] border-[#1F2937] text-gray-300"
							/>
						</div>
						
						{masterItems.length === 0 ? (
							<div className="text-center py-8">
								<Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
								<p className="text-gray-400 mb-4">Your item catalog is empty.</p>
								<Button 
									onClick={() => navigate('/items')}
									className="bg-blue-600 hover:bg-blue-700"
								>
									Manage Catalog
								</Button>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-3">
								{masterItems
									.filter(m => 
										m.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
										m.category?.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
										m.description.toLowerCase().includes(itemSearchTerm.toLowerCase())
									)
									.map(mItem => (
									<button
										key={mItem.id}
										onClick={() => handleSelectItemFromCatalog(mItem)}
										className="flex flex-col p-4 bg-[#0B0F19] border border-[#1F2937] rounded-lg hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left group"
									>
										<div className="flex justify-between items-start w-full">
											<span className="text-white font-semibold group-hover:text-blue-400">{mItem.name}</span>
											<span className="text-blue-400 font-bold">₹{mItem.pricePerDay.toFixed(2)}/day</span>
										</div>
										<p className="text-gray-400 text-sm mt-1 line-clamp-1">{mItem.description}</p>
										<div className="flex gap-2 mt-2">
											<Badge variant="outline" className="text-[10px] py-0">{mItem.category || 'General'}</Badge>
											<Badge variant="outline" className="text-[10px] py-0">{mItem.gstPercent}% GST</Badge>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
					
					<DialogFooter className="p-6 pt-0">
						<Button variant="outline" onClick={() => setShowItemSelector(false)} className="border-[#1F2937] text-gray-300">
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			</div>
		</MainLayout>
	);
};

export default CreateInvoice;
