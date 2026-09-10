import PDFDocument from 'pdfkit';
import type { VisitorTicket } from '../src/types.js';

/**
 * Generates a modern, high-end professional PDF badge for Africa Pool & Spa Expo 2026.
 * Dimensions: standard portrait event badge (300 x 450 pt).
 * Styled with modern executive typography, lanyard slot, security barcode strip,
 * and official event accreditation credentials (without QR code).
 */
export async function generateBadgePdf(ticket: VisitorTicket): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [300, 450],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // 1. Deep Midnight Executive Canvas (#040d1e)
      doc.rect(0, 0, 300, 450).fill('#040d1e');

      // Top & Bottom Gold Foil Accent Bars (#c8922a)
      doc.rect(0, 0, 300, 6).fill('#c8922a');
      doc.rect(0, 444, 300, 6).fill('#c8922a');

      // 2. Realistic Lanyard Slot Cutout (Top Center)
      doc.roundedRect(120, 14, 60, 7, 3.5).fill('#000000');
      doc.roundedRect(120, 14, 60, 7, 3.5).lineWidth(0.8).strokeColor('#c8922a').stroke();

      // 3. Header Ribbon: B2B Accreditation
      doc.roundedRect(20, 30, 260, 24, 4).fill('#0f2244');
      doc.roundedRect(20, 30, 260, 24, 4).lineWidth(0.5).strokeColor('rgba(200, 146, 42, 0.4)').stroke();
      
      doc.fillColor('#dfa942')
         .fontSize(8)
         .font('Helvetica-Bold')
         .text('ACCRÉDITATION PROFESSIONNELLE B2B', 20, 35, { align: 'center', width: 260, characterSpacing: 1.2 });
      doc.fillColor('#94a3b8')
         .fontSize(6.5)
         .font('Helvetica')
         .text('PASS 3 JOURS  •  ACCÈS EXPOSITION & CONFÉRENCES', 20, 44, { align: 'center', width: 260, characterSpacing: 0.5 });

      // 4. Exhibition Brand Header
      doc.fillColor('#94a3b8')
         .fontSize(7.5)
         .font('Helvetica-Bold')
         .text('SALON INTERNATIONAL DE LA PISCINE ET DU SPA', 10, 64, { align: 'center', width: 280, characterSpacing: 0.8 });
          
      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('AFRICA POOL & SPA EXPO 2026', 10, 75, { align: 'center', width: 280, characterSpacing: 1 });

      doc.fillColor('#c8922a')
         .fontSize(7)
         .font('Helvetica')
         .text('CASABLANCA • EDITION OFFICIELLE', 10, 91, { align: 'center', width: 280, characterSpacing: 1.5 });

      // Fine golden divider line
      doc.strokeColor('rgba(200, 146, 42, 0.3)')
         .lineWidth(0.8)
         .moveTo(35, 103)
         .lineTo(265, 103)
         .stroke();

      // 5. Modern Visitor Credential Card (Frosted Card Container)
      doc.roundedRect(18, 112, 264, 118, 6).fill('#0a1b38');
      doc.roundedRect(18, 112, 264, 118, 6).lineWidth(1).strokeColor('rgba(200, 146, 42, 0.45)').stroke();

      // Mini top label inside card
      doc.fillColor('#c8922a')
         .fontSize(6.5)
         .font('Helvetica-Bold')
         .text('VISITEUR OFFICIEL', 25, 122, { align: 'center', width: 250, characterSpacing: 1.5 });

      // Visitor Full Name (Large, crisp & modern)
      const fullName = `${ticket.firstName} ${ticket.lastName}`.toUpperCase();
      doc.fillColor('#ffffff')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(fullName, 25, 134, { align: 'center', width: 250 });

      // Job Title
      const jobTitle = ticket.jobTitle || 'Professionnel / Dirigeant';
      doc.fillColor('#dfa942')
         .fontSize(9.5)
         .font('Helvetica-Bold')
         .text(jobTitle, 25, doc.y + 4, { align: 'center', width: 250 });

      // Company
      doc.fillColor('#e2e8f0')
         .fontSize(11)
         .font('Helvetica')
         .text(ticket.company, 25, doc.y + 3, { align: 'center', width: 250 });

      // Sector of interest badge pill
      if (ticket.sectorInterest) {
        const sectorY = Math.min(doc.y + 6, 205);
        doc.roundedRect(30, sectorY, 240, 16, 3).fill('#06142a');
        doc.roundedRect(30, sectorY, 240, 16, 3).lineWidth(0.5).strokeColor('rgba(200, 146, 42, 0.3)').stroke();
        doc.fillColor('#93c5fd')
           .fontSize(7)
           .font('Helvetica')
           .text(`Secteur : ${ticket.sectorInterest}`, 30, sectorY + 4.5, { align: 'center', width: 240 });
      }

      // 6. Modern Access & Security Identification Bar (Replaces old QR code)
      doc.roundedRect(18, 238, 264, 92, 6).fill('#07152b');
      doc.roundedRect(18, 238, 264, 92, 6).lineWidth(0.8).strokeColor('rgba(200, 146, 42, 0.3)').stroke();

      // Top Security badge status
      doc.fillColor('#10b981')
         .fontSize(7)
         .font('Helvetica-Bold')
         .text('● ACCRÉDITATION VALIDE  •  ACCÈS COUPE-FILE', 25, 248, { align: 'center', width: 250, characterSpacing: 0.8 });

      // High-precision modern vertical barcode lines (generated dynamically from ticketNumber)
      const barcodeX = 35;
      const barcodeY = 262;
      const barcodeWidth = 230;
      const barcodeHeight = 32;

      // Clean white/light contrast background for barcode
      doc.rect(barcodeX - 5, barcodeY - 3, barcodeWidth + 10, barcodeHeight + 6).fill('#ffffff');

      // Draw stylized barcode lines
      let curX = barcodeX + 6;
      const hashStr = ticket.ticketNumber + 'AFRICAPOOL2026';
      for (let i = 0; i < 48; i++) {
        const charCode = hashStr.charCodeAt(i % hashStr.length);
        const lineWidth = (charCode % 3 === 0) ? 2.5 : ((charCode % 2 === 0) ? 1.5 : 0.8);
        const gap = (charCode % 4 === 0) ? 3 : 2;
        if (curX + lineWidth < barcodeX + barcodeWidth - 6) {
          doc.rect(curX, barcodeY, lineWidth, barcodeHeight).fill('#050f22');
          curX += lineWidth + gap;
        }
      }

      // Ticket ID & Reference number
      doc.fillColor('#050f22')
         .fontSize(7.5)
         .font('Helvetica-Bold')
         .text(ticket.ticketNumber, barcodeX, barcodeY + barcodeHeight - 6, { align: 'center', width: barcodeWidth, characterSpacing: 1.5 });

      // Mini text under barcode box
      doc.fillColor('#c8922a')
         .fontSize(7.5)
         .font('Helvetica-Bold')
         .text(`RÉF. ACCRÉDITATION : ${ticket.ticketNumber}`, 25, 312, { align: 'center', width: 250, characterSpacing: 0.8 });

      // 7. Event Dates & Venue Cards (Modern side-by-side grid)
      const boxY = 338;
      // Left box: Dates & Schedule
      doc.roundedRect(18, boxY, 128, 54, 4).fill('#0a1b38');
      doc.roundedRect(18, boxY, 128, 54, 4).lineWidth(0.5).strokeColor('rgba(255, 255, 255, 0.08)').stroke();
      doc.fillColor('#c8922a')
         .fontSize(6.5)
         .font('Helvetica-Bold')
         .text('DATES & HORAIRES', 22, boxY + 8, { align: 'center', width: 120, characterSpacing: 0.8 });
      doc.fillColor('#ffffff')
         .fontSize(8.5)
         .font('Helvetica-Bold')
         .text('20 - 22 OCTOBRE 2026', 22, boxY + 20, { align: 'center', width: 120 });
      doc.fillColor('#94a3b8')
         .fontSize(7)
         .font('Helvetica')
         .text('09:00 - 18:00 (Mar-Jeu)', 22, boxY + 34, { align: 'center', width: 120 });

      // Right box: Location
      doc.roundedRect(154, boxY, 128, 54, 4).fill('#0a1b38');
      doc.roundedRect(154, boxY, 128, 54, 4).lineWidth(0.5).strokeColor('rgba(255, 255, 255, 0.08)').stroke();
      doc.fillColor('#c8922a')
         .fontSize(6.5)
         .font('Helvetica-Bold')
         .text('LIEU DU SALON', 158, boxY + 8, { align: 'center', width: 120, characterSpacing: 0.8 });
      doc.fillColor('#ffffff')
         .fontSize(8.5)
         .font('Helvetica-Bold')
         .text('OFEC CASABLANCA', 158, boxY + 20, { align: 'center', width: 120 });
      doc.fillColor('#94a3b8')
         .fontSize(7)
         .font('Helvetica')
         .text('Casablanca • Maroc', 158, boxY + 34, { align: 'center', width: 120 });

      // 8. Footer Official Authentication Line
      doc.fillColor('rgba(255, 255, 255, 0.4)')
         .fontSize(6.5)
         .font('Helvetica')
         .text('PRÉSENTEZ CE BADGE À L’ACCUEIL PROFESSIONNEL DE L’OFEC  •  DOCUMENT OFFICIEL', 10, 404, { align: 'center', width: 280 });

      doc.fillColor('#c8922a')
         .fontSize(7)
         .font('Helvetica-Bold')
         .text('www.africa-pool-spa-expo.com', 10, 420, { align: 'center', width: 280, characterSpacing: 0.5 });

      // Finalize document stream
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
