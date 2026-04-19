import React, { createContext } from 'react';

export interface RentalItem {
	id: string;
	itemName: string;
	description: string;
	quantity: number;
	days: number;
	pricePerDay: number;
	discount: number;
	discountType: 'amount' | 'percent';
	gstPercent: number;
	total: number;
}

export interface MasterItem {
	id: string;
	name: string;
	description: string;
	pricePerDay: number;
	gstPercent: number;
	category?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaymentMethod {
	id: string;
	type: 'bank' | 'upi';
	label: string;
	bankName?: string;
	accountHolderName?: string;
	accountNumber?: string;
	ifscCode?: string;
	upiId?: string;
	qrCode?: string;
	isDefault: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Invoice {
	id: string;
	customerId: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	customerAddress: string;
	customerGstin: string;
	invoiceNumber: string;
	invoiceDate: string;
	dueDate: string;
	items: RentalItem[];
	subtotal: number;
	totalDiscount: number;
	totalGST: number;
	grandTotal: number;
	status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue';
	eventName?: string;
	eventLocation?: string;
	notes?: string;
	paymentMethodId?: string;
	createdAt: string;
	updatedAt: string;
	quoteId?: string;
}

export interface Quote {
	id: string;
	customerId: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	customerAddress: string;
	customerGstin: string;
	quoteNumber: string;
	quoteDate: string;
	validUntil: string;
	items: RentalItem[];
	subtotal: number;
	totalDiscount: number;
	totalGST: number;
	grandTotal: number;
	status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
	eventName?: string;
	eventLocation?: string;
	notes?: string;
	paymentMethodId?: string;
	createdAt: string;
	updatedAt: string;
	convertedInvoiceId?: string;
}

export interface Customer {
	id: string;
	name: string;
	phone: string;
	email: string;
	address: string;
	gstin: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	email: string;
	name: string;
}

export interface AppContextType {
	user: User | null;
	login: (email: string, pass: string) => Promise<boolean>;
	logout: () => void;
	isAuthenticated: boolean;
	invoices: Invoice[];
	quotes: Quote[];
	customers: Customer[];
	masterItems: MasterItem[];
	paymentMethods: PaymentMethod[];
	addInvoice: (invoice: Invoice) => void;
	updateInvoice: (id: string, invoice: Invoice) => void;
	deleteInvoice: (id: string) => void;
	getInvoice: (id: string) => Invoice | undefined;
	addQuote: (quote: Quote) => void;
	updateQuote: (id: string, quote: Quote) => void;
	deleteQuote: (id: string) => void;
	getQuote: (id: string) => Quote | undefined;
	convertQuoteToInvoice: (quoteId: string) => Invoice | null;
	addCustomer: (customer: Customer) => void;
	updateCustomer: (id: string, customer: Customer) => void;
	deleteCustomer: (id: string) => void;
	getCustomer: (id: string) => Customer | undefined;
	addMasterItem: (item: MasterItem) => void;
	updateMasterItem: (id: string, item: MasterItem) => void;
	deleteMasterItem: (id: string) => void;
	getMasterItem: (id: string) => MasterItem | undefined;
	addPaymentMethod: (method: PaymentMethod) => void;
	updatePaymentMethod: (id: string, method: PaymentMethod) => void;
	deletePaymentMethod: (id: string) => void;
	getPaymentMethod: (id: string) => PaymentMethod | undefined;
	setDefaultPaymentMethod: (id: string) => void;
	getTotalRevenue: () => number;
	getTotalPendingAmount: () => number;
	getTotalPaidAmount: () => number;
	getInvoiceStats: () => { total: number; paid: number; pending: number; overdue: number; draft: number };
	getQuoteStats: () => { total: number; accepted: number; rejected: number; converted: number };
	getCustomerInvoices: (customerId: string) => Invoice[];
	getCustomerRevenue: (customerId: string) => number;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
