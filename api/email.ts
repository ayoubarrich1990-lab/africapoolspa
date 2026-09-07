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

/**
 * Sends a high-security Two-Factor Authentication (2FA) verification code to the Administrator via Gmail / Resend.
 */
export async function sendAdminSecurityEmail(
  toEmail: string,
  code: string,
  ipAddress = 'Inconnue',
  userAgent = 'Navigateur Web'
): Promise<{ success: boolean; id?: string; error?: string; skipped?: boolean; actualRecipient?: string; note?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [sendAdminSecurityEmail] RESEND_API_KEY not defined. Email simulated.');
    return { success: true, skipped: true };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Code de Sécurité Administrateur – Africa Pool & Spa Expo 2026</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #050f22;
          color: #e2e8f0;
          margin: 0;
          padding: 0;
        }
        .wrapper {
          width: 100%;
          background-color: #050f22;
          padding: 40px 15px;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background-color: #0a1f44;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #c8922a;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .header {
          background: linear-gradient(135deg, #050f22 0%, #0a1f44 100%);
          padding: 35px 25px;
          text-align: center;
          border-bottom: 2px solid #c8922a;
        }
        .header h1 {
          color: #c8922a;
          font-size: 20px;
          margin: 0 0 8px 0;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .header p {
          color: #ffffff;
          font-size: 13px;
          margin: 0;
          letter-spacing: 1px;
        }
        .content {
          padding: 35px 30px;
          text-align: center;
        }
        .badge-title {
          display: inline-block;
          background-color: rgba(200, 146, 42, 0.15);
          color: #c8922a;
          border: 1px solid rgba(200, 146, 42, 0.4);
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 15px;
        }
        .otp-box {
          background-color: #050f22;
          border: 2px dashed #c8922a;
          border-radius: 10px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 38px;
          font-weight: 900;
          letter-spacing: 8px;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 0 10px rgba(200, 146, 42, 0.4);
        }
        .otp-validity {
          color: #c8922a;
          font-size: 12px;
          margin-top: 8px;
          font-weight: 600;
        }
        .security-notice {
          background-color: rgba(255, 255, 255, 0.03);
          border-left: 3px solid #c8922a;
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.6;
          margin-top: 25px;
          border-radius: 0 6px 6px 0;
        }
        .details-table {
          width: 100%;
          margin-top: 20px;
          font-size: 12px;
          text-align: left;
          border-collapse: collapse;
          color: #cbd5e1;
        }
        .details-table td {
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        .details-table td.label {
          color: #64748b;
          width: 35%;
        }
        .footer {
          background-color: #050f22;
          padding: 20px;
          text-align: center;
          font-size: 11px;
          color: #64748b;
          border-top: 1px solid rgba(200, 146, 42, 0.2);
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>AFRICA POOL &amp; SPA EXPO 2026</h1>
            <p>OFEC Casablanca • Espace Administrateur Sécurisé</p>
          </div>
          <div class="content">
            <span class="badge-title">🔒 Validation à Deux Facteurs (2FA)</span>
            <h2 style="color: #ffffff; font-size: 18px; margin: 10px 0 15px 0;">Validation de Sécurité Administrateur</h2>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0;">
              Une tentative de connexion à la console d'administration Africa Pool &amp; Spa Expo 2026 a été initiée. Veuillez saisir le code de vérification ci-dessous :
            </p>

            <div class="otp-box">
              <div class="otp-code">${code}</div>
              <div class="otp-validity">⏱️ Ce code expire dans 10 minutes</div>
            </div>

            <table class="details-table">
              <tr>
                <td class="label">Méthode de validation :</td>
                <td><strong>Vérification par E-mail</strong></td>
              </tr>
              <tr>
                <td class="label">Compte administrateur :</td>
                <td><strong>${toEmail}</strong></td>
              </tr>
              <tr>
                <td class="label">Adresse IP :</td>
                <td><code>${ipAddress}</code></td>
              </tr>
              <tr>
                <td class="label">Date &amp; Heure :</td>
                <td>${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })} (Heure Maroc)</td>
              </tr>
            </table>

            <div class="security-notice">
              ⚠️ <strong>Règle de sécurité stricte :</strong> Ne communiquez jamais ce code à un tiers. Aucun membre de l'organisation ne vous demandera votre code par message ou téléphone.
            </div>
          </div>
          <div class="footer">
            © 2026 Africa Pool &amp; Spa Expo • Casablanca, Maroc • Tous droits réservés
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();
    // Validate sender: Resend rejects sending from free domains like @gmail.com unless domain is verified
    let sender = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    if (sender.includes('@gmail.com') || sender.includes('@yahoo.') || sender.includes('@hotmail.')) {
      console.warn(`⚠️ [sendAdminSecurityEmail] Sender "${sender}" is a free webmail domain not verifiable on Resend. Falling back to "onboarding@resend.dev".`);
      sender = 'Africa Pool & Spa Expo <onboarding@resend.dev>';
    }

    console.log(`✉️ [sendAdminSecurityEmail] Sending OTP code to Gmail ${toEmail} from ${sender}...`);

    let res = await client.emails.send({
      from: sender,
      to: [toEmail],
      subject: `🔐 Code de Sécurité : ${code} – Africa Pool & Spa Expo 2026`,
      html: htmlContent,
    });

    if (res.error) {
      console.warn(`⚠️ [sendAdminSecurityEmail] First send attempt returned error:`, res.error);
      // If error is about unverified domain in "from"
      if (res.error.message?.includes('not verified') && sender !== 'onboarding@resend.dev') {
        res = await client.emails.send({
          from: 'onboarding@resend.dev',
          to: [toEmail],
          subject: `🔐 Code de Sécurité : ${code} – Africa Pool & Spa Expo 2026`,
          html: htmlContent,
        });
      }

      // If error is: "You can only send testing emails to your own email address (xyz@gmail.com)"
      if (res.error?.message?.includes('You can only send testing emails to your own email address')) {
        const match = res.error.message.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
        const ownerEmail = match ? match[1] : null;
        if (ownerEmail && ownerEmail !== toEmail) {
          console.log(`🔄 [sendAdminSecurityEmail] Resend test domain restriction: Forwarding to verified account owner email ${ownerEmail}...`);
          const ownerRes = await client.emails.send({
            from: 'onboarding@resend.dev',
            to: [ownerEmail],
            subject: `🔐 Code de Sécurité : ${code} – Africa Pool & Spa Expo 2026`,
            html: htmlContent,
          });
          if (ownerRes.data?.id) {
            console.log(`✅ [sendAdminSecurityEmail] Successfully delivered OTP to account email ${ownerEmail} (ID: ${ownerRes.data.id})`);
            return {
              success: true,
              id: ownerRes.data.id,
              actualRecipient: ownerEmail,
              note: `Code envoyé à l'adresse de votre compte Resend (${ownerEmail}).`,
            };
          }
        }
      }

      if (res.error) {
        return { success: false, error: res.error.message };
      }
    }

    console.log(`✅ [sendAdminSecurityEmail] Sent OTP to ${toEmail} with id ${res.data?.id}`);
    return { success: true, id: res.data?.id };
  } catch (err: any) {
    console.error('❌ [sendAdminSecurityEmail] Exception during Resend call:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Diagnostic test function for checking Resend connectivity and sending a test email.
 */
export async function testResendConnection(customRecipient?: string): Promise<{
  success: boolean;
  message: string;
  resendApiKeyConfigured: boolean;
  configuredSender: string;
  actualSenderUsed: string;
  recipientAttempted: string;
  emailId?: string;
  errorDetails?: any;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const configuredSender = process.env.RESEND_FROM_EMAIL || 'non configuré';
  if (!apiKey) {
    return {
      success: false,
      message: 'RESEND_API_KEY n’est pas définie dans les variables d’environnement.',
      resendApiKeyConfigured: false,
      configuredSender,
      actualSenderUsed: 'none',
      recipientAttempted: customRecipient || 'none',
    };
  }

  try {
    const client = getResendClient();
    let sender = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    if (sender.includes('@gmail.com') || sender.includes('@yahoo.') || sender.includes('@hotmail.')) {
      sender = 'Africa Pool & Spa Expo <onboarding@resend.dev>';
    }

    const recipient = customRecipient || 'digitalrh8@gmail.com';

    console.log(`🧪 [testResendConnection] Testing delivery to ${recipient} from ${sender}...`);

    let res = await client.emails.send({
      from: sender,
      to: [recipient],
      subject: `🧪 Test de Connexion Resend – Africa Pool & Spa Expo 2026 (${new Date().toLocaleTimeString('fr-FR')})`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #050f22; color: #ffffff; padding: 30px; border-radius: 12px; border: 2px solid #c8922a;">
          <h2 style="color: #c8922a; margin-top: 0;">✅ Test API Resend Réussi !</h2>
          <p>Félicitations ! Votre clé d'API Resend fonctionne parfaitement et est capable d'expédier des emails en temps réel.</p>
          <div style="background-color: #0a1f44; padding: 15px; border-radius: 8px; border: 1px solid rgba(200,146,42,0.3); margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date d'expédition :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })} (Maroc)</p>
            <p style="margin: 5px 0;"><strong>Destinataire :</strong> ${recipient}</p>
            <p style="margin: 5px 0;"><strong>Expéditeur :</strong> ${sender}</p>
            <p style="margin: 5px 0;"><strong>Statut :</strong> Délivré en boîte de réception</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Salon Africa Pool & Spa Expo 2026 • OFEC Casablanca</p>
        </div>
      `,
    });

    if (res.error) {
      // If domain error, retry with onboarding@resend.dev
      if (res.error.message?.includes('not verified')) {
        sender = 'onboarding@resend.dev';
        res = await client.emails.send({
          from: sender,
          to: [recipient],
          subject: `🧪 Test de Connexion Resend – Africa Pool & Spa Expo 2026`,
          html: `<p>Test avec sender onboarding@resend.dev réussi !</p>`,
        });
      }
    }

    if (res.error) {
      return {
        success: false,
        message: `Erreur retournée par Resend: ${res.error.message}`,
        resendApiKeyConfigured: true,
        configuredSender,
        actualSenderUsed: sender,
        recipientAttempted: recipient,
        errorDetails: res.error,
      };
    }

    return {
      success: true,
      message: `E-mail de test envoyé avec succès via Resend à ${recipient} !`,
      resendApiKeyConfigured: true,
      configuredSender,
      actualSenderUsed: sender,
      recipientAttempted: recipient,
      emailId: res.data?.id,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Exception lors du test Resend: ${err?.message || String(err)}`,
      resendApiKeyConfigured: true,
      configuredSender,
      actualSenderUsed: 'error',
      recipientAttempted: customRecipient || 'none',
      errorDetails: err,
    };
  }
}

