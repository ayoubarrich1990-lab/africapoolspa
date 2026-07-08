import { Resend } from 'resend';
import type { VisitorTicket } from '../src/types.js';
import { generateBadgePdf } from './pdf.js';

// Lazy instantiation of the Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not defined.');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Sends a B2B accreditation email to the registered visitor with their PDF badge attached.
 */
export async function sendBadgeEmail(ticket: VisitorTicket, pdfBuffer?: Buffer): Promise<any> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [sendBadgeEmail] RESEND_API_KEY is not defined. Email delivery will be skipped.');
    return { skipped: true, reason: 'Missing API Key' };
  }

  try {
    const client = getResendClient();
    const sender = 'badge@africapoolspa.com';
    const filename = `Badge-${ticket.ticketNumber}.pdf`;

    console.log(`✉️ [sendBadgeEmail] Preparing email to ${ticket.email} for ticket ${ticket.ticketNumber}...`);

    const finalPdfBuffer = pdfBuffer || await generateBadgePdf(ticket);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Votre Badge – Africa Pool & Spa Expo 2026</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f7fafc;
            color: #2d3748;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f7fafc;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background-color: #050f22;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 4px solid #c8922a;
          }
          .header h1 {
            color: #ffffff;
            font-size: 22px;
            margin: 0 0 10px 0;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .header p {
            color: #c8922a;
            font-size: 14px;
            margin: 0;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            font-size: 18px;
            color: #050f22;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .content p {
            font-size: 15px;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 20px;
          }
          .info-card {
            background-color: #f8fafc;
            border-left: 4px solid #c8922a;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 4px 4px 0;
          }
          .info-row {
            margin-bottom: 10px;
            font-size: 14px;
          }
          .info-row:last-child {
            margin-bottom: 0;
          }
          .info-label {
            font-weight: bold;
            color: #050f22;
            display: inline-block;
            width: 130px;
          }
          .info-value {
            color: #4a5568;
          }
          .event-details {
            background-color: #050f22;
            color: #ffffff;
            padding: 25px;
            border-radius: 6px;
            margin-top: 30px;
          }
          .event-details h3 {
            margin-top: 0;
            font-size: 14px;
            color: #c8922a;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .event-details p {
            color: #ffffff;
            margin: 5px 0;
            font-size: 13px;
          }
          .footer {
            background-color: #edf2f7;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #718096;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>AFRICA POOL & SPA EXPO</h1>
              <p>20–22 OCTOBRE 2026 • CASABLANCA</p>
            </div>
            
            <!-- Content -->
            <div class="content">
              <h2>Bonjour ${ticket.firstName} ${ticket.lastName},</h2>
              
              <p>Nous vous remercions pour votre inscription au salon <strong>Africa Pool & Spa Expo 2026</strong>.</p>
              
              <p>Votre demande d’accréditation professionnelle B2B a été enregistrée avec succès. Vous trouverez votre badge d'accès au format PDF en pièce jointe de cet e-mail.</p>
              
              <p>Veuillez l’imprimer chez vous ou enregistrer le document PDF sur votre smartphone pour le présenter au comptoir d’accueil du salon à l’OFEC de Casablanca.</p>
              
              <div class="info-card">
                <div class="info-row">
                  <span class="info-label">Visiteur :</span>
                  <span class="info-value">${ticket.firstName} ${ticket.lastName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Entreprise :</span>
                  <span class="info-value">${ticket.company}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Poste :</span>
                  <span class="info-value">${ticket.jobTitle}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">N° Badge :</span>
                  <span class="info-value"><strong>${ticket.ticketNumber}</strong></span>
                </div>
              </div>
              
              <div class="event-details">
                <h3>Informations Pratiques</h3>
                <p><strong>Dates :</strong> Du 20 au 22 Octobre 2026</p>
                <p><strong>Horaires d'ouverture :</strong> 09h00 – 18h00</p>
                <p><strong>Lieu :</strong> Office des Foires et Expositions de Casablanca (OFEC)</p>
                <p><strong>Adresse :</strong> Rue de Boukraa, Casablanca (en face de la Mosquée Hassan II)</p>
              </div>
              
              <p style="margin-top: 30px;">Nous nous réjouissons de vous accueillir parmi nous pour cette édition d'exception.</p>
              <p>Cordialement,<br><em>L'équipe d'organisation Africa Pool & Spa Expo</em></p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p>© 2026 Africa Pool & Spa Expo. Tous droits réservés.</p>
              <p>Pour toute assistance, contactez-nous à l'adresse support@africapoolspa.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const data = await client.emails.send({
      from: sender,
      to: [ticket.email],
      subject: 'Votre Badge – Africa Pool & Spa Expo 2026',
      html: htmlContent,
      attachments: [
        {
          filename: filename,
          content: finalPdfBuffer,
        },
      ],
    });

    console.log(`✅ [sendBadgeEmail] Email sent successfully via Resend. ID: ${data.data?.id || 'unknown'}`);
    return data;
  } catch (err: any) {
    console.error('❌ [sendBadgeEmail] Error sending email via Resend:', err);
    // Return error information but don't rethrow (as required: failures must not block registration)
    return { error: true, message: err?.message || String(err) };
  }
}
