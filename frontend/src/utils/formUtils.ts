import { FieldValues } from 'react-hook-form';
import { InvoiceFormData, QuoteFormData, CustomerFormData } from '@/schemas';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trimFormData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(trimFormData);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.keys(data).reduce((acc: any, key) => {
    const value = data[key];
    if (typeof value === 'string') {
      acc[key] = value.trim();
    } else if (typeof value === 'object' && value !== null) {
      acc[key] = trimFormData(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Keep only last 10 digits
  return cleaned.slice(-10);
};

export const formatGST = (gst: string): string => {
  return gst.toUpperCase().trim();
};

export const validateIndianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateGST = (gst: string): boolean => {
  if (!gst) return true; // GST is optional
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};
