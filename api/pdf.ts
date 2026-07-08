import PDFDocument from 'pdfkit';
import { generateQrBuffer } from './qr.js';
import type { VisitorTicket } from '../src/types.js';

/**
 * Generates a professional PDF badge for Africa Pool & Spa Expo 2026.
 * It is formatted as a compact standard badge (300 x 450 points, approx 10.5cm x 15cm)
 * perfect for showing on smartphone screens or printing.
 */
export async function generateBadgePdf(ticket: VisitorTicket): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      // Create a document with custom badge size
      const doc = new PDFDocument({
        size: [300, 450],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // 1. Draw solid Navy Background (#050f22)
      doc.rect(0, 0, 300, 450).fill('#050f22');

      // 2. Gold Top Accent Line (#c8922a)
      doc.rect(0, 0, 300, 10).fill('#c8922a');

      // 3. Premium Header Ribbon
      doc.rect(0, 10, 300, 32).fill('#101f3c');
      
      // Draw B2B Accreditation Text in Gold
      doc.fillColor('#c8922a')
         .fontSize(8.5)
         .font('Helvetica-Bold')
         .text('ACCRÉDITATION B2B  •  PASS 3 JOURS', 0, 22, { align: 'center', characterSpacing: 1 });

      // 4. Main Title/Expo branding
      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('AFRICA POOL & SPA EXPO', 0, 62, { align: 'center', characterSpacing: 1 });
         
      doc.fillColor('#c8922a')
         .fontSize(10.5)
         .font('Helvetica-Bold')
         .text('2026', 0, 77, { align: 'center', characterSpacing: 2 });

      // Fine golden divider line
      doc.strokeColor('rgba(200, 146, 42, 0.35)')
         .lineWidth(1)
         .moveTo(40, 100)
         .lineTo(260, 100)
         .stroke();

      // 5. Visitor Name (Large & Legible)
      const fullName = `${ticket.firstName.toUpperCase()} ${ticket.lastName.toUpperCase()}`;
      doc.fillColor('#ffffff')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(fullName, 15, 120, { align: 'center', width: 270 });

      // Visitor Job Title
      doc.fillColor('#c8922a')
         .fontSize(9.5)
         .font('Helvetica-Bold')
         .text(ticket.jobTitle || 'Professionnel', 15, doc.y + 6, { align: 'center', width: 270 });

      // Visitor Company
      doc.fillColor('#ffffff')
         .fontSize(11)
         .font('Helvetica')
         .text(ticket.company, 15, doc.y + 4, { align: 'center', width: 270 });

      // Sector interest (small accent tag)
      if (ticket.sectorInterest) {
        doc.fillColor('#90aec0')
           .fontSize(7.5)
           .font('Helvetica-Oblique')
           .text(`Secteur : ${ticket.sectorInterest}`, 15, doc.y + 6, { align: 'center', width: 270 });
      }

      // Thin divider
      doc.strokeColor('rgba(200, 146, 42, 0.2)')
         .lineWidth(0.5)
         .moveTo(60, doc.y + 12)
         .lineTo(240, doc.y + 12)
         .stroke();

      // 6. Generate and Embed QR Code
      const qrText = ticket.ticketNumber;
      const qrBuffer = await generateQrBuffer(qrText);
      
      const qrSize = 100;
      const qrX = (300 - qrSize) / 2;
      const qrY = 225;
      
      // White container box for QR Code visibility/contrast
      doc.rect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16).fill('#ffffff');
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      // Mini text inside the QR frame area
      doc.fillColor('#050f22')
         .fontSize(7.5)
         .font('Helvetica-Bold')
         .text(`APS ${ticket.ticketNumber.slice(-5)}`, qrX, qrY + qrSize + 2, { align: 'center', width: qrSize });

      // 7. Footer Divider
      doc.strokeColor('rgba(200, 146, 42, 0.35)')
         .lineWidth(1)
         .moveTo(40, 365)
         .lineTo(260, 365)
         .stroke();

      // 8. Event Information details
      doc.fillColor('#ffffff')
         .fontSize(8.5)
         .font('Helvetica-Bold')
         .text('20 - 22 OCTOBRE 2026', 0, 378, { align: 'center' });

      doc.fillColor('#a0aec0')
         .fontSize(8)
         .font('Helvetica')
         .text('OFEC CASABLANCA • MAROC', 0, 392, { align: 'center' });

      doc.fillColor('#c8922a')
         .fontSize(8.5)
         .font('Helvetica-Bold')
         .text(`TICKET N° : ${ticket.ticketNumber}`, 0, 412, { align: 'center', characterSpacing: 0.5 });

      // 9. Gold Bottom Accent Line
      doc.rect(0, 440, 300, 10).fill('#c8922a');

      // Finalize document stream
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
