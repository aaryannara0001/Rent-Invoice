import React from 'react';
import { Invoice } from '@/context/types';
import { useApp } from '@/context/useApp';
import { numberToWords } from '@/lib/numberToWords';

interface InvoicePreviewProps {
	invoice: Invoice | Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;
	id?: string;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, id }) => {
	const { paymentMethods } = useApp();
	const paymentMethod = paymentMethods.find(m => m.id === invoice.paymentMethodId);

	// Brand Colors from Logo
	const brandBlue = '#01549B';
	const brandGreen = '#2E7D32';

	return (
		<div
			id={`invoice-${id || 'preview'}`}
			className="p-8 bg-white text-[#1A1A1A] max-w-[210mm] mx-auto text-[11px] font-sans antialiased"
			style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
		>
			{/* Top Decorative gradient bar */}
			<div className="h-1.5 w-full bg-gradient-to-r from-[#01549B] via-[#0288D1] to-[#2E7D32] mb-6" />

			{/* Header Section */}
			<div className="flex justify-between items-start mb-8">
				<div className="flex gap-4">
					<img src="/logo.png" alt="Logo" className="h-20 w-auto object-contain" />
					<div className="border-l-2 border-gray-100 pl-4">
						<h1 className="text-2xl font-black text-[#01549B] uppercase tracking-tight">Rent My EVENT</h1>
						<p className="text-[10px] font-bold text-[#2E7D32] tracking-[0.2em] uppercase mb-2">Style Your Moment</p>
						<div className="text-gray-500 max-w-[200px] leading-tight text-[10px]">
							<p>A123 Main Road Mandawali Fazelfur,</p>
							<p>Near New Delhi, 110092</p>
							<p className="mt-1">GSTIN: <span className="text-black font-bold">07KRDPO7397PZT</span></p>
						</div>
					</div>
				</div>
				<div className="text-right">
					<div className="inline-block bg-[#01549B] text-white px-3 py-1 text-[10px] font-black uppercase mb-3 rounded-md">Original Copy</div>
					<h2 className="text-4xl font-black text-gray-100 uppercase leading-none mb-1">TAX INVOICE</h2>
					<div className="space-y-1">
						<p className="font-bold text-gray-400">INV NO: <span className="text-black">{invoice.invoiceNumber}</span></p>
						<p className="font-bold text-gray-400">DATE: <span className="text-black">{invoice.invoiceDate}</span></p>
					</div>
				</div>
			</div>

			{/* Client & Shipping Boxes */}
			<div className="grid grid-cols-2 gap-8 mb-8">
				<div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
					<p className="text-[9px] font-black text-[#01549B] uppercase tracking-widest mb-2 flex items-center gap-2">
						<div className="h-1.5 w-1.5 rounded-full bg-[#01549B]" /> 
						Billed To
					</p>
					<div className="space-y-1">
						<p className="text-sm font-bold text-black uppercase">{invoice.customerName}</p>
						<p className="text-gray-600 leading-snug">{invoice.customerAddress}</p>
						<p className="text-[9px] font-bold text-gray-400 mt-2">GSTIN: {invoice.customerGstin || 'Not Provided'}</p>
					</div>
				</div>
				<div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
					<p className="text-[9px] font-black text-[#2E7D32] uppercase tracking-widest mb-2 flex items-center gap-2">
						<div className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" /> 
						Shipment/Venue
					</p>
					<div className="space-y-1 text-gray-600">
						<p><span className="font-bold text-gray-400 uppercase text-[8px]">Event Venue:</span> {invoice.eventLocation || 'Same as Billing'}</p>
						<p><span className="font-bold text-gray-400 uppercase text-[8px]">Event Name:</span> {invoice.eventName || '-'}</p>
						<p><span className="font-bold text-gray-400 uppercase text-[8px]">Due Date:</span> <span className="text-red-500 font-bold">{invoice.dueDate}</span></p>
					</div>
				</div>
			</div>

			{/* Items Table - Clean Modern Style */}
			<div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-6">
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-[#01549B] text-white text-[9px] uppercase font-bold text-center">
							<th className="p-3 w-10">Sr.</th>
							<th className="p-3 text-left">Description of Goods/Services</th>
							<th className="p-3 w-16">HSN/SAC</th>
							<th className="p-3 w-20">Rate/Day</th>
							<th className="p-3 w-12">Qty</th>
							<th className="p-3 w-12">Days</th>
							<th className="p-3 w-28">Amount (₹)</th>
						</tr>
					</thead>
					<tbody className="text-center font-medium divide-y divide-gray-50 text-[10px]">
						{invoice.items.map((item, idx) => {
							const taxableValue = item.quantity * item.days * item.pricePerDay;
							const discount = item.discountType === 'percent'
								? (taxableValue * item.discount) / 100
								: item.discount;
							const total = taxableValue - discount + ((taxableValue - discount) * item.gstPercent / 100);

							return (
								<tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}>
									<td className="p-3 text-gray-300 font-bold">{idx + 1}</td>
									<td className="p-3 text-left">
										<p className="font-bold text-black uppercase tracking-tight">{item.itemName}</p>
										{item.description && <p className="text-[8px] text-gray-400 leading-tight mt-0.5">{item.description}</p>}
									</td>
									<td className="p-3 text-gray-400">9973xx</td>
									<td className="p-3 text-gray-600">₹{item.pricePerDay.toLocaleString('en-IN')}</td>
									<td className="p-3 text-gray-600">{item.quantity}</td>
									<td className="p-3 text-gray-600">{item.days}</td>
									<td className="p-3 font-bold text-[#01549B]">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Financial Breakdown Section */}
			<div className="grid grid-cols-12 gap-8 mb-8">
				<div className="col-span-7 space-y-4">
					<div className="bg-gray-50 p-4 rounded-xl">
						<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Banking & Wire Details</p>
						{paymentMethod && paymentMethod.type === 'bank' ? (
							<div className="grid grid-cols-2 gap-4 text-[9px]">
								<div>
									<p className="text-gray-300 uppercase font-black text-[7px] mb-0.5">Account Holder</p>
									<p className="font-bold leading-none">{paymentMethod.accountHolderName}</p>
								</div>
								<div>
									<p className="text-gray-300 uppercase font-black text-[7px] mb-0.5">Bank Name</p>
									<p className="font-bold leading-none">{paymentMethod.bankName}</p>
								</div>
								<div>
									<p className="text-gray-300 uppercase font-black text-[7px] mb-0.5">Account Number</p>
									<p className="font-bold leading-none text-[#01549B] text-xs">{paymentMethod.accountNumber}</p>
								</div>
								<div>
									<p className="text-gray-300 uppercase font-black text-[7px] mb-0.5">IFSC Code</p>
									<p className="font-bold leading-none">{paymentMethod.ifscCode}</p>
								</div>
							</div>
						) : (
							<p className="text-gray-300 italic text-[10px]">Payment details provided upon request</p>
						)}
					</div>
					<div>
						<p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1">Invoice Total in Words</p>
						<p className="font-black italic text-[#2E7D32] text-[12px] bg-[#2E7D32]/5 px-3 py-2 rounded-lg border border-[#2E7D32]/10 inline-block">{numberToWords(invoice.grandTotal)}</p>
					</div>
				</div>
				<div className="col-span-5 flex flex-col items-end">
					<div className="w-full space-y-1 bg-white p-2 rounded-xl">
						<div className="flex justify-between p-2 text-gray-500 font-bold uppercase text-[9px]">
							<span>Taxable Subtotal</span>
							<span className="text-black text-[11px]">₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
						</div>
						<div className="flex justify-between p-2 text-red-400 font-bold uppercase text-[9px]">
							<span>Promotional Discount</span>
							<span className="text-[11px]">-₹{invoice.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
						</div>
						<div className="flex justify-between p-2 text-gray-500 font-bold uppercase text-[9px]">
							<span>GST Value Added</span>
							<span className="text-black text-[11px]">₹{invoice.totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
						</div>
						<div className="flex justify-between p-4 bg-[#01549B] text-white rounded-xl shadow-lg shadow-blue-900/20 mt-2">
							<div className="flex flex-col">
								<span className="font-black uppercase tracking-[0.2em] text-[7px] text-white/50">Total Amount Due</span>
								<span className="text-xl font-black">₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
							</div>
							<div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
								<div className="h-6 w-6 bg-white/20 rounded-full" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footnote & Signature */}
			<div className="grid grid-cols-12 gap-8 border-t border-gray-50 pt-8">
				<div className="col-span-7 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
					<p className="font-black uppercase text-[8px] text-gray-400 mb-2">Terms and Conditions</p>
					<ul className="text-[8px] text-gray-500 space-y-1 list-disc pl-3">
						<li>Goods once rented are the responsibility of the client until safely returned.</li>
						<li>Quote validity is 7 days from the date of issuance.</li>
						<li>Full payment is expected by the due date mentioned above.</li>
					</ul>
				</div>
				<div className="col-span-5 flex flex-col items-center">
					<div className="h-12 w-32 border-b-2 border-gray-200 mb-2 relative">
						<div className="absolute inset-0 flex items-center justify-center text-[20px] font-serif text-gray-200 uppercase pointer-events-none italic opacity-20">Verified</div>
					</div>
					<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Authorized Signatory</p>
					<p className="text-[10px] font-black text-[#01549B]">RENT MY EVENT</p>
				</div>
			</div>

			{/* Tech-Savvy Footer */}
			<div className="mt-12 flex justify-between items-end border-t border-gray-50 pt-4">
				<div className="flex gap-4">
					<div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center font-black text-[10px] text-gray-400">01</div>
					<div>
						<p className="text-[8px] font-black text-gray-300 uppercase">Document Status</p>
						<p className="text-[9px] font-bold text-green-500 uppercase">Finalized & Exported</p>
					</div>
				</div>
				<p className="text-[8px] font-bold text-gray-300 tracking-[0.4em] uppercase">Digitally Generated Invoice</p>
			</div>
		</div>
	);
};

export default InvoicePreview;
