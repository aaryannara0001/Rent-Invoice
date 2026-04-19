'use client';

import React, { useState, useEffect } from 'react';
import { AppContext, AppContextType, Invoice, Quote, Customer, MasterItem, PaymentMethod, User } from './types';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000';

const STORAGE_KEYS = {
	INVOICES: 'rental_invoices',
	QUOTES: 'rental_quotes',
	CUSTOMERS: 'rental_customers',
	MASTER_ITEMS: 'rental_master_items',
	PAYMENT_METHODS: 'rental_payment_methods',
	AUTH: 'rental_auth_session',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [quotes, setQuotes] = useState<Quote[]>([]);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [user, setUser] = useState<User | null>(null);

	const isAuthenticated = !!user;

	// Load from Supabase and localStorage on mount
	useEffect(() => {
		const loadData = async () => {
			// Try localStorage first for instant load
			const savedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
			const savedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
			const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
			const savedMasterItems = localStorage.getItem(STORAGE_KEYS.MASTER_ITEMS);
			const savedPaymentMethods = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
			const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);

			if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
			if (savedQuotes) setQuotes(JSON.parse(savedQuotes));
			if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
			if (savedMasterItems) setMasterItems(JSON.parse(savedMasterItems));
			if (savedPaymentMethods) setPaymentMethods(JSON.parse(savedPaymentMethods));
			if (savedAuth) setUser(JSON.parse(savedAuth));

			// Fetch from FastAPI Backend as source of truth
			try {
				const [usersRes, invsRes, qtsRes, custsRes, itemsRes, methodsRes] = await Promise.all([
					fetch(`${API_URL}/auth/me`),
					fetch(`${API_URL}/invoices`),
					fetch(`${API_URL}/quotes`),
					fetch(`${API_URL}/customers`),
					fetch(`${API_URL}/items`),
					fetch(`${API_URL}/payment-methods`),
				]);

				if (usersRes.ok) {
					const userData = await usersRes.json();
					if (userData) setUser(userData);
				}
				if (invsRes.ok) setInvoices(await invsRes.json());
				if (qtsRes.ok) setQuotes(await qtsRes.json());
				if (custsRes.ok) setCustomers(await custsRes.json());
				if (itemsRes.ok) setMasterItems(await itemsRes.json());
				if (methodsRes.ok) setPaymentMethods(await methodsRes.json());
			} catch (error) {
				console.error('Error fetching from Backend:', error);
			}
		};

		loadData();
	}, []);

	// Persistence Effects (Local + Backend)
	useEffect(() => { 
		localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
		const syncInvoices = async () => {
			for (const inv of invoices) {
				await fetch(`${API_URL}/invoices`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: inv.id, data: inv })
				});
			}
		};
		syncInvoices();
	}, [invoices]);

	useEffect(() => { 
		localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes)); 
		const syncQuotes = async () => {
			for (const q of quotes) {
				await fetch(`${API_URL}/quotes`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: q.id, data: q })
				});
			}
		};
		syncQuotes();
	}, [quotes]);

	useEffect(() => { 
		localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); 
		const syncCustomers = async () => {
			for (const c of customers) {
				await fetch(`${API_URL}/customers`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: c.id, data: c })
				});
			}
		};
		syncCustomers();
	}, [customers]);

	useEffect(() => { 
		localStorage.setItem(STORAGE_KEYS.MASTER_ITEMS, JSON.stringify(masterItems)); 
		const syncItems = async () => {
			for (const i of masterItems) {
				await fetch(`${API_URL}/items`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: i.id, data: i })
				});
			}
		};
		syncItems();
	}, [masterItems]);

	useEffect(() => { 
		localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(paymentMethods)); 
		const syncMethods = async () => {
			for (const m of paymentMethods) {
				await fetch(`${API_URL}/payment-methods`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: m.id, data: m })
				});
			}
		};
		syncMethods();
	}, [paymentMethods]);

	useEffect(() => {
		if (user) {
			localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
			fetch(`${API_URL}/auth/profile`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(user)
			});
		}
		else localStorage.removeItem(STORAGE_KEYS.AUTH);
	}, [user]);

	// Auth operations
	const login = async (email: string, pass: string) => {
		try {
			const res = await fetch(`${API_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password: pass })
			});

			if (!res.ok) return false;

			const userProfile = await res.json();
			setUser(userProfile);
			return true;
		} catch (err) {
			console.error('Login error:', err);
		}
		return false;
	};

	const logout = () => {
		setUser(null);
	};

	// Invoice operations
	const addInvoice = (invoice: Invoice) => setInvoices([...invoices, invoice]);
	const updateInvoice = (id: string, updatedInvoice: Invoice) => setInvoices(invoices.map(inv => (inv.id === id ? updatedInvoice : inv)));
	const deleteInvoice = async (id: string) => {
		setInvoices(invoices.filter(inv => inv.id !== id));
		await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
	};
	const getInvoice = (id: string) => invoices.find(inv => inv.id === id);

	// Quote operations
	const addQuote = (quote: Quote) => setQuotes([...quotes, quote]);
	const updateQuote = (id: string, updatedQuote: Quote) => setQuotes(quotes.map(q => (q.id === id ? updatedQuote : q)));
	const deleteQuote = async (id: string) => {
		setQuotes(quotes.filter(q => q.id !== id));
		await fetch(`${API_URL}/quotes/${id}`, { method: 'DELETE' });
	};
	const getQuote = (id: string) => quotes.find(q => q.id === id);

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
		updateQuote(quoteId, { ...quote, status: 'converted', updatedAt: new Date().toISOString() });
		return invoice;
	};

	// Customer operations
	const addCustomer = (customer: Customer) => setCustomers([...customers, customer]);
	const updateCustomer = (id: string, updatedCustomer: Customer) => setCustomers(customers.map(cust => (cust.id === id ? updatedCustomer : cust)));
	const deleteCustomer = async (id: string) => {
		setCustomers(customers.filter(cust => cust.id !== id));
		await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
	};
	const getCustomer = (id: string) => customers.find(cust => cust.id === id);

	// Master Item operations
	const addMasterItem = (item: MasterItem) => setMasterItems([...masterItems, item]);
	const updateMasterItem = (id: string, updatedItem: MasterItem) => setMasterItems(masterItems.map(item => (item.id === id ? updatedItem : item)));
	const deleteMasterItem = async (id: string) => {
		setMasterItems(masterItems.filter(item => item.id !== id));
		await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' });
	};
	const getMasterItem = (id: string) => masterItems.find(item => item.id === id);

	// Payment Method operations
	const addPaymentMethod = (method: PaymentMethod) => {
		if (method.isDefault) {
			setPaymentMethods([...paymentMethods.map(m => ({ ...m, isDefault: false })), method]);
		} else {
			setPaymentMethods([...paymentMethods, method]);
		}
	};
	const updatePaymentMethod = (id: string, updatedMethod: PaymentMethod) => setPaymentMethods(paymentMethods.map(m => (m.id === id ? updatedMethod : (updatedMethod.isDefault ? { ...m, isDefault: false } : m))));
	const deletePaymentMethod = async (id: string) => {
		setPaymentMethods(paymentMethods.filter(m => m.id !== id));
		await fetch(`${API_URL}/payment-methods/${id}`, { method: 'DELETE' });
	};
	const getPaymentMethod = (id: string) => paymentMethods.find(m => m.id === id);
	const setDefaultPaymentMethod = (id: string) => setPaymentMethods(paymentMethods.map(m => ({ ...m, isDefault: m.id === id })));

	// Stats
	const getTotalRevenue = () => invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.grandTotal, 0);
	const getTotalPendingAmount = () => invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').reduce((sum, inv) => sum + inv.grandTotal, 0);
	const getTotalPaidAmount = () => getTotalRevenue();
	const getInvoiceStats = () => ({
		total: invoices.length,
		paid: invoices.filter(inv => inv.status === 'paid').length,
		pending: invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').length,
		overdue: invoices.filter(inv => inv.status === 'overdue').length,
		draft: invoices.filter(inv => inv.status === 'draft').length,
	});
	const getQuoteStats = () => ({
		total: quotes.length,
		accepted: quotes.filter(q => q.status === 'accepted').length,
		rejected: quotes.filter(q => q.status === 'rejected').length,
		converted: quotes.filter(q => q.status === 'converted').length,
	});
	const getCustomerInvoices = (customerId: string) => invoices.filter(inv => inv.customerId === customerId);
	const getCustomerRevenue = (customerId: string) => invoices.filter(inv => inv.customerId === customerId && inv.status === 'paid').reduce((sum, inv) => sum + inv.grandTotal, 0);

	const value: AppContextType = {
		user, login, logout, isAuthenticated,
		invoices, addInvoice, updateInvoice, deleteInvoice, getInvoice,
		quotes, addQuote, updateQuote, deleteQuote, getQuote, convertQuoteToInvoice,
		customers, addCustomer, updateCustomer, deleteCustomer, getCustomer,
		masterItems, addMasterItem, updateMasterItem, deleteMasterItem, getMasterItem,
		paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, getPaymentMethod, setDefaultPaymentMethod,
		getTotalRevenue, getTotalPendingAmount, getTotalPaidAmount, getInvoiceStats, getQuoteStats, getCustomerInvoices, getCustomerRevenue,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
