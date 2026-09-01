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
  QrCode,
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

                {/* VISITOR BADGE DRAWING */}
                <div 
                  className="print-ticket border border-gold/40 rounded-lg overflow-hidden bg-gradient-to-br from-navy to-navy-light shadow-xl text-white max-w-sm mx-auto relative font-sans before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_right,rgba(200,146,42,0.15),transparent_60%)]"
                >
                  {/* Event Ribbon Badge top */}
                  <div className="bg-gold px-4 py-2 flex items-center justify-between border-b border-white/10 uppercase font-bold tracking-widest text-[9px] text-navy">
                    <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> ACCRÉDITATION B2B</span>
                    <span>PASS 3 JOURS</span>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 text-center space-y-4">
                    <div className="space-y-0.5">
                      <div className="text-[11px] uppercase font-extrabold tracking-wider text-white font-sans">
                        SALON INTERNATIONAL DE LA PISCINE ET DU SPA
                      </div>
                      <div className="text-[9px] uppercase font-bold tracking-widest text-gold font-mono">
                        AFRICA POOL & SPA EXPO 2026
                      </div>
                      <div className="text-[9px] text-white/50 tracking-wider font-mono">
                        OCTOBRE 20-22, 2026 • OFEC CASABLANCA
                      </div>
                    </div>

                    <div className="w-20 h-0.5 bg-gold/30 mx-auto" />

                    <div className="space-y-1">
                      <h4 className="text-xl font-extrabold uppercase tracking-tight text-white font-sans">
                        {generatedTicket?.firstName} {generatedTicket?.lastName}
                      </h4>
                      <p className="text-xs font-semibold text-gold font-mono tracking-wide">
                        {generatedTicket?.jobTitle}
                      </p>
                      <p className="text-xs text-white/70">
                        {generatedTicket?.company}
                      </p>
                    </div>

                    <div className="w-full h-px border-t border-dashed border-white/10 my-1" />

                    <div className="flex justify-between items-center text-[9px] text-white/60 text-left px-2 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gold" />
                        <span>MAR-JEU 09h - 18h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gold" />
                        <span>OFEC, CASA</span>
                      </div>
                    </div>

                    {/* QR Code container */}
                    <div className="bg-white p-3 rounded inline-block shadow-lg mx-auto border-2 border-gold relative group">
                      <QrCode className="h-24 w-24 text-navy stroke-[1.5]" />
                      <div className="text-[8px] text-navy font-bold text-center mt-1 select-none font-mono">
                        APS {generatedTicket?.ticketNumber.slice(-5)}
                      </div>
                    </div>

                    <div className="text-[10px] text-white/40 tracking-widest font-mono">
                      TICKET N° {generatedTicket?.ticketNumber}
                    </div>
                  </div>
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
