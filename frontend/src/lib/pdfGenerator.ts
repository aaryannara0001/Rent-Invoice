import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const generateInvoicePDF = async (invoiceId: string, customerName: string) => {
	const element = document.getElementById(`invoice-${invoiceId}`);
	if (!element) {
		toast.error('Invoice preview not found. Please save the invoice first.');
		return;
	}

	let toastId: string | number | undefined;
	try {
		toastId = toast.loading('Generating PDF...');

		// Create canvas from HTML
		const canvas = await html2canvas(element, {
			scale: 2,
			useCORS: true,
			logging: false,
			backgroundColor: '#ffffff',
			allowTaint: true,
		});

		const imgData = canvas.toDataURL('image/png');
		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		});

		const imgWidth = 210; // A4 width in mm
		const imgHeight = (canvas.height * imgWidth) / canvas.width;

		let heightLeft = imgHeight;
		let position = 0;

		// Add first page
		pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
		heightLeft -= 297; // A4 height in mm

		// Add additional pages if needed
		while (heightLeft >= 0) {
			position = heightLeft - imgHeight;
			pdf.addPage();
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= 297;
		}

		const fileName = `Invoice-${customerName}-${new Date().toISOString().split('T')[0]}.pdf`;
		pdf.save(fileName);
		toast.success('PDF downloaded successfully!', { id: toastId });
	} catch (error) {
		console.error('Error generating PDF:', error);
		toast.error('Failed to generate PDF. Please try again.', { id: (toastId as any) });
	}
};

export const generateQuotePDF = async (quoteId: string, customerName: string) => {
	const element = document.getElementById(`quote-${quoteId}`);
	if (!element) {
		toast.error('Quote preview not found. Please save the quote first.');
		return;
	}

	let toastId: string | number | undefined;
	try {
		toastId = toast.loading('Generating PDF...');

		// Create canvas from HTML
		const canvas = await html2canvas(element, {
			scale: 2,
			useCORS: true,
			logging: false,
			backgroundColor: '#ffffff',
			allowTaint: true,
		});

		const imgData = canvas.toDataURL('image/png');
		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		});

		const imgWidth = 210; // A4 width in mm
		const imgHeight = (canvas.height * imgWidth) / canvas.width;

		let heightLeft = imgHeight;
		let position = 0;

		// Add first page
		pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
		heightLeft -= 297; // A4 height in mm

		// Add additional pages if needed
		while (heightLeft >= 0) {
			position = heightLeft - imgHeight;
			pdf.addPage();
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= 297;
		}

		const fileName = `Quote-${customerName}-${new Date().toISOString().split('T')[0]}.pdf`;
		pdf.save(fileName);
		toast.success('PDF downloaded successfully!', { id: toastId });
	} catch (error) {
		console.error('Error generating PDF:', error);
		toast.error('Failed to generate PDF. Please try again.', { id: (toastId as any) });
	}
};

export const generatePDFBlob = async (elementId: string): Promise<string | null> => {
	try {
		const element = document.getElementById(elementId);
		if (!element) {
			return null;
		}

		// Create canvas from HTML
		const canvas = await html2canvas(element, {
			scale: 2,
			useCORS: true,
			logging: false,
			backgroundColor: '#ffffff',
			allowTaint: true,
		});

		const imgData = canvas.toDataURL('image/png');
		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		});

		const imgWidth = 210; // A4 width in mm
		const imgHeight = (canvas.height * imgWidth) / canvas.width;

		let heightLeft = imgHeight;
		let position = 0;

		// Add first page
		pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
		heightLeft -= 297; // A4 height in mm

		// Add additional pages if needed
		while (heightLeft >= 0) {
			position = heightLeft - imgHeight;
			pdf.addPage();
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= 297;
		}

		return pdf.output('bloburl').toString();
	} catch (error) {
		console.error('Error generating PDF blob:', error);
		return null;
	}
};
