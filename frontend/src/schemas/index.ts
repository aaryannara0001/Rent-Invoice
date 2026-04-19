import { z } from 'zod';

// Indian phone number validation (starts with 6-9, 10 digits)
const phoneRegex = /^[6-9]\d{9}$/;

// GST validation (basic format check)
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const customerSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .refine(val => val.trim().length >= 3, 'Name cannot be only spaces'),
  phone: z.string()
    .regex(phoneRegex, 'Phone must be a valid 10-digit Indian number starting with 6-9'),
  email: z.string()
    .email('Invalid email format'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be less than 500 characters'),
  gstin: z.string()
    .optional()
    .refine(val => !val || gstRegex.test(val), 'Invalid GST format'),
});

export const rentalItemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string()
    .min(1, 'Item name is required')
    .max(200, 'Item name must be less than 200 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  quantity: z.number()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity cannot exceed 1000'),
  days: z.number()
    .min(1, 'Days must be at least 1')
    .max(365, 'Days cannot exceed 365'),
  pricePerDay: z.number()
    .min(0, 'Price per day must be positive')
    .max(1000000, 'Price per day cannot exceed 10,00,000'),
  discount: z.number()
    .min(0, 'Discount cannot be negative')
    .max(1000000, 'Discount cannot exceed 10,00,000'),
  discountType: z.enum(['amount', 'percent']),
  gstPercent: z.number()
    .min(0, 'GST percent cannot be negative')
    .max(100, 'GST percent cannot exceed 100'),
  total: z.number().optional(),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
  customerEmail: z.string().min(1, 'Customer email is required'),
  customerAddress: z.string().min(1, 'Customer address is required'),
  customerGstin: z.string().optional().default(''),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(rentalItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0, 'Subtotal must be positive').default(0),
  totalDiscount: z.number().min(0, 'Total discount cannot be negative').default(0),
  totalGST: z.number().min(0, 'Total GST cannot be negative').default(0),
  grandTotal: z.number().min(0, 'Grand total must be positive').default(0),
  status: z.enum(['draft', 'sent', 'pending', 'paid', 'overdue']).default('draft'),
  eventName: z.string().optional().default(''),
  eventLocation: z.string().optional().default(''),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().default(''),
  paymentMethodId: z.string().optional().default(''),
});

export const quoteSchema = invoiceSchema
  .omit({ invoiceNumber: true, invoiceDate: true, dueDate: true, status: true })
  .extend({
    quoteNumber: z.string().min(1, 'Quote number is required'),
    quoteDate: z.string().min(1, 'Quote date is required'),
    validUntil: z.string().min(1, 'Valid until date is required'),
    status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'converted']).default('draft'),
  });

export const paymentMethodSchema = z.object({
  type: z.enum(['bank', 'upi']),
  label: z.string().min(1, 'Label is required').max(100, 'Label must be less than 100 characters'),
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
  qrCode: z.string().optional(),
}).refine(data => {
  if (data.type === 'bank') {
    return data.bankName && data.accountHolderName && data.accountNumber && data.ifscCode;
  } else if (data.type === 'upi') {
    return data.upiId;
  }
  return false;
}, {
  message: 'Required fields missing for payment method type',
  path: ['type'],
});

export const masterItemSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  pricePerDay: z.number()
    .min(0, 'Price per day must be positive')
    .max(1000000, 'Price per day cannot exceed 10,00,000'),
  gstPercent: z.number()
    .min(0, 'GST percent cannot be negative')
    .max(100, 'GST percent cannot exceed 100'),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type RentalItemFormData = z.infer<typeof rentalItemSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type QuoteFormData = z.infer<typeof quoteSchema>;
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
export type MasterItemFormData = z.infer<typeof masterItemSchema>;
