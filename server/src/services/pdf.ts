import PDFDocument from 'pdfkit';
import type { Response } from 'express';

export function sendIntakePDF(res: Response, data: {
  id: string;
  clientName: string;
  narrative: string;
  classification?: string;
  expiryDate?: string;
  badge?: string;
}) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=intake-${data.id}.pdf`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(res);

  doc.fontSize(18).text('Intake Summary', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Reference: ${data.id}`);
  doc.text(`Client: ${data.clientName}`);
  doc.text(`Classification: ${data.classification ?? '—'}`);
  if (data.expiryDate) doc.text(`Limitation Expiry: ${data.expiryDate} (${data.badge})`);
  doc.moveDown();
  doc.fontSize(12).text('Narrative:');
  doc.fontSize(11).text(data.narrative, { align: 'justify' });

  doc.end();
}
