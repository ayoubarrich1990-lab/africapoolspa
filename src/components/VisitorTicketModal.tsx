import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Ticket, 
  Sparkles, 
  Printer, 
  Download, 
  ShieldAlert, 
  Award, 
  Calendar, 
  MapPin, 
  Barcode,
  ShieldCheck,
  BadgeCheck,
  Copy,
  Share2,
  CheckCircle2,
  Mail,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { VisitorTicket } from '../types';

interface VisitorTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTicketObj: VisitorTicket) => void;
}

const INTERESTS = [
  'Pool Equipment & Accessories',
  'Water Treatment & ECO-filtration',
  'Spa & Wellness Solutions',
  'Outdoor Furniture & Landscaping',
  'Hospitality & Resort Management',
  'Digital Pool Automation'
];

export default function VisitorTicketModal({ isOpen, onClose, onSuccess }: VisitorTicketModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    email: '',
    phone: '',
    sectorInterest: INTERESTS[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<VisitorTicket | null>(null);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);

  if (!isOpen) return null;

  const registrationLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/?badge=true` 
    : 'https://africa-pool-spa-expo.com/?badge=true';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(registrationLink);
      } else {
        const input = document.createElement('input');
        input.value = registrationLink;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setHasCopiedLink(true);
      setTimeout(() => setHasCopiedLink(false), 3000);
    } catch (e) {
      console.error('Failed to copy link', e);
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `*AFRICA POOL & SPA EXPO 2026*\nSalon International de la Piscine et du Spa (Casablanca, Maroc)\n\nObtenez votre accréditation et e-Badge B2B d'accès gratuit pour les 3 jours :\n${registrationLink}`
  )}`;

  const emailShareUrl = `mailto:?subject=${encodeURIComponent(
    "Invitation & Badge B2B Gratuit - Africa Pool & Spa Expo 2026"
  )}&body=${encodeURIComponent(
    `Bonjour,\n\nVoici le lien d'inscription officiel pour obtenir votre badge d'accès professionnel gratuit (Pass 3 Jours) au Salon International de la Piscine et du Spa (Africa Pool & Spa Expo 2026) :\n\n${registrationLink}\n\nDates : 20 au 22 Octobre 2026\nLieu : OFEC Casablanca, Maroc\n\nÀ très bientôt !`
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    if (!formData.firstName || !formData.lastName || !formData.company || !formData.email || !formData.phone) {
      setErrorMsg('Veuillez renseigner toutes les informations de contact indispensables.');
      setIsSubmitting(false);
      return;
    }

    try {
      const resp = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!resp.ok) {
        let errMsg = 'Erreur lors de la création de l’accréditation.';
        try {
          const errData = await resp.json();
          errMsg = errData.error || errMsg;
        } catch {
          try {
            const rawText = await resp.text();
            if (rawText && rawText.length < 200) {
              errMsg = rawText;
            }
          } catch {}
        }
        throw new Error(errMsg);
      }

      const ticketObj = await resp.json();
      setGeneratedTicket(ticketObj);
      onSuccess(ticketObj);
      setIsDone(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur inconnue est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#050f22]/90 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white text-navy w-full max-w-lg rounded-lg shadow-2xl border border-gold/30 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between border-b border-gold/30 z-10">
          <div className="flex items-center gap-2">
            <Ticket className="text-gold h-5 w-5" />
            <span className="font-serif font-bold text-lg">Enregistrement Visiteur</span>
          </div>
          <button onClick={onClose} className="text-white hover:text-gold transition-colors block">
            <X className="h-6 w-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="p-6">
          {/* Direct registration link banner for sharing */}
          <div className="mb-4 bg-navy/5 border border-gold/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-bold text-navy text-[11px]">
                <Share2 className="h-3.5 w-3.5 text-gold" />
                <span>Lien direct d'inscription pour vos contacts :</span>
              </div>
              <div className="flex items-center gap-1.5">
                <a 
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Partager par WhatsApp"
                >
                  <span>WhatsApp</span>
                </a>
                <a 
                  href={emailShareUrl}
                  className="px-2 py-0.5 bg-navy hover:bg-navy-light text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Envoyer par Email"
                >
                  <Mail className="h-3 w-3" /> Email
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded p-1">
              <input 
                type="text" 
                readOnly 
                value={registrationLink}
                className="bg-transparent text-[11px] text-gray-700 font-mono flex-1 outline-none px-1 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                  hasCopiedLink 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gold hover:bg-gold-light text-navy'
                }`}
              >
                {hasCopiedLink ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copier
                  </>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isDone ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center pb-2">
                  <h4 className="font-serif text-lg font-bold text-navy">Accréditation B2B Gratuite</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                    Réservez votre e-badge d'accès pour les 3 jours du salon international à l'OFEC Casablanca.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Prénom *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-gold focus:outline-none"
                      placeholder="Ex: Charles"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Nom *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-gold focus:outline-none"
                      placeholder="Ex: Dupont"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Société / Établissement *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-gold focus:outline-none"
                    placeholder="Ex: Atlas Luxury Hotel Group"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Fonction / Poste *</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-gold focus:outline-none"
                    placeholder="Ex: Directeur d'établissement, Architecte..."
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Email Professionnel *</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-gold focus:outline-none"
                      placeholder="mon-email@societe.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Téléphone Mobile *</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-gold focus:outline-none"
                      placeholder="+212 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Secteur qui vous intéresse le plus *</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-gold focus:outline-none bg-white"
                    value={formData.sectorInterest}
                    onChange={(e) => setFormData({...formData, sectorInterest: e.target.value})}
                  >
                    {INTERESTS.map((int, idx) => (
                      <option key={idx} value={int}>{int}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-light p-3 rounded text-[10px] text-gray-500 flex items-start gap-2 leading-relaxed">
                  <ShieldAlert className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                  <span>
                    Accréditation réservée uniquement aux professionnels du secteur de l’hôtellerie, hôtellerie de plein air, spa managers, architectes, urbanistes, promoteurs et installateurs de piscines.
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs border border-gray-300 text-gray-600 rounded font-bold uppercase tracking-wider hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-gold text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gold-light hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Génération...' : 'Obtenir mon Badge Gratuit →'}
                  </button>
                </div>
              </form>
            ) : (
              // Badge Visual Deck!
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                  <Check className="h-6 w-6" />
                </div>

                <div className="text-center">
                  <h3 className="font-serif text-xl font-bold text-navy">Votre Badge est disponible !</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Présentez-le à l'entrée du salon ou imprimez-le dès aujourd'hui.
                  </p>
                </div>

                {/* MODERN VISITOR BADGE DRAWING (NO QR CODE) */}
                <div 
                  className="print-ticket border-2 border-gold/40 rounded-2xl overflow-hidden bg-gradient-to-b from-[#061226] via-[#091b3b] to-[#040c1a] shadow-2xl text-white max-w-sm mx-auto relative font-sans select-none"
                >
                  {/* Subtle decorative background watermark / light sheen */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(200,146,42,0.18),transparent_50%)] pointer-events-none" />
                  <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-gold/5 blur-2xl pointer-events-none" />
                  <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-sky-500/5 blur-2xl pointer-events-none" />

                  {/* Top Gold Accent Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#b37e1f] via-[#e5b352] to-[#b37e1f]" />

                  {/* Lanyard Cutout Slot Guide */}
                  <div className="pt-3 pb-1 flex justify-center">
                    <div className="w-14 h-2.5 rounded-full bg-black/70 border border-gold/40 shadow-inner flex items-center justify-center">
                      <div className="w-8 h-1 rounded-full bg-white/20" />
                    </div>
                  </div>

                  {/* Accreditation Header Ribbon */}
                  <div className="mx-4 mt-2 mb-3 bg-gradient-to-r from-navy via-[#0d2248] to-navy px-3 py-1.5 rounded-lg border border-gold/30 flex items-center justify-between text-[10px] font-bold tracking-wider">
                    <span className="flex items-center gap-1.5 text-gold">
                      <Award className="h-3.5 w-3.5 text-gold" /> ACCRÉDITATION B2B
                    </span>
                    <span className="text-white/90 bg-gold/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-gold-light border border-gold/30">
                      PASS 3 JOURS
                    </span>
                  </div>

                  {/* Exhibition Branding */}
                  <div className="px-5 text-center space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-gray-300">
                      SALON INTERNATIONAL DE LA PISCINE ET DU SPA
                    </div>
                    <div className="text-xs uppercase font-extrabold tracking-widest text-gold font-serif">
                      AFRICA POOL &amp; SPA EXPO 2026
                    </div>
                    <div className="text-[9px] text-gray-400 tracking-wider font-mono">
                      20 - 22 OCTOBRE 2026 • OFEC CASABLANCA
                    </div>
                  </div>

                  {/* Golden hairline divider */}
                  <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-3" />

                  {/* Visitor Profile Card (Frosted Glass Container) */}
                  <div className="mx-4 bg-white/[0.04] border border-white/10 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg relative space-y-2">
                    <div className="inline-flex items-center gap-1 text-[9px] font-bold text-gold uppercase tracking-widest font-mono">
                      <BadgeCheck className="h-3 w-3 text-gold" /> VISITEUR OFFICIEL
                    </div>

                    <h4 className="text-xl font-black uppercase tracking-tight text-white font-sans leading-tight">
                      {generatedTicket?.firstName} {generatedTicket?.lastName}
                    </h4>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gold font-mono tracking-wide">
                        {generatedTicket?.jobTitle || 'Professionnel'}
                      </p>
                      <p className="text-xs font-medium text-slate-200">
                        {generatedTicket?.company}
                      </p>
                    </div>

                    {generatedTicket?.sectorInterest && (
                      <div className="pt-1">
                        <span className="inline-block px-2.5 py-0.5 bg-gold/10 text-gold-light border border-gold/30 rounded-full text-[9px] font-mono">
                          {generatedTicket.sectorInterest}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Modern Security & Access Identification Bar (No QR Code) */}
                  <div className="mx-4 mt-3 bg-[#030a17]/90 border border-gold/25 rounded-xl p-3 text-center space-y-2">
                    {/* Live Validation Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[9px] font-bold text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACCRÉDITATION VALIDÉE • ACCÈS COUPE-FILE
                    </div>

                    {/* Stylized Modern Barcode Strip */}
                    <div className="bg-white rounded-md p-2 flex flex-col items-center justify-center shadow-sm">
                      <div className="flex items-center justify-center gap-[2px] h-9 w-full px-2 overflow-hidden">
                        {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 3, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1].map((w, idx) => (
                          <div
                            key={idx}
                            className="bg-[#050f22] h-full"
                            style={{ width: `${w * 1.5}px` }}
                          />
                        ))}
                      </div>
                      <div className="text-[9px] font-mono font-black text-navy tracking-[0.25em] mt-1 uppercase">
                        {generatedTicket?.ticketNumber}
                      </div>
                    </div>

                    <div className="text-[9px] text-gray-400 tracking-wider font-mono">
                      RÉFÉRENCE BADGE : <strong className="text-gold">{generatedTicket?.ticketNumber}</strong>
                    </div>
                  </div>

                  {/* Event Practical Info Grid */}
                  <div className="mx-4 my-3 grid grid-cols-2 gap-2 text-[9px] font-mono">
                    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-gold shrink-0" />
                      <div className="text-left leading-tight">
                        <div className="text-white/50 text-[8px]">DATES &amp; HORAIRES</div>
                        <div className="font-bold text-white">20-22 OCT 2026</div>
                        <div className="text-gray-400 text-[8px]">09h00 - 18h00</div>
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                      <div className="text-left leading-tight">
                        <div className="text-white/50 text-[8px]">LIEU D'EXPOSITION</div>
                        <div className="font-bold text-white">OFEC CASABLANCA</div>
                        <div className="text-gray-400 text-[8px]">Maroc • Hall Principal</div>
                      </div>
                    </div>
                  </div>

                  {/* Official Footer */}
                  <div className="bg-[#020712] px-4 py-2 text-center border-t border-gold/20">
                    <div className="text-[8px] text-gray-400 font-sans tracking-wide">
                      PRÉSENTEZ CE BADGE À L’ACCUEIL PROFESSIONNEL DU SALON
                    </div>
                    <div className="text-[8px] text-gold/80 font-mono font-semibold mt-0.5">
                      AFRICA POOL &amp; SPA EXPO • CASABLANCA 2026
                    </div>
                  </div>

                  {/* Bottom Gold Accent Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#b37e1f] via-[#e5b352] to-[#b37e1f]" />
                </div>

                {/* Printable Action buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded shadow hover:bg-navy-light hover:shadow-md transition-all border border-navy-light cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-gold" /> Imprimer le badge
                  </button>
                  <a
                    href={`/api/tickets/${generatedTicket?.ticketNumber}/pdf`}
                    download={`Badge-${generatedTicket?.ticketNumber}.pdf`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gold text-white text-xs font-bold uppercase tracking-wider rounded shadow hover:bg-gold-light hover:shadow-md transition-all border border-gold decoration-transparent cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Télécharger le Badge (PDF)
                  </a>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>

                {/* Invite & Share for colleagues */}
                <div className="bg-navy/5 border border-gold/30 rounded-lg p-4 text-center space-y-3">
                  <h5 className="font-bold text-xs text-navy uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Share2 className="h-4 w-4 text-gold" /> Inviter vos collègues ou partenaires
                  </h5>
                  <p className="text-[11px] text-gray-600">
                    Transmettez le lien d'inscription à vos collaborateurs pour qu'ils éditent leur accréditation gratuite :
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        hasCopiedLink ? 'bg-emerald-600 text-white' : 'bg-navy text-white hover:bg-navy-light'
                      }`}
                    >
                      {hasCopiedLink ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 text-gold" />}
                      {hasCopiedLink ? 'Lien Copié !' : 'Copier le lien d\'inscription'}
                    </button>
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Partager WhatsApp</span>
                    </a>
                    <a
                      href={emailShareUrl}
                      className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors border border-gray-300 cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5 text-navy" /> E-mail
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
