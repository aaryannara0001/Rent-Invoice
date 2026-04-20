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

	// Using Brand Colors from the Logo
	const brandBlue = '#01549B';
	const brandGreen = '#2E7D32';

	return (
		<div
			id={`quote-${id || 'preview'}`}
			className="p-8 bg-white text-[#1A1A1A] max-w-[210mm] mx-auto text-[11px] font-sans antialiased"
			style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
		>
			{/* Top Decorative bar */}
			<div className="h-1.5 w-full bg-gradient-to-r from-[#01549B] via-[#0288D1] to-[#2E7D32] mb-6" />

			{/* Header Section */}
			<div className="flex justify-between items-start mb-8">
				<div className="flex gap-4">
					<img src="/logo.png" alt="Logo" className="h-20 w-auto object-contain" />
					<div className="border-l-2 border-gray-100 pl-4">
						<h1 className="text-2xl font-black text-[#01549B] uppercase tracking-tight">Rent My EVENT</h1>
						<p className="text-[10px] font-bold text-[#2E7D32] tracking-[0.2em] uppercase mb-2">Style Your Moment</p>
						<p className="text-gray-500 max-w-[200px]">A123 Main Road Mandawali Fazelfur, Near New Delhi, 110092</p>
						<p className="text-gray-500">GSTIN: <span className="text-black font-semibold">07KRDPO7397PZT</span></p>
					</div>
				</div>
				<div className="text-right">
					<h2 className="text-4xl font-black text-gray-100 uppercase leading-none mb-1">QUOTATION</h2>
					<div className="space-y-1">
						<p className="font-bold text-gray-400">NO: <span className="text-black">{quote.quoteNumber}</span></p>
						<p className="font-bold text-gray-400">DATE: <span className="text-black">{quote.quoteDate}</span></p>
					</div>
				</div>
			</div>

			{/* Info Boxes */}
			<div className="grid grid-cols-2 gap-8 mb-8">
				<div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
					<p className="text-[10px] font-black text-[#01549B] uppercase tracking-wider mb-2">Client Details</p>
					<div className="space-y-1">
						<p className="text-base font-bold text-black uppercase">{quote.customerName}</p>
						<p className="text-gray-600 leading-relaxed">{quote.customerAddress}</p>
						<div className="flex gap-4 mt-2">
							<p className="text-[10px]"><span className="text-gray-400">PHONE:</span> {quote.customerPhone}</p>
							<p className="text-[10px]"><span className="text-gray-400">EMAIL:</span> {quote.customerEmail}</p>
						</div>
					</div>
				</div>
				<div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
					<p className="text-[10px] font-black text-[#2E7D32] uppercase tracking-wider mb-2">Event Details</p>
					<div className="space-y-1 text-gray-600">
						<p><span className="font-bold text-gray-400 uppercase">Location:</span> {quote.eventLocation || 'Venue to be confirmed'}</p>
						<p><span className="font-bold text-gray-400 uppercase">Event:</span> {quote.eventName || '-'}</p>
						<p><span className="font-bold text-gray-400 uppercase">Valid Thru:</span> <span className="text-black font-bold">{quote.validUntil}</span></p>
					</div>
				</div>
			</div>

			{/* Table Title */}
			<div className="mb-2 px-1 flex justify-between items-end">
				<h3 className="text-sm font-black uppercase text-gray-800">Rental Equipment Services</h3>
				<span className="text-[10px] text-gray-400 italic">All prices in Indian Rupees (INR)</span>
			</div>

			{/* Items Table - Clean Modern Style */}
			<div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-8">
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-[#01549B] text-white text-[10px] uppercase font-bold text-center">
							<th className="p-3 w-10">#</th>
							<th className="p-3 text-left">Product / Service Description</th>
							<th className="p-3 w-16">HSN</th>
							<th className="p-3 w-20">Rate</th>
							<th className="p-3 w-12">Qty</th>
							<th className="p-3 w-16">Days</th>
							<th className="p-3 w-28">Total Amount</th>
						</tr>
					</thead>
					<tbody className="text-center font-medium divide-y divide-gray-50">
						{quote.items.map((item, idx) => {
							const taxableValue = item.quantity * item.days * item.pricePerDay;
							const discount = item.discountType === 'percent'
								? (taxableValue * item.discount) / 100
								: item.discount;
							const total = taxableValue - discount + ((taxableValue - discount) * item.gstPercent / 100);

							return (
								<tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
									<td className="p-3 text-gray-400 font-bold">{idx + 1}</td>
									<td className="p-3 text-left">
										<p className="font-bold text-black uppercase">{item.itemName}</p>
										{item.description && <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{item.description}</p>}
									</td>
									<td className="p-3 text-gray-400">99731x</td>
									<td className="p-3">₹{item.pricePerDay.toLocaleString('en-IN')}</td>
									<td className="p-3">{item.quantity}</td>
									<td className="p-3">{item.days}</td>
									<td className="p-3 font-bold text-[#01549B]">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Summary Section */}
			<div className="grid grid-cols-5 gap-8 mb-8">
				<div className="col-span-3 space-y-4">
					<div className="p-4 bg-gray-50 rounded-xl space-y-2">
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">Payment Method</p>
						{paymentMethod && paymentMethod.type === 'bank' ? (
							<div className="grid grid-cols-2 gap-2 text-[10px]">
								<div>
									<p className="text-gray-400 uppercase font-black text-[8px]">Account Name</p>
									<p className="font-bold">{paymentMethod.accountHolderName}</p>
								</div>
								<div>
									<p className="text-gray-400 uppercase font-black text-[8px]">Bank & Branch</p>
									<p className="font-bold">{paymentMethod.bankName}</p>
								</div>
								<div>
									<p className="text-gray-400 uppercase font-black text-[8px]">Account Number</p>
									<p className="font-bold">{paymentMethod.accountNumber}</p>
								</div>
								<div>
									<p className="text-gray-400 uppercase font-black text-[8px]">IFSC Code</p>
									<p className="font-bold">{paymentMethod.ifscCode}</p>
								</div>
							</div>
						) : (
							<p className="text-gray-400 italic">Payment details to be provided separately</p>
						)}
					</div>
					<div className="px-2">
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">In Words</p>
						<p className="font-bold italic text-[#2E7D32] text-sm">{numberToWords(quote.grandTotal)}</p>
					</div>
				</div>
				<div className="col-span-2 bg-[#01549B] text-white p-6 rounded-2xl shadow-xl shadow-blue-900/10 relative overflow-hidden">
					{/* Decorative circle */}
					<div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full" />
					
					<div className="relative z-10 space-y-3">
						<div className="flex justify-between items-center text-white/60">
							<span className="font-bold uppercase tracking-widest text-[9px]">Subtotal (Taxable)</span>
							<span className="font-bold">₹{quote.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
						</div>
						<div className="flex justify-between items-center text-white/60">
							<span className="font-bold uppercase tracking-widest text-[9px]">Cumulative GST</span>
							<span className="font-bold">₹{quote.totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
						</div>
						<div className="flex justify-between items-center text-red-300">
							<span className="font-bold uppercase tracking-widest text-[9px]">Total Discount</span>
							<span className="font-bold">-₹{quote.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
						</div>
						<div className="pt-4 border-t border-white/10 mt-4 h-16 flex flex-col justify-end">
							<p className="font-black uppercase tracking-[0.2em] text-[8px] text-white/40 leading-none mb-1">Grand Total Payable</p>
							<div className="flex justify-between items-baseline text-2xl font-black">
								<span className="text-lg">₹</span>
								<span>{quote.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Signature & Remarks */}
			<div className="grid grid-cols-2 gap-12 mt-12">
				<div className="space-y-4">
					<div className="border border-gray-100 rounded-xl p-4">
						<p className="font-black uppercase text-[9px] text-gray-400 mb-2">Terms & Remarks</p>
						<p className="text-gray-600 italic leading-relaxed">{quote.notes || 'Please confirm the quote within 7 days of issuance.'}</p>
					</div>
				</div>
				<div className="flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
					<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Authorized Signature for Rent My Event</p>
					<div className="h-0.5 w-3/4 bg-gray-300" />
					<p className="mt-2 text-[9px] font-bold text-[#01549B]">Proprietor / Signatory</p>
				</div>
			</div>

			{/* Final Footer */}
			<div className="mt-12 text-center">
				<p className="text-[10px] font-bold text-gray-300 tracking-[0.3em] uppercase">Built with precision by Digital Rent Flow</p>
			</div>
		</div>
	);
};

export default QuotePreview;
