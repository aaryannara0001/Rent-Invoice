'use client';

import React, { useState, useEffect } from 'react';
import { AppContext, AppContextType, Invoice, Quote, Customer, MasterItem, PaymentMethod, User } from './types';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

// Helper: map flat DB row back to Invoice shape
const rowToInvoice = (row: Record<string, unknown>): Invoice => {
  if (row.data) return row.data as Invoice; // legacy blob format
  return {
    id: row.id as string,
    invoiceNumber: row.invoice_number as string,
    customerId: row.customer_id as string,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    customerEmail: '',
    customerAddress: '',
    customerGstin: '',
    invoiceDate: row.invoice_date as string,
    dueDate: row.due_date as string,
    subtotal: Number(row.subtotal ?? 0),
    totalDiscount: Number(row.total_discount ?? 0),
    totalGST: Number(row.total_gst ?? 0),
    grandTotal: Number(row.grand_total ?? 0),
    status: (row.status as string) ?? 'draft',
    items: (row.items as Invoice['items']) ?? [],
    eventName: '',
    eventLocation: '',
    notes: '',
    createdAt: row.created_at as string,
    updatedAt: row.created_at as string,
  };
};

const rowToQuote = (row: Record<string, unknown>): Quote => {
  if (row.data) return row.data as Quote;
  return {
    id: row.id as string,
    quoteNumber: row.quote_number as string,
    customerId: row.customer_id as string,
    customerName: row.customer_name as string,
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerGstin: '',
    quoteDate: row.quote_date as string,
    validUntil: row.valid_until as string,
    subtotal: 0,
    totalDiscount: 0,
    totalGST: 0,
    grandTotal: Number(row.grand_total ?? 0),
    status: (row.status as string) ?? 'draft',
    items: (row.items as Quote['items']) ?? [],
    eventName: '',
    eventLocation: '',
    notes: '',
    createdAt: row.created_at as string,
    updatedAt: row.created_at as string,
  };
};

const rowToCustomer = (row: Record<string, unknown>): Customer => {
  if (row.data) return row.data as Customer;
  return {
    id: row.id as string,
    name: row.name as string,
    phone: (row.phone as string) ?? '',
    email: (row.email as string) ?? '',
    address: (row.address as string) ?? '',
    gstin: (row.gstin as string) ?? '',
    createdAt: row.created_at as string,
    updatedAt: row.created_at as string,
  };
};

const rowToItem = (row: Record<string, unknown>): MasterItem => {
  if (row.data) return row.data as MasterItem;
  return {
    id: row.id as string,
    name: (row.name as string) ?? '',
    pricePerDay: Number(row.price_per_day ?? 0),
    gstPercent: Number(row.gst_percent ?? 0),
    category: (row.category as string) ?? '',
    description: '',
    createdAt: row.created_at as string,
    updatedAt: row.created_at as string,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rental_auth_session');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;

  // Load all data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [invsRes, qtsRes, custsRes, itemsRes, methodsRes] = await Promise.all([
          supabase.from('invoices').select('*').order('created_at', { ascending: false }),
          supabase.from('quotes').select('*').order('created_at', { ascending: false }),
          supabase.from('customers').select('*').order('created_at', { ascending: false }),
          supabase.from('master_items').select('*'),
          supabase.from('payment_methods').select('*'),
        ]);

        if (invsRes.data) setInvoices(invsRes.data.map(rowToInvoice));
        if (qtsRes.data) setQuotes(qtsRes.data.map(rowToQuote));
        if (custsRes.data) setCustomers(custsRes.data.map(rowToCustomer));
        if (itemsRes.data) setMasterItems(itemsRes.data.map(rowToItem));
        if (methodsRes.data) setPaymentMethods(
          methodsRes.data.map(r => (r.data ? r.data : r) as PaymentMethod)
        );
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      }
    };
    loadData();
  }, []);

  // Persist auth session
  useEffect(() => {
    if (user) localStorage.setItem('rental_auth_session', JSON.stringify(user));
    else localStorage.removeItem('rental_auth_session');
  }, [user]);

  // Auth
  const login = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

      if (error) {
        console.error('Login query error:', error);
        return false;
      }

      const user = data?.find((u: Record<string, string>) => u.password === pass);
      if (user) {
        setUser({ email: user.email, name: user.name });
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const logout = () => setUser(null);

  // Invoice operations
  const addInvoice = async (invoice: Invoice) => {
    setInvoices(prev => [...prev, invoice]);
    await supabase.from('invoices').upsert({
      id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      customer_id: invoice.customerId,
      customer_name: invoice.customerName,
      customer_phone: invoice.customerPhone,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      subtotal: invoice.subtotal,
      total_discount: invoice.totalDiscount,
      total_gst: invoice.totalGST,
      grand_total: invoice.grandTotal,
      status: invoice.status,
      items: invoice.items,
    });
  };

  const updateInvoice = async (id: string, updated: Invoice) => {
    setInvoices(prev => prev.map(inv => (inv.id === id ? updated : inv)));
    await supabase.from('invoices').upsert({
      id: updated.id,
      invoice_number: updated.invoiceNumber,
      customer_id: updated.customerId,
      customer_name: updated.customerName,
      customer_phone: updated.customerPhone,
      invoice_date: updated.invoiceDate,
      due_date: updated.dueDate,
      subtotal: updated.subtotal,
      total_discount: updated.totalDiscount,
      total_gst: updated.totalGST,
      grand_total: updated.grandTotal,
      status: updated.status,
      items: updated.items,
    });
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    await supabase.from('invoices').delete().eq('id', id);
  };

  const getInvoice = (id: string) => invoices.find(inv => inv.id === id);

  // Quote operations
  const addQuote = async (quote: Quote) => {
    setQuotes(prev => [...prev, quote]);
    await supabase.from('quotes').upsert({
      id: quote.id,
      quote_number: quote.quoteNumber,
      customer_id: quote.customerId,
      customer_name: quote.customerName,
      quote_date: quote.quoteDate,
      valid_until: quote.validUntil,
      grand_total: quote.grandTotal,
      status: quote.status,
      items: quote.items,
    });
  };

  const updateQuote = async (id: string, updated: Quote) => {
    setQuotes(prev => prev.map(q => (q.id === id ? updated : q)));
    await supabase.from('quotes').upsert({
      id: updated.id,
      quote_number: updated.quoteNumber,
      customer_id: updated.customerId,
      customer_name: updated.customerName,
      quote_date: updated.quoteDate,
      valid_until: updated.validUntil,
      grand_total: updated.grandTotal,
      status: updated.status,
      items: updated.items,
    });
  };

  const deleteQuote = async (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    await supabase.from('quotes').delete().eq('id', id);
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
  const addCustomer = async (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
    await supabase.from('customers').upsert({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      gstin: customer.gstin,
    });
  };

  const updateCustomer = async (id: string, updated: Customer) => {
    setCustomers(prev => prev.map(c => (c.id === id ? updated : c)));
    await supabase.from('customers').upsert({
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      address: updated.address,
      gstin: updated.gstin,
    });
  };

  const deleteCustomer = async (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    await supabase.from('customers').delete().eq('id', id);
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  // Master Item operations
  const addMasterItem = async (item: MasterItem) => {
    setMasterItems(prev => [...prev, item]);
    await supabase.from('master_items').upsert({
      id: item.id,
      name: item.name,
      price_per_day: item.pricePerDay,
      gst_percent: item.gstPercent,
      category: item.category,
    });
  };

  const updateMasterItem = async (id: string, updated: MasterItem) => {
    setMasterItems(prev => prev.map(item => (item.id === id ? updated : item)));
    await supabase.from('master_items').upsert({
      id: updated.id,
      name: updated.name,
      price_per_day: updated.pricePerDay,
      gst_percent: updated.gstPercent,
      category: updated.category,
    });
  };

  const deleteMasterItem = async (id: string) => {
    setMasterItems(prev => prev.filter(item => item.id !== id));
    await supabase.from('master_items').delete().eq('id', id);
  };

  const getMasterItem = (id: string) => masterItems.find(item => item.id === id);

  // Payment Method operations
  const addPaymentMethod = async (method: PaymentMethod) => {
    const updated = method.isDefault
      ? paymentMethods.map(m => ({ ...m, isDefault: false }))
      : [...paymentMethods];
    setPaymentMethods([...updated, method]);
    await supabase.from('payment_methods').upsert({ id: method.id, data: method });
  };

  const updatePaymentMethod = async (id: string, updated: PaymentMethod) => {
    setPaymentMethods(prev =>
      prev.map(m => (m.id === id ? updated : updated.isDefault ? { ...m, isDefault: false } : m))
    );
    await supabase.from('payment_methods').upsert({ id: updated.id, data: updated });
  };

  const deletePaymentMethod = async (id: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
    await supabase.from('payment_methods').delete().eq('id', id);
  };

  const getPaymentMethod = (id: string) => paymentMethods.find(m => m.id === id);
  const setDefaultPaymentMethod = (id: string) =>
    setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));

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
  const getCustomerRevenue = (customerId: string) =>
    invoices.filter(inv => inv.customerId === customerId && inv.status === 'paid').reduce((sum, inv) => sum + inv.grandTotal, 0);

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
