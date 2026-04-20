import React from 'react';
import { Quote } from '@/context/types';
import { useApp } from '@/context/useApp';
import { numberToWords } from '@/lib/numberToWords';

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
			className="p-4 bg-white text-black border-[3px] border-black max-w-[210mm] mx-auto text-[11px] leading-tight"
		>
			{/* Top Header */}
			<div className="flex border-b border-black">
				<div className="flex-1 p-2 flex items-center gap-4">
					<img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
					<div>
						<h1 className="text-xl font-bold uppercase leading-none">Rent My EVENT</h1>
						<p className="text-[9px] font-semibold tracking-tighter">STYLE YOUR MOMENT</p>
						<div className="mt-1 text-[9px] leading-tight">
							<p>A123 Main Road Mandawali Fazelfur Near New Delhi, 110092</p>
							<div className="flex gap-4">
								<p>GSTIN: 07KRDPO7397PZT</p>
								<p>State: Delhi (07)</p>
							</div>
							<div className="flex gap-4">
								<p>Mobile: +91 9625340107</p>
								<p>Email: Rentmyevents@gmail.com</p>
							</div>
						</div>
					</div>
				</div>
				<div className="w-[180px] border-l border-black p-2 bg-gray-50 flex flex-col justify-between">
					<h2 className="text-xl font-bold text-center border-b border-black pb-1 mb-1">QUOTATION</h2>
					<div className="space-y-1 text-[10px]">
						<div className="flex justify-between">
							<span className="font-bold">No:</span>
							<span>{quote.quoteNumber}</span>
						</div>
						<div className="flex justify-between">
							<span className="font-bold">Date:</span>
							<span>{quote.quoteDate}</span>
						</div>
						<div className="flex justify-between">
							<span className="font-bold">Payment Terms:</span>
							<span>-</span>
						</div>
					</div>
				</div>
			</div>

			{/* Bill To / Ship To */}
			<div className="flex border-b border-black">
				<div className="flex-1 p-2 border-r border-black">
					<div className="bg-gray-200 px-2 py-0.5 border border-black mb-1 font-bold text-[10px]">BILL TO</div>
					<div className="px-1 space-y-0.5 font-semibold">
						<p className="text-sm font-bold uppercase">{quote.customerName}</p>
						<p className="text-gray-700">{quote.customerAddress}</p>
						<div className="flex gap-4 mt-1">
							<p><span className="font-bold">GSTIN:</span> {quote.customerGstin || '-'}</p>
							<p><span className="font-bold">State:</span> -</p>
						</div>
					</div>
				</div>
				<div className="flex-1 p-2">
					<div className="bg-gray-200 px-2 py-0.5 border border-black mb-1 font-bold text-[10px]">SHIP TO</div>
					<div className="px-1 space-y-0.5 font-semibold">
						<p className="text-sm font-bold uppercase">{quote.customerName}</p>
						<p className="text-gray-700">{quote.customerAddress}</p>
						<div className="flex gap-4 mt-1">
							<p><span className="font-bold">GSTIN:</span> {quote.customerGstin || '-'}</p>
							<p><span className="font-bold">State:</span> -</p>
						</div>
					</div>
				</div>
			</div>

			{/* Items Table */}
			<div className="w-full">
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-gray-100 text-[10px] uppercase font-bold text-center">
							<th className="border border-black p-1 w-8">Sr.</th>
							<th className="border border-black p-1">Description</th>
							<th className="border border-black p-1 w-16">HSN</th>
							<th className="border border-black p-1 w-20">Rate (₹)</th>
							<th className="border border-black p-1 w-12">Qty</th>
							<th className="border border-black p-1 w-24">Taxable Value (₹)</th>
							<th className="border border-black p-1 w-16">GST%</th>
							<th className="border border-black p-1 w-24">Amount (₹)</th>
						</tr>
					</thead>
					<tbody>
						{quote.items.map((item, idx) => {
							const taxableValue = item.quantity * item.days * item.pricePerDay;
							const discount = item.discountType === 'percent'
								? (taxableValue * item.discount) / 100
								: item.discount;
							const afterDiscount = taxableValue - discount;
							const gst = (afterDiscount * item.gstPercent) / 100;
							const amount = afterDiscount + gst;

							return (
								<tr key={idx} className="text-center font-medium">
									<td className="border border-black p-1 h-8">{idx + 1}</td>
									<td className="border border-black p-1 text-left">
										<p className="font-bold">{item.itemName}</p>
										{item.description && <p className="text-[9px] text-gray-600 font-normal">{item.description}</p>}
									</td>
									<td className="border border-black p-1">-</td>
									<td className="border border-black p-1 text-right">{item.pricePerDay.toFixed(2)}</td>
									<td className="border border-black p-1">{item.quantity}</td>
									<td className="border border-black p-1 text-right">{taxableValue.toFixed(2)}</td>
									<td className="border border-black p-1">{item.gstPercent}%</td>
									<td className="border border-black p-1 text-right font-bold">{amount.toFixed(2)}</td>
								</tr>
							);
						})}
						{/* Padding rows to maintain height if few items */}
						{[...Array(Math.max(0, 5 - quote.items.length))].map((_, i) => (
							<tr key={`empty-${i}`} className="h-8">
								<td className="border border-black p-1"></td>
								<td className="border border-black p-1"></td>
								<td className="border border-black p-1"></td>
								<td className="border border-black p-1"></td>
								<td className="border border-black p-1"></td>
								<td className="border border-black p-1"></td>
								<td className="border border-black p-1"></td>
								<td className="border border-black p-1"></td>
							</tr>
						))}
						{/* Table Footer */}
						<tr className="font-bold bg-gray-50 uppercase text-[10px]">
							<td colSpan={5} className="border border-black p-1 text-right">Total:</td>
							<td className="border border-black p-1 text-right">{quote.subtotal.toFixed(2)}</td>
							<td className="border border-black p-1"></td>
							<td className="border border-black p-1 text-right">{quote.grandTotal.toFixed(2)}</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* Bank Details & Summary Section */}
			<div className="flex border-x border-b border-black">
				<div className="flex-1 p-2 border-r border-black font-semibold space-y-1">
					<p className="font-bold text-[10px] uppercase border-b border-black/20 pb-0.5 mb-1">BANK DETAILS</p>
					{paymentMethod && paymentMethod.type === 'bank' ? (
						<div className="grid grid-cols-[80px_1fr] gap-x-2 text-[10px]">
							<span className="font-bold">Bank:</span> <span>{paymentMethod.bankName}</span>
							<span className="font-bold">A/c No.:</span> <span>{paymentMethod.accountNumber}</span>
							<span className="font-bold">IFSC Code:</span> <span>{paymentMethod.ifscCode}</span>
							<span className="font-bold">Branch:</span> <span>-</span>
							<span className="font-bold">Account Holder:</span> <span>{paymentMethod.accountHolderName}</span>
						</div>
					) : (
						<p className="text-gray-400 text-[10px]">No bank details provided</p>
					)}
				</div>
				<div className="w-[300px]">
					<div className="grid grid-cols-[1fr_100px] border-b border-black font-bold text-[10px]">
						<div className="p-1 uppercase">Taxable Value:</div>
						<div className="p-1 border-l border-black text-right">₹{quote.subtotal.toFixed(2)}</div>
					</div>
					<div className="grid grid-cols-[1fr_100px] border-b border-black font-bold text-[10px]">
						<div className="p-1 uppercase text-red-600">Total Discount:</div>
						<div className="p-1 border-l border-black text-right text-red-600">- ₹{quote.totalDiscount.toFixed(2)}</div>
					</div>
					<div className="grid grid-cols-[1fr_100px] border-b border-black font-bold text-[10px]">
						<div className="p-1 uppercase">GST ({quote.items[0]?.gstPercent || 18}%):</div>
						<div className="p-1 border-l border-black text-right">₹{quote.totalGST.toFixed(2)}</div>
					</div>
					<div className="grid grid-cols-[1fr_100px] bg-gray-50 font-bold text-xs">
						<div className="p-1.5 uppercase">GRAND TOTAL:</div>
						<div className="p-1.5 border-l border-black text-right text-blue-800">₹{quote.grandTotal.toFixed(2)}</div>
					</div>
				</div>
			</div>

			{/* Amount in Words */}
			<div className="border border-black mt-2 p-2 relative">
				<p className="text-[8px] absolute -top-2 left-2 bg-white px-1 font-bold uppercase text-gray-500">Amount in Words</p>
				<p className="font-bold italic text-gray-700">{numberToWords(quote.grandTotal)}</p>
			</div>

			{/* Remarks */}
			<div className="border border-black mt-2 min-h-12 relative p-2">
				<p className="text-[8px] absolute -top-2 left-2 bg-white px-1 font-bold uppercase text-gray-500">Remarks</p>
				<p className="text-gray-700">{quote.notes || 'No remarks'}</p>
			</div>

			{/* Footer Signatures */}
			<div className="mt-4 grid grid-cols-2 gap-8 h-24">
				<div className="border border-black relative flex flex-col justify-end p-1 text-center bg-gray-50/30">
					<p className="text-[8px] absolute top-1 left-2 font-bold uppercase">For Rent My EVENT</p>
					<div className="border-t border-black w-2/3 mx-auto pb-1 font-bold text-[9px] uppercase">Authorized Signatory</div>
				</div>
				<div className="border border-black relative flex flex-col justify-end p-1 text-center bg-gray-50/30">
					<p className="text-[8px] absolute top-1 right-2 font-bold uppercase">Receiver's Signature</p>
					<div className="border-t border-black w-2/3 mx-auto pb-1 font-bold text-[9px] uppercase">Seal & Signature</div>
				</div>
			</div>
		</div>
	);
};

export default QuotePreview;
