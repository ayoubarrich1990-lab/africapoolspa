import { sendAdminSecurityEmail } from './email.js';

export interface AdminVerificationSession {
  code: string;
  method: 'gmail';
  email: string;
  createdAt: number;
  expiresAt: number;
  attemptsLeft: number;
  verified: boolean;
  token?: string;
}

// In-memory verification state (resilient for current container lifespan)
let currentSession: AdminVerificationSession | null = null;

// Configured admin coordinates
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_VERIFICATION_EMAIL || 'ayoubarrich1990@gmail.com';

export function getAdminVerificationConfig() {
  return {
    email: DEFAULT_ADMIN_EMAIL,
    maskedEmail: maskEmail(DEFAULT_ADMIN_EMAIL),
  };
}

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 3) return `${name.charAt(0)}***@${domain}`;
  return `${name.substring(0, 2)}••••${name.substring(name.length - 2)}@${domain}`;
}

/**
 * Generate a new 6-digit OTP and dispatches it via Email (Gmail / Resend).
 */
export async function sendAdminVerificationCode(params: {
  method?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
}): Promise<{
  success: boolean;
  message: string;
  method: 'gmail';
  targetEmail: string;
  maskedEmail: string;
  expiresInSeconds: number;
  emailDeliveryStatus?: string;
}> {
  const targetEmail = (params.email || DEFAULT_ADMIN_EMAIL).trim();

  // Generate 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const validityMinutes = 10;
  const expiresAt = now + validityMinutes * 60 * 1000;

  currentSession = {
    code,
    method: 'gmail',
    email: targetEmail,
    createdAt: now,
    expiresAt,
    attemptsLeft: 5,
    verified: false,
  };

  let emailStatus = 'En cours';

  // Send to Gmail / Resend
  try {
    const emailRes = await sendAdminSecurityEmail(
      targetEmail,
      code,
      params.ip || '105.158.***',
      params.userAgent || 'Navigateur'
    );
    if (emailRes.success) {
      if (emailRes.skipped) {
        emailStatus = `Envoyé sur ${targetEmail} (Mode simulation active)`;
      } else if (emailRes.actualRecipient && emailRes.actualRecipient !== targetEmail) {
        emailStatus = `Délivré via Resend à l'adresse du compte (${emailRes.actualRecipient}) - ID: ${emailRes.id || 'ok'}`;
      } else {
        emailStatus = `Délivré avec succès par Resend sur ${targetEmail} - ID: ${emailRes.id || 'ok'}`;
      }
    } else {
      emailStatus = `Tentative d'envoi vers ${targetEmail} (Erreur Resend: ${emailRes.error || 'inconnue'})`;
    }
  } catch (e: any) {
    emailStatus = `Simulation active pour ${targetEmail}`;
  }

  return {
    success: true,
    message: `Code de sécurité envoyé par e-mail à ${maskEmail(targetEmail)}.`,
    method: 'gmail',
    targetEmail,
    maskedEmail: maskEmail(targetEmail),
    expiresInSeconds: validityMinutes * 60,
    emailDeliveryStatus: emailStatus,
  };
}

/**
 * Validates the 6-digit OTP code entered by the user.
 */
export function verifyAdminOtpCode(inputCode: string): {
  success: boolean;
  message: string;
  token?: string;
  attemptsLeft?: number;
  expired?: boolean;
} {
  if (!currentSession) {
    return {
      success: false,
      message: 'Aucun code de vérification actif. Veuillez demander un nouveau code par e-mail.',
    };
  }

  const now = Date.now();
  if (now > currentSession.expiresAt) {
    currentSession = null;
    return {
      success: false,
      expired: true,
      message: 'Le code de sécurité a expiré (validité 10 minutes dépassée). Veuillez demander un nouveau code.',
    };
  }

  if (currentSession.attemptsLeft <= 0) {
    currentSession = null;
    return {
      success: false,
      message: 'Nombre maximal de tentatives atteint (5/5). Pour des raisons de sécurité, demandez un nouveau code.',
    };
  }

  const cleanInput = (inputCode || '').replace(/\s+/g, '').trim();

  if (cleanInput === currentSession.code) {
    currentSession.verified = true;
    const token = `apse-adm-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    currentSession.token = token;

    return {
      success: true,
      message: 'Validation de sécurité 2FA réussie. Accès à la console administrateur autorisé.',
      token,
    };
  }

  currentSession.attemptsLeft -= 1;
  const remaining = currentSession.attemptsLeft;

  return {
    success: false,
    attemptsLeft: remaining,
    message: `Code de vérification incorrect. ${remaining > 0 ? `Il vous reste ${remaining} tentative(s).` : 'Session verrouillée. Demandez un nouveau code.'}`,
  };
}
