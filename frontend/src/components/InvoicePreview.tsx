import React from 'react';
import { Invoice } from '@/context/types';
import { useApp } from '@/context/useApp';

interface InvoicePreviewProps {
	invoice: Invoice | Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;
	id?: string;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, id }) => {
	const { paymentMethods } = useApp();
	const paymentMethod = paymentMethods.find(m => m.id === invoice.paymentMethodId);

	return (
		<div
			id={`invoice-${id || 'preview'}`}
			className="p-12 bg-white text-black"
		>
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-4xl font-bold">INVOICE</h1>
						<p className="text-gray-600">{invoice.invoiceNumber}</p>
					</div>
					<div className="text-right">
						<p className="font-semibold">Invoice Date: {invoice.invoiceDate}</p>
						<p className="font-semibold">Due Date: {invoice.dueDate}</p>
					</div>
				</div>

				{/* From To */}
				<div className="grid grid-cols-2 gap-8 py-6 border-t-2 border-b-2">
					<div>
						<p className="font-bold text-lg mb-2">From:</p>
						<p className="text-gray-700">Digital Rent Flow</p>
						<p className="text-gray-700">123 Business Avenue</p>
						<p className="text-gray-700">Bangalore, KA 560001</p>
					</div>
					<div>
						<p className="font-bold text-lg mb-2">Bill To:</p>
						<p className="font-semibold">{invoice.customerName}</p>
						<p className="text-gray-700">{invoice.customerAddress}</p>
						<p className="text-gray-700">{invoice.customerEmail}</p>
						<p className="text-gray-700">{invoice.customerPhone}</p>
						{invoice.customerGstin && (
							<p className="text-gray-700">GSTIN: {invoice.customerGstin}</p>
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
							{invoice.items.map((item, idx) => (
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

				{/* Totals and Payment Info */}
				<div className="flex justify-between gap-8 pt-4">
					<div className="flex-1">
						{paymentMethod && (
							<div className="bg-gray-50 p-4 rounded-lg border">
								<p className="font-bold text-gray-800 mb-2 underline">PAYMENT DETAILS</p>
								{paymentMethod.type === 'bank' ? (
									<div className="text-sm space-y-1">
										<p><span className="font-semibold">Account Holder:</span> {paymentMethod.accountHolderName}</p>
										<p><span className="font-semibold">Bank Name:</span> {paymentMethod.bankName}</p>
										<p><span className="font-semibold">Account Number:</span> {paymentMethod.accountNumber}</p>
										<p><span className="font-semibold">IFSC Code:</span> {paymentMethod.ifscCode}</p>
									</div>
								) : (
									<div className="text-sm space-y-1">
										<p><span className="font-semibold">UPI ID:</span> {paymentMethod.upiId}</p>
									</div>
								)}
							</div>
						)}
					</div>
					<div className="w-64">
						<div className="flex justify-between py-2 border-t-2">
							<span>Subtotal:</span>
							<span>₹{invoice.subtotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between py-2">
							<span>Total Discount:</span>
							<span>-₹{invoice.totalDiscount.toFixed(2)}</span>
						</div>
						<div className="flex justify-between py-2">
							<span>Total GST:</span>
							<span>₹{invoice.totalGST.toFixed(2)}</span>
						</div>
						<div className="flex justify-between py-2 text-lg font-bold border-t-2 border-b-2">
							<span>Grand Total:</span>
							<span>₹{invoice.grandTotal.toFixed(2)}</span>
						</div>
					</div>
				</div>

				{/* Notes */}
				{invoice.notes && (
					<div className="border-t-2 pt-4">
						<p className="font-bold">Notes:</p>
						<p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
					</div>
				)}

				{/* Footer */}
				<div className="border-t-2 pt-4 text-center text-sm text-gray-600">
					<p>Thank you for your business!</p>
				</div>
			</div>
		</div>
	);
};

export default InvoicePreview;

