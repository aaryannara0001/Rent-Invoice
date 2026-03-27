'use client';

import React, { useState, useEffect } from 'react';
import { AppContext, AppContextType, Invoice, Quote, Customer, RentalItem, MasterItem } from './types';

const STORAGE_KEYS = {
	INVOICES: 'rental_invoices',
	QUOTES: 'rental_quotes',
	CUSTOMERS: 'rental_customers',
	MASTER_ITEMS: 'rental_master_items',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [quotes, setQuotes] = useState<Quote[]>([]);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [masterItems, setMasterItems] = useState<MasterItem[]>([]);

	// Load from localStorage on mount
	useEffect(() => {
		const savedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
		const savedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
		const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
		const savedMasterItems = localStorage.getItem(STORAGE_KEYS.MASTER_ITEMS);
 
		if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
		if (savedQuotes) setQuotes(JSON.parse(savedQuotes));
		if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
		if (savedMasterItems) setMasterItems(JSON.parse(savedMasterItems));
	}, []);

	// Save invoices to localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
	}, [invoices]);

	// Save quotes to localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
	}, [quotes]);

	// Save customers to localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
	}, [customers]);
 
	// Save master items to localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEYS.MASTER_ITEMS, JSON.stringify(masterItems));
	}, [masterItems]);

	// Invoice operations
	const addInvoice = (invoice: Invoice) => {
		setInvoices([...invoices, invoice]);
	};

	const updateInvoice = (id: string, updatedInvoice: Invoice) => {
		setInvoices(invoices.map(inv => (inv.id === id ? updatedInvoice : inv)));
	};

	const deleteInvoice = (id: string) => {
		setInvoices(invoices.filter(inv => inv.id !== id));
	};

	const getInvoice = (id: string) => {
		return invoices.find(inv => inv.id === id);
	};

	// Quote operations
	const addQuote = (quote: Quote) => {
		setQuotes([...quotes, quote]);
	};

	const updateQuote = (id: string, updatedQuote: Quote) => {
		setQuotes(quotes.map(q => (q.id === id ? updatedQuote : q)));
	};

	const deleteQuote = (id: string) => {
		setQuotes(quotes.filter(q => q.id !== id));
	};

	const getQuote = (id: string) => {
		return quotes.find(q => q.id === id);
	};

	const convertQuoteToInvoice = (quoteId: string) => {
		const quote = getQuote(quoteId);
		if (!quote) return null;

		const invoiceId = `INV-${Date.now()}`;
		const invoice: Invoice = {
			id: invoiceId,
			customerId: quote.customerId,
			customerName: quote.customerName,
			customerPhone: quote.customerPhone,
			customerEmail: quote.customerEmail,
			customerAddress: quote.customerAddress,
			customerGstin: quote.customerGstin,
			invoiceNumber: invoiceId,
			invoiceDate: new Date().toISOString().split('T')[0],
			dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			items: quote.items,
			subtotal: quote.subtotal,
			totalDiscount: quote.totalDiscount,
			totalGST: quote.totalGST,
			grandTotal: quote.grandTotal,
			status: 'pending',
			eventName: quote.eventName,
			eventLocation: quote.eventLocation,
			notes: quote.notes,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			quoteId,
		};

		addInvoice(invoice);

		// Update quote status
		const updatedQuote = { ...quote, status: 'converted' as const, convertedInvoiceId: invoiceId, updatedAt: new Date().toISOString() };
		updateQuote(quoteId, updatedQuote);

		return invoice;
	};

	// Customer operations
	const addCustomer = (customer: Customer) => {
		setCustomers([...customers, customer]);
	};

	const updateCustomer = (id: string, updatedCustomer: Customer) => {
		setCustomers(customers.map(cust => (cust.id === id ? updatedCustomer : cust)));
	};

	const deleteCustomer = (id: string) => {
		setCustomers(customers.filter(cust => cust.id !== id));
	};

	const getCustomer = (id: string) => {
		return customers.find(cust => cust.id === id);
	};
 
	// Master Item operations
	const addMasterItem = (item: MasterItem) => {
		setMasterItems([...masterItems, item]);
	};
 
	const updateMasterItem = (id: string, updatedItem: MasterItem) => {
		setMasterItems(masterItems.map(item => (item.id === id ? updatedItem : item)));
	};
 
	const deleteMasterItem = (id: string) => {
		setMasterItems(masterItems.filter(item => item.id !== id));
	};
 
	const getMasterItem = (id: string) => {
		return masterItems.find(item => item.id === id);
	};

	// Statistics
	const getTotalRevenue = () => {
		return invoices
			.filter(inv => inv.status === 'paid')
			.reduce((total, inv) => total + inv.grandTotal, 0);
	};

	const getTotalPendingAmount = () => {
		return invoices
			.filter(inv => inv.status === 'pending' || inv.status === 'sent')
			.reduce((total, inv) => total + inv.grandTotal, 0);
	};

	const getTotalPaidAmount = () => {
		return getTotalRevenue();
	};

	const getInvoiceStats = () => {
		return {
			total: invoices.length,
			paid: invoices.filter(inv => inv.status === 'paid').length,
			pending: invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').length,
			overdue: invoices.filter(inv => inv.status === 'overdue').length,
			draft: invoices.filter(inv => inv.status === 'draft').length,
		};
	};

	const getQuoteStats = () => {
		return {
			total: quotes.length,
			accepted: quotes.filter(q => q.status === 'accepted').length,
			rejected: quotes.filter(q => q.status === 'rejected').length,
			converted: quotes.filter(q => q.status === 'converted').length,
		};
	};

	const getCustomerInvoices = (customerId: string) => {
		return invoices.filter(inv => inv.customerId === customerId);
	};

	const getCustomerRevenue = (customerId: string) => {
		return invoices
			.filter(inv => inv.customerId === customerId && inv.status === 'paid')
			.reduce((total, inv) => total + inv.grandTotal, 0);
	};

	const value: AppContextType = {
		invoices,
		addInvoice,
		updateInvoice,
		deleteInvoice,
		getInvoice,
		quotes,
		addQuote,
		updateQuote,
		deleteQuote,
		getQuote,
		convertQuoteToInvoice,
		customers,
		addCustomer,
		updateCustomer,
		deleteCustomer,
		getCustomer,
		getTotalRevenue,
		getTotalPendingAmount,
		getTotalPaidAmount,
		getInvoiceStats,
		getQuoteStats,
		getCustomerInvoices,
		getCustomerRevenue,
		masterItems,
		addMasterItem,
		updateMasterItem,
		deleteMasterItem,
		getMasterItem,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Remove the useApp hook from here - it will be in useApp.ts
