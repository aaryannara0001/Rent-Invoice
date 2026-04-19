import React from 'react';
import { Quote } from '@/context/types';
import { useApp } from '@/context/useApp';

interface QuotePreviewProps {
	quote: Quote | Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>;
	id?: string;
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ quote, id }) => {
	const { paymentMethods } = useApp();
	const paymentMethod = paymentMethods.find(m => m.id === quote.paymentMethodId);

	return (
		<div
			id={`quote-${id || 'preview'}`}
			className="p-12 bg-white text-black rounded-lg shadow-lg border border-gray-200 print:p-4 print:shadow-none print:border-none"
		>
			<div className="max-w-3xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex justify-between items-center border-b-2 pb-4 mb-4">
					<div>
						<h1 className="text-4xl font-bold tracking-widest text-blue-700">QUOTE</h1>
						<p className="text-gray-600">{quote.quoteNumber}</p>
					</div>
					<div className="text-right">
						<img src="/logo.png" alt="Company Logo" className="h-12 mb-2" style={{ display: 'inline-block' }} />
						<p className="font-semibold">Quote Date: {quote.quoteDate}</p>
						<p className="font-semibold">Valid Until: {quote.validUntil}</p>
					</div>
				</div>

				{/* From To */}
				<div className="flex justify-between gap-8 border-b pb-4">
					<div>
						<p className="font-bold text-lg mb-2 text-blue-700">From:</p>
						<p className="text-gray-800 font-semibold">Digital Rent Flow</p>
						<p className="text-gray-700">123 Business Avenue</p>
						<p className="text-gray-700">Bangalore, KA 560001</p>
					</div>
					<div>
						<p className="font-bold text-lg mb-2 text-blue-700">Quote For:</p>
						<p className="font-semibold text-gray-800">{quote.customerName}</p>
						<p className="text-gray-700">{quote.customerAddress}</p>
						<p className="text-gray-700">{quote.customerEmail}</p>
						<p className="text-gray-700">{quote.customerPhone}</p>
						{quote.customerGstin && (
							<p className="text-gray-700">GSTIN: {quote.customerGstin}</p>
						)}
					</div>
				</div>

				{/* Items Table */}
				<div className="overflow-x-auto">
					<table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
						<thead>
							<tr className="bg-blue-50 text-blue-900">
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
							{quote.items.map((item, idx) => {
								const itemSubtotal = item.quantity * item.days * item.pricePerDay;
								const discount = item.discountType === 'percent'
									? (itemSubtotal * item.discount) / 100
									: item.discount;
								const afterDiscount = itemSubtotal - discount;
								const gst = (afterDiscount * item.gstPercent) / 100;
								const total = afterDiscount + gst;
								return (
									<tr key={idx} className="border">
										<td className="border p-2">
											<p className="font-semibold">{item.itemName}</p>
											<p className="text-sm text-gray-700">{item.description}</p>
										</td>
										<td className="border p-2 text-center">{item.quantity}</td>
										<td className="border p-2 text-center">{item.days}</td>
										<td className="border p-2 text-right">₹{item.pricePerDay.toFixed(2)}</td>
										<td className="border p-2 text-right">₹{discount.toFixed(2)}</td>
										<td className="border p-2 text-right">₹{gst.toFixed(2)}</td>
										<td className="border p-2 text-right font-semibold">₹{total.toFixed(2)}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Totals and Payment Info */}
				<div className="flex flex-col md:flex-row justify-between gap-8 pt-4">
					<div className="flex-1 mb-4 md:mb-0">
						{paymentMethod && (
							<div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
								<p className="font-bold text-blue-800 mb-2 underline">PAYMENT DETAILS</p>
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
					<div className="w-full md:w-80">
						<div className="flex justify-between py-2 border-t">
							<span className="font-semibold">Subtotal:</span>
							<span>₹{quote.subtotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between py-2">
							<span className="font-semibold">Total Discount:</span>
							<span>-₹{quote.totalDiscount.toFixed(2)}</span>
						</div>
						<div className="flex justify-between py-2">
							<span className="font-semibold">Total GST:</span>
							<span>₹{quote.totalGST.toFixed(2)}</span>
						</div>
						<div className="flex justify-between py-2 text-lg font-bold border-t border-b">
							<span>Grand Total:</span>
							<span>₹{quote.grandTotal.toFixed(2)}</span>
						</div>
					</div>
				</div>

				{/* Notes */}
				{quote.notes && (
					<div className="border-t pt-4 mt-4">
						<p className="font-bold text-blue-700 mb-1">Notes:</p>
						<p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
					</div>
				)}

				{/* Signature */}
				<div className="flex justify-end pt-8">
					<div className="text-right">
						<p className="font-semibold">For Digital Rent Flow</p>
						<div className="h-12"></div>
						<p className="text-gray-700">Authorized Signature</p>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t pt-4 text-center text-sm text-gray-500">
					<p>Thank you for your business!</p>
				</div>
			</div>
		</div>
	);
};

export default QuotePreview;

