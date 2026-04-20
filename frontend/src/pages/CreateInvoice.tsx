import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Save, Trash2, Download, Eye, X, Package, Search, Check, ChevronsUpDown } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { toast } from 'sonner';
import { Invoice, RentalItem, MasterItem, Customer } from '@/context/types';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import InvoicePreview from '@/components/InvoicePreview';
import { PaymentSelector } from '@/features/dashboard/components/PaymentSelector';
import { invoiceSchema, customerSchema, InvoiceFormData, CustomerFormData } from '@/schemas';
import { AnimatePresence, motion } from 'framer-motion';

const CreateInvoice = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const isViewMode = searchParams.get('view') === 'true';
	const { invoices, customers, addCustomer, masterItems, addInvoice, updateInvoice, getInvoice, getCustomer, paymentMethods } = useApp();

	const [showPreview, setShowPreview] = useState(false);
	const [showNewCustomer, setShowNewCustomer] = useState(false);
	const [showItemSelector, setShowItemSelector] = useState(false);
	const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
	const [itemSearchTerm, setItemSearchTerm] = useState('');

	const form = useForm<InvoiceFormData>({
		resolver: zodResolver(invoiceSchema),
		mode: 'onChange',
		defaultValues: {
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
			paymentMethodId: '',
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'items',
	});

	const watchedItems = form.watch('items');
	const watchedCustomerId = form.watch('customerId');

	// Load invoice if editing
	useEffect(() => {
		if (id) {
			const existingInvoice = getInvoice(id);
			if (existingInvoice) {
				const { id: _, createdAt, updatedAt, ...rest } = existingInvoice;
				form.reset(rest as any);
			}
		}
	}, [id, getInvoice, form]);

	// Set default payment method for new invoices
	useEffect(() => {
		if (!id && paymentMethods.length > 0 && !form.getValues('paymentMethodId')) {
			const defaultMethod = paymentMethods.find(m => m.isDefault) || paymentMethods[0];
			if (defaultMethod) {
				form.setValue('paymentMethodId', defaultMethod.id);
			}
		}
	}, [id, paymentMethods, form]);

	// Update customer details when customer is selected
	useEffect(() => {
		if (watchedCustomerId) {
			const customer = customers.find(c => c.id === watchedCustomerId);
			if (customer) {
				form.setValue('customerName', customer.name);
				form.setValue('customerPhone', customer.phone);
				form.setValue('customerEmail', customer.email);
				form.setValue('customerAddress', customer.address);
				form.setValue('customerGstin', customer.gstin || '');
			}
		}
	}, [watchedCustomerId, customers, form]);

	// Calculate totals reactively
	const totals = useMemo(() => {
		let subtotal = 0;
		let totalDiscount = 0;
		let totalGST = 0;

		(watchedItems || []).forEach((item) => {
			const qty = Number(item.quantity) || 0;
			const days = Number(item.days) || 0;
			const price = Number(item.pricePerDay) || 0;
			const itemSubtotal = qty * days * price;
			let discount = Number(item.discount) || 0;
			if (item.discountType === 'percent') {
				discount = (itemSubtotal * discount) / 100;
			}
			const afterDiscount = itemSubtotal - discount;
			const gst = (afterDiscount * (Number(item.gstPercent) || 0)) / 100;
			subtotal += itemSubtotal;
			totalDiscount += discount;
			totalGST += gst;
		});

		const grandTotal = subtotal - totalDiscount + totalGST;
		return { subtotal, totalDiscount, totalGST, grandTotal };
	}, [watchedItems]);

	// Sync totals with form state
	useEffect(() => {
		form.setValue('subtotal', totals.subtotal);
		form.setValue('totalDiscount', totals.totalDiscount);
		form.setValue('totalGST', totals.totalGST);
		form.setValue('grandTotal', totals.grandTotal);
	}, [totals, form]);

	const customerForm = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			name: '',
			phone: '',
			email: '',
			address: '',
			gstin: '',
		},
	});

	const handleAddCustomer = (data: CustomerFormData) => {
		const customerId = `CUST-${Date.now()}`;
		const now = new Date().toISOString();
		const customerData: Customer = {
			id: customerId,
			name: data.name,
			phone: data.phone,
			email: data.email,
			address: data.address,
			gstin: data.gstin || '',
			createdAt: now,
			updatedAt: now,
		};

		addCustomer(customerData);

		form.setValue('customerId', customerId);
		form.setValue('customerName', data.name);
		form.setValue('customerPhone', data.phone);
		form.setValue('customerEmail', data.email);
		form.setValue('customerAddress', data.address);
		form.setValue('customerGstin', data.gstin || '');

		customerForm.reset();
		setShowNewCustomer(false);
		toast.success('Customer added successfully');
	};

	const handleSelectItemFromCatalog = (masterItem: MasterItem, indexOverride?: number) => {
		const targetIndex = indexOverride !== undefined ? indexOverride : activeItemIndex;
		if (targetIndex !== null) {
			form.setValue(`items.${targetIndex}.itemName`, masterItem.name, { shouldDirty: true, shouldTouch: true });
			form.setValue(`items.${targetIndex}.description`, masterItem.description || '', { shouldDirty: true, shouldTouch: true });
			form.setValue(`items.${targetIndex}.pricePerDay`, masterItem.pricePerDay, { shouldDirty: true, shouldTouch: true });
			form.setValue(`items.${targetIndex}.gstPercent`, masterItem.gstPercent, { shouldDirty: true, shouldTouch: true });
			
			setShowItemSelector(false);
			setActiveItemIndex(null);
			toast.success(`Selected ${masterItem.name}`);
		}
	};

	const addItem = () => {
		append({
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
		});
	};

	const removeItem = (index: number) => {
		if (fields.length > 1) {
			remove(index);
		}
	};

	const onSubmit = (data: InvoiceFormData) => {
		const now = new Date().toISOString();
		const invoiceData: Invoice = {
			id: id || data.invoiceNumber,
			customerId: data.customerId,
			customerName: data.customerName,
			customerPhone: data.customerPhone,
			customerEmail: data.customerEmail,
			customerAddress: data.customerAddress,
			customerGstin: data.customerGstin || '',
			invoiceNumber: data.invoiceNumber,
			invoiceDate: data.invoiceDate,
			dueDate: data.dueDate,
			items: data.items as RentalItem[],
			subtotal: data.subtotal,
			totalDiscount: data.totalDiscount,
			totalGST: data.totalGST,
			grandTotal: data.grandTotal,
			status: data.status as any,
			eventName: data.eventName || '',
			eventLocation: data.eventLocation || '',
			notes: data.notes || '',
			paymentMethodId: data.paymentMethodId || '',
			createdAt: id ? (getInvoice(id)?.createdAt || now) : now,
			updatedAt: now,
		};

		if (id) {
			updateInvoice(id, invoiceData);
			toast.success('Invoice updated successfully');
		} else {
			addInvoice(invoiceData);
			toast.success('Invoice created successfully');
		}
		navigate('/invoices');
	};

	const filteredMasterItems = masterItems.filter(item =>
		item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
		item.description?.toLowerCase().includes(itemSearchTerm.toLowerCase())
	);

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-2 sm:gap-4">
						<Button variant="ghost" onClick={() => navigate('/invoices')} className="text-gray-400 hover:text-gray-300">
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="text-2xl sm:text-3xl font-bold text-white">{id ? (isViewMode ? 'Invoice Details' : 'Edit Invoice') : 'Create Invoice'}</h1>
					</div>
					<div className="flex flex-wrap gap-2 sm:gap-3">
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
							onClick={() => {
								const data = form.getValues();
								generateInvoicePDF(id || 'preview', data.customerName || 'Invoice');
							}}
						>
							<Download className="h-4 w-4 mr-2" />
							Download PDF
						</Button>
					</div>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Customer Details */}
						<Card className="bg-glass border-white/5 backdrop-blur-2xl glow-border">
							<CardHeader>
								<CardTitle className="text-white flex items-center gap-2">
									<div className="h-8 w-1 bg-primary rounded-full" />
									Customer Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-2 mb-2">
									<FormLabel className="text-gray-300">Customer</FormLabel>
									{!isViewMode && (
										<Button
											type="button"
											size="sm"
											className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
											onClick={() => setShowNewCustomer(true)}
										>
											<Plus className="h-4 w-4 mr-1" />
											New Customer
										</Button>
									)}
								</div>
								<FormField
									control={form.control}
									name="customerId"
									render={({ field }) => (
										<FormItem>
											<Select onValueChange={field.onChange} value={field.value} disabled={isViewMode}>
												<FormControl>
													<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-white">
														<SelectValue placeholder="Select a customer" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="bg-[#111827] border-[#1F2937]">
													{customers.map((customer) => (
														<SelectItem key={customer.id} value={customer.id} className="text-white hover:bg-[#1F2937]">
															{customer.name} - {customer.phone}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="customerName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-300">Name</FormLabel>
												<FormControl>
													<Input {...field} className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="customerPhone"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-300">Phone</FormLabel>
												<FormControl>
													<Input {...field} className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Invoice Details */}
						<Card className="bg-glass border-white/5 backdrop-blur-2xl glow-border">
							<CardHeader>
								<CardTitle className="text-white flex items-center gap-2">
									<div className="h-8 w-1 bg-neon-blue rounded-full" />
									Invoice Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="invoiceNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-300">Invoice Number</FormLabel>
												<FormControl>
													<Input {...field} className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="invoiceDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-300">Invoice Date</FormLabel>
												<FormControl>
													<Input {...field} type="date" className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="dueDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-300">Due Date</FormLabel>
												<FormControl>
													<Input {...field} type="date" className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="status"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-300">Status</FormLabel>
												<Select onValueChange={field.onChange} value={field.value} disabled={isViewMode}>
													<FormControl>
														<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-white">
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent className="bg-[#111827] border-[#1F2937]">
														<SelectItem value="draft" className="text-white">Draft</SelectItem>
														<SelectItem value="sent" className="text-white">Sent</SelectItem>
														<SelectItem value="pending" className="text-white">Pending</SelectItem>
														<SelectItem value="paid" className="text-white">Paid</SelectItem>
														<SelectItem value="overdue" className="text-white">Overdue</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div>
										<Label className="text-gray-300">Payment Method</Label>
										<PaymentSelector
											selectedId={form.watch('paymentMethodId')}
											onChange={(id) => form.setValue('paymentMethodId', id)}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Items */}
						<Card className="bg-glass border-white/5 backdrop-blur-2xl glow-border">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-white flex items-center gap-2">
										<div className="h-8 w-1 bg-neon-purple rounded-full" />
										Items
									</CardTitle>
									{!isViewMode && (
										<Button type="button" onClick={addItem} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
											<Plus className="h-4 w-4 mr-2" />
											Add Item
										</Button>
									)}
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{fields.map((field, index) => (
										<div key={field.id} className="border border-[#1F2937] rounded-lg p-4 space-y-4">
											<div className="flex items-center justify-between">
												<h4 className="text-white font-semibold">Item {index + 1}</h4>
												{!isViewMode && fields.length > 1 && (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => removeItem(index)}
														className="text-red-400 hover:text-red-300"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												)}
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
												<div className="md:col-span-1 lg:col-span-1">
													<FormField
														control={form.control}
														name={`items.${index}.itemName`}
														render={({ field }) => (
															<FormItem>
																<FormLabel className="text-gray-300">Item Name</FormLabel>
																<div className="flex gap-1">
																	<FormControl>
																		<Input {...field} className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} />
																	</FormControl>
																	{!isViewMode && (
																		<Button
																			type="button"
																			variant="outline"
																			size="sm"
																			onClick={() => {
																				setActiveItemIndex(index);
																				setShowItemSelector(true);
																			}}
																			className="border-[#1F2937] text-gray-300 px-2"
																		>
																			<Search className="h-4 w-4" />
																		</Button>
																	)}
																</div>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
												<FormField
													control={form.control}
													name={`items.${index}.quantity`}
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-gray-300">Qty</FormLabel>
															<FormControl>
																<Input {...field} type="number" min="1" className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name={`items.${index}.days`}
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-gray-300">Days</FormLabel>
															<FormControl>
																<Input {...field} type="number" min="1" className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name={`items.${index}.pricePerDay`}
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-gray-300">Price/Day</FormLabel>
															<FormControl>
																<Input {...field} type="number" min="0" step="0.01" className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<div className="flex gap-2">
													<div className="flex-1">
														<FormField
															control={form.control}
															name={`items.${index}.discount`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-gray-300">Discount</FormLabel>
																	<FormControl>
																		<Input {...field} type="number" min="0" step="0.01" className="bg-[#0B0F19] border-[#1F2937] text-white" disabled={isViewMode} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
													<div className="w-16">
														<FormField
															control={form.control}
															name={`items.${index}.discountType`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-gray-300">Type</FormLabel>
																	<Select onValueChange={field.onChange} value={field.value} disabled={isViewMode}>
																		<FormControl>
																			<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-white px-2">
																				<SelectValue />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent className="bg-[#111827] border-[#1F2937]">
																			<SelectItem value="amount" className="text-white">₹</SelectItem>
																			<SelectItem value="percent" className="text-white">%</SelectItem>
																		</SelectContent>
																	</Select>
																</FormItem>
															)}
														/>
													</div>
												</div>
												<FormField
													control={form.control}
													name={`items.${index}.gstPercent`}
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-gray-300">GST %</FormLabel>
															<Select onValueChange={val => field.onChange(parseInt(val))} value={field.value.toString()} disabled={isViewMode}>
																<FormControl>
																	<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-white">
																		<SelectValue />
																	</SelectTrigger>
																</FormControl>
																<SelectContent className="bg-[#111827] border-[#1F2937]">
																	<SelectItem value="0" className="text-white">0%</SelectItem>
																	<SelectItem value="5" className="text-white">5%</SelectItem>
																	<SelectItem value="12" className="text-white">12%</SelectItem>
																	<SelectItem value="18" className="text-white">18%</SelectItem>
																	<SelectItem value="28" className="text-white">28%</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Summary */}
						<Card className="bg-glass border-white/5 backdrop-blur-2xl glow-border overflow-hidden">
							<div className="h-1 w-full bg-gradient-to-r from-primary via-neon-purple to-neon-pink" />
							<CardHeader>
								<CardTitle className="text-white">Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="flex justify-between text-gray-400">
										<span>Subtotal:</span>
										<span>₹{form.watch('subtotal').toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-red-400">
										<span>Total Discount:</span>
										<span>- ₹{form.watch('totalDiscount').toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-blue-400">
										<span>Total GST:</span>
										<span>+ ₹{form.watch('totalGST').toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-white font-bold text-xl border-t border-white/10 pt-4 mt-2">
										<span>Grand Total:</span>
										<span className="text-primary tracking-tight">₹{form.watch('grandTotal').toFixed(2)}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Actions */}
						<div className="flex justify-end gap-3 pb-8">
							{!isViewMode && (
								<Button
									type="submit"
									disabled={!form.formState.isValid}
									className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
								>
									<Save className="h-4 w-4 mr-2" />
									Save Invoice
								</Button>
							)}
						</div>
					</form>
				</Form>

				{/* New Customer Dialog */}
				<Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
					<DialogContent className="bg-[#111827] border-[#1F2937] text-white">
						<DialogHeader>
							<DialogTitle>Add New Customer</DialogTitle>
						</DialogHeader>
						<Form {...customerForm}>
							<form onSubmit={customerForm.handleSubmit(handleAddCustomer)} className="space-y-4">
								<FormField
									control={customerForm.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input {...field} className="bg-[#0B0F19] border-[#1F2937] text-white" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={customerForm.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Phone</FormLabel>
											<FormControl>
												<Input {...field} className="bg-[#0B0F19] border-[#1F2937] text-white" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={customerForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input {...field} type="email" className="bg-[#0B0F19] border-[#1F2937] text-white" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={customerForm.control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Address</FormLabel>
											<FormControl>
												<Textarea {...field} className="bg-[#0B0F19] border-[#1F2937] text-white" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={customerForm.control}
									name="gstin"
									render={({ field }) => (
										<FormItem>
											<FormLabel>GSTIN (Optional)</FormLabel>
											<FormControl>
												<Input {...field} placeholder="22AAAAA0000A1Z5" className="bg-[#0B0F19] border-[#1F2937] text-white" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => setShowNewCustomer(false)} className="bg-transparent border-[#1F2937] text-white">Cancel</Button>
									<Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Customer</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Item Selector Dialog */}
				<Dialog open={showItemSelector} onOpenChange={setShowItemSelector}>
					<DialogContent className="bg-[#111827] border-[#1F2937] text-white max-w-2xl">
						<DialogHeader>
							<DialogTitle>Select Item from Catalog</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Search items..."
									value={itemSearchTerm}
									onChange={(e) => setItemSearchTerm(e.target.value)}
									className="bg-[#0B0F19] border-[#1F2937] text-white pl-10"
								/>
							</div>
							<div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
								{filteredMasterItems.map((item) => (
									<div
										key={item.id}
										className="p-3 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] cursor-pointer transition-colors flex justify-between items-center group"
										onClick={() => handleSelectItemFromCatalog(item)}
									>
										<div>
											<div className="font-semibold text-white group-hover:text-blue-400 transition-colors">{item.name}</div>
											<div className="text-xs text-gray-500 mt-1">{item.category || 'General'}</div>
										</div>
										<div className="text-sm font-mono text-blue-400">₹{item.pricePerDay}/day</div>
									</div>
								))}
							</div>
						</div>
					</DialogContent>
				</Dialog>

				{/* Hidden Preview for PDF Generation */}
				<div className="fixed -left-[9999px] top-0 pointer-events-none opacity-0">
					<InvoicePreview 
						invoice={form.getValues() as any} 
						id={id || 'preview'} 
					/>
				</div>

				<AnimatePresence>
					{showPreview && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-md overflow-y-auto"
							onClick={() => setShowPreview(false)}
						>
							<motion.div
								initial={{ y: -20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -20, opacity: 0 }}
								className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="sticky top-0 right-0 z-20 flex justify-end p-2 bg-white/80 backdrop-blur-sm border-b">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setShowPreview(false)}
										className="text-gray-400 hover:text-gray-900 transition-colors"
									>
										<X className="h-6 w-6" />
									</Button>
								</div>
								<div className="overflow-y-visible">
									<InvoicePreview invoice={form.getValues() as any} id={id || 'preview'} />
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</MainLayout>
	);
};

export default CreateInvoice;
