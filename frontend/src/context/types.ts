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

export interface AppContextType {
	invoices: Invoice[];
	addInvoice: (invoice: Invoice) => void;
	updateInvoice: (id: string, invoice: Invoice) => void;
	deleteInvoice: (id: string) => void;
	getInvoice: (id: string) => Invoice | undefined;

	quotes: Quote[];
	addQuote: (quote: Quote) => void;
	updateQuote: (id: string, quote: Quote) => void;
	deleteQuote: (id: string) => void;
	getQuote: (id: string) => Quote | undefined;
	convertQuoteToInvoice: (quoteId: string) => Invoice | null;

	customers: Customer[];
	addCustomer: (customer: Customer) => void;
	updateCustomer: (id: string, customer: Customer) => void;
	deleteCustomer: (id: string) => void;
	getCustomer: (id: string) => Customer | undefined;

	getTotalRevenue: () => number;
	getTotalPendingAmount: () => number;
	getTotalPaidAmount: () => number;
	getInvoiceStats: () => { total: number; paid: number; pending: number; overdue: number; draft: number };
	getQuoteStats: () => { total: number; accepted: number; rejected: number; converted: number };
	getCustomerInvoices: (customerId: string) => Invoice[];
	getCustomerRevenue: (customerId: string) => number;

	masterItems: MasterItem[];
	addMasterItem: (item: MasterItem) => void;
	updateMasterItem: (id: string, item: MasterItem) => void;
	deleteMasterItem: (id: string) => void;
	getMasterItem: (id: string) => MasterItem | undefined;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
