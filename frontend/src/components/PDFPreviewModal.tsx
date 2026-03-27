import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Loader2 } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import QuotePreview from './QuotePreview';
import { Invoice, Quote } from '@/context/types';
import { generatePDFBlob, generateInvoicePDF, generateQuotePDF } from '@/lib/pdfGenerator';

interface PDFPreviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	type: 'invoice' | 'quote';
	data: Invoice | Quote | null;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ isOpen, onClose, type, data }) => {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen && data) {
			const generatePreview = async () => {
				setIsLoading(true);
				setPdfUrl(null);
				
				// Wait for the hidden preview to render
				setTimeout(async () => {
					const elementId = type === 'invoice' ? `invoice-${data.id}` : `quote-${data.id}`;
					const url = await generatePDFBlob(elementId);
					setPdfUrl(url);
					setIsLoading(false);
				}, 300);
			};

			generatePreview();
		} else {
			setPdfUrl(null);
		}
	}, [isOpen, data, type]);

	if (!data) return null;

	const handleDownload = () => {
		if (type === 'invoice') {
			generateInvoicePDF(data.id, data.customerName);
		} else {
			generateQuotePDF(data.id, data.customerName);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-5xl h-[90vh] flex flex-col bg-[#111827] border-[#1F2937] p-0 overflow-hidden">
				<DialogHeader className="p-4 pr-10 border-b border-[#1F2937] flex flex-row items-center justify-between space-y-0">
					<DialogTitle className="text-white">
						{type === 'invoice' ? 'Invoice' : 'Quote'} Preview - {type === 'invoice' ? (data as Invoice).invoiceNumber : (data as Quote).quoteNumber}
					</DialogTitle>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownload}
							className="bg-green-600 border-green-600 text-white hover:bg-green-700"
						>
							<Download className="h-4 w-4 mr-2" />
							Download
						</Button>
					</div>
				</DialogHeader>

				<div className="flex-1 bg-[#0B0F19] relative overflow-hidden flex items-center justify-center">
					{isLoading ? (
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
							<p className="text-gray-400">Generating PDF preview...</p>
						</div>
					) : pdfUrl ? (
						<iframe
							src={`${pdfUrl}#toolbar=0`}
							title="PDF Preview"
							className="w-full h-full border-none"
						/>
					) : (
						<p className="text-red-400">Failed to generate preview.</p>
					)}
				</div>

				{/* Hidden Preview Element to capture */}
				<div 
					className="absolute opacity-0 pointer-events-none" 
					style={{ left: '-9999px', top: '-9999px', width: '210mm' }}
				>
					{type === 'invoice' ? (
						<InvoicePreview invoice={data as Invoice} id={data.id} />
					) : (
						<QuotePreview quote={data as Quote} id={data.id} />
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PDFPreviewModal;
