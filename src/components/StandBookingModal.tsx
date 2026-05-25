import React, { useState } from 'react';
import { X, Check, Landmark, Layers, Sparkles, Building, Phone, Mail, User, Info, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { StandReservation } from '../types';

interface StandBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newResObj: StandReservation) => void;
}

const SECTORS = [
  'Pool Equipment (Équipement de piscine)',
  'Water Treatment (Traitement de l’eau)',
  'Spa & Wellness (Bien-être & Spas)',
  'Outdoor Living (Mobilier & Extérieur)',
  'Hospitality Solutions (Solutions Hôtelières)',
  'Automation & Digital Solutions (Domotique & Digital)'
];

const PRE_RES_SPOTS = [
  { id: 'S-01', zone: 'Excellence (Pre-reserved)', size: 36, status: 'occupied', company: 'Saya Line Corp' },
  { id: 'S-02', zone: 'Excellence', size: 36, status: 'available' },
  { id: 'S-03', zone: 'Wellness', size: 54, status: 'occupied', company: 'ThermaSpa Wellness' },
  { id: 'S-04', zone: 'Wellness', size: 54, status: 'available' },
  { id: 'S-05', zone: 'Pool Equipment', size: 18, status: 'available' },
  { id: 'S-06', zone: 'Pool Equipment', size: 18, status: 'available' },
  { id: 'S-07', zone: 'Pool Equipment', size: 9, status: 'available' },
  { id: 'S-08', zone: 'Pool Equipment', size: 9, status: 'available' },
  { id: 'S-09', zone: 'Water Treatment', size: 18, status: 'available' },
  { id: 'S-10', zone: 'Water Treatment', size: 18, status: 'available' },
  { id: 'S-11', zone: 'Outdoor Living', size: 18, status: 'available' },
  { id: 'S-12', zone: 'Outdoor Living', size: 36, status: 'available' },
];

export default function StandBookingModal({ isOpen, onClose, onSuccess }: StandBookingModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    sector: SECTORS[0],
    standSize: 18,
    standType: 'standard' as 'standard' | 'premium',
    description: '',
  });

  const [selectedSpotId, setSelectedSpotId] = useState<string>('S-02');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<StandReservation | null>(null);

  if (!isOpen) return null;

  // Pricing constants (EUR per m²)
  const PRICE_PER_M2 = formData.standType === 'premium' ? 350 : 250;
  const totalPrice = formData.standSize * PRICE_PER_M2;

  const handleSpotSelect = (spot: typeof PRE_RES_SPOTS[0]) => {
    if (spot.status === 'occupied') return;
    setSelectedSpotId(spot.id);
    setFormData(prev => ({
      ...prev,
      standSize: spot.size
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    if (!formData.companyName || !formData.contactName || !formData.email || !formData.phone) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      setIsSubmitting(false);
      return;
    }

    try {
      const resp = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          description: `Spot sélectionné: ${selectedSpotId} - ${formData.description || 'Aucun détail additionnel'}`,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || 'Erreur lors de la réservation.');
      }

      const newResObj = await resp.json();
      setCreatedReservation(newResObj);
      onSuccess(newResObj);
      setIsDone(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur inconnue est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#050f22]/90 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div 
        className="relative bg-white text-navy w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border border-gold/30 flex flex-col"
        id="booking-modal-card"
      >
        {/* Header */}
        <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between border-b border-gold/30 z-10">
          <div>
            <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <Landmark className="text-gold h-5 w-5" />
              Réserver Votre Stand – <span className="text-gold">Africa Pool & Spa 2026</span>
            </h3>
            <p className="text-xs text-gray-300">Demande de participation exposant en temps réel</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gold transition-colors p-1"
            title="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="p-6 flex-1">
          <AnimatePresence mode="wait">
            {!isDone ? (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form fields: LHS (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-navy/80 border-b pb-1 font-sans">
                    1. Informations Société
                  </h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-navy/70 uppercase mb-1">Nom de la Société *</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-gold" />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:border-gold focus:outline-none"
                        placeholder="Ex: PureWater Sarl"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy/70 uppercase mb-1">Représentant Directeur *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gold" />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:border-gold focus:outline-none"
                        placeholder="Prénom & Nom"
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-navy/70 uppercase mb-1">Email Pro *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gold" />
                        <input 
                          type="email" 
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:border-gold focus:outline-none"
                          placeholder="email@societe.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy/70 uppercase mb-1">Téléphone Direct *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gold" />
                        <input 
                          type="tel" 
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:border-gold focus:outline-none"
                          placeholder="Ex: +212..."
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy/70 uppercase mb-1">Secteur Principal *</label>
                    <select 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-gold focus:outline-none"
                      value={formData.sector}
                      onChange={(e) => setFormData({...formData, sector: e.target.value})}
                    >
                      {SECTORS.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy/70 uppercase mb-1">Format de Stand *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex flex-col p-2.5 border rounded cursor-pointer transition-colors text-center ${formData.standType === 'standard' ? 'border-gold bg-gold/5' : 'border-gray-200'}`}>
                        <span className="text-xs font-bold text-navy">🛠️ Standard</span>
                        <span className="text-[10px] text-gray-500">250 € / m²</span>
                        <span className="text-[9px] text-gray-400 mt-1">Espace + Alim standard</span>
                        <input 
                          type="radio" 
                          name="standType" 
                          value="standard" 
                          checked={formData.standType === 'standard'} 
                          className="sr-only"
                          onChange={() => setFormData({...formData, standType: 'standard'})}
                        />
                      </label>
                      <label className={`flex flex-col p-2.5 border rounded cursor-pointer transition-colors text-center ${formData.standType === 'premium' ? 'border-gold bg-gold/5' : 'border-gray-200'}`}>
                        <span className="text-xs font-bold text-gold flex items-center justify-center gap-1">✨ Premium <Sparkles className="h-3 w-3" /></span>
                        <span className="text-[10px] text-gray-500">350 € / m²</span>
                        <span className="text-[9px] text-gray-400 mt-1 font-semibold">Inclus angle, badge VIP</span>
                        <input 
                          type="radio" 
                          name="standType" 
                          value="premium" 
                          checked={formData.standType === 'premium'} 
                          className="sr-only"
                          onChange={() => setFormData({...formData, standType: 'premium'})}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy/70 uppercase mb-1">Présentation de vos activités</label>
                    <textarea 
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-gold focus:outline-none resize-none"
                      rows={2}
                      placeholder="Décrivez brièvement les produits exposés..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                {/* Floor plan blueprint selection: RHS (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-navy/80 border-b pb-1 font-sans flex items-center justify-between">
                    <span>2. Plan du Salon & Emplacement</span>
                    <span className="text-xs font-mono font-bold bg-navy text-gold px-2 py-0.5 rounded">
                      Booth {selectedSpotId}
                    </span>
                  </h4>
                  
                  <p className="text-xs text-navy/70">
                    Cliquez sur un emplacement disponible (vert/bleu) sur le plan d'exposition de l'OFEC Casablanca pour réserver votre stand:
                  </p>

                  {/* Interactive Grid Map */}
                  <div className="bg-navy p-4 rounded-lg border border-gold/20 shadow-inner">
                    <div className="text-[10px] text-center text-gold uppercase tracking-widest font-bold font-mono mb-2 border-b border-gold/10 pb-1">
                      👑 ENTRÉE PRINCIPALE DU HALL (OFEC CASABLANCA)
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {PRE_RES_SPOTS.map((s) => {
                        const isOccupied = s.status === 'occupied';
                        const isSelected = s.id === selectedSpotId;
                        
                        let cardBg = "bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30";
                        if (isOccupied) {
                          cardBg = "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed";
                        } else if (isSelected) {
                          cardBg = "bg-gold text-white border-gold-light font-bold ring-2 ring-gold-light";
                        }

                        return (
                          <div
                            key={s.id}
                            onClick={() => handleSpotSelect(s)}
                            className={`p-2 rounded border border-dashed flex flex-col justify-between transition-all select-none cursor-pointer ${cardBg} h-18 text-left`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold">{s.id}</span>
                              <span className="text-[8px] font-bold uppercase tracking-tight py-0.5 px-1 bg-black/20 rounded">
                                {s.size} m²
                              </span>
                            </div>
                            
                            <div className="mt-1">
                              <span className="text-[9px] font-semibold block truncate">
                                {isOccupied ? `🔒 ${s.company}` : `📍 ${s.zone}`}
                              </span>
                              <span className="text-[8px] block opacity-80">
                                {isOccupied ? 'Réservé' : isSelected ? 'Votre choix' : 'Libre'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-3 text-[9px] text-white/70 font-mono">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500 block" /> Disponible
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-gold block" /> Sélectionné
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-gray-800 block" /> Déjà occupé (Pre-réservé)
                      </div>
                    </div>
                  </div>

                  {/* Summary Pricing Card */}
                  <div className="bg-light p-4 rounded-lg border border-gray-200">
                    <h5 className="font-bold text-xs uppercase tracking-wider mb-2 text-navy/80">
                      Estimation financière du stand
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-gray-500">Surface Sélectionnée:</div>
                        <div className="font-bold text-navy text-sm font-mono">{formData.standSize} m²</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Formule & Services:</div>
                        <div className="font-bold text-navy text-sm capitalize">{formData.standType}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Tarif unitaire:</div>
                        <div className="font-bold text-navy text-sm font-mono">{PRICE_PER_M2} EUR / m²</div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-bold text-gold">Total estimé (HT):</div>
                        <div className="font-extrabold text-[#0DmmOvv9R-k] text-lg font-mono text-gold flex items-center">
                          <DollarSign className="h-4 w-4 text-gold inline-block -mr-0.5" /> {totalPrice.toLocaleString()} EUR
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2.5 flex items-start gap-2 text-[10px] text-navy/70 leading-relaxed pt-2.5 border-t border-gray-200/60">
                      <Info className="h-3.5 w-3.5 text-gold flex-shrink-0 mt-0.5" />
                      <span>
                        Cette réservation sera stockée dans notre base de données dynamique du backend. Notre direction commerciale examinera votre dossier d'implantation sous 24h ouvrées. Un mail de confirmation avec plan d’implantation définitif vous sera transmis.
                      </span>
                    </div>
                  </div>

                  {/* Call to action */}
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded text-xs font-bold font-sans uppercase tracking-wider hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-gold text-white font-bold rounded text-xs font-sans uppercase tracking-wider hover:bg-gold-light hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande →'}
                    </button>
                  </div>
                </div>

              </form>
            ) : (
              // Done view!
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center max-w-lg mx-auto space-y-6"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-navy">Félicitations !</h3>
                  <p className="text-sm text-navy/80">
                    Votre demande de réservation de stand de <strong>{createdReservation?.standSize}m² ({createdReservation?.standType})</strong> pour <strong className="text-gold">{createdReservation?.companyName}</strong> a été enregistrée avec succès dans le serveur.
                  </p>
                </div>

                <div className="bg-light p-4 rounded border text-left space-y-2.5 text-xs font-mono select-all">
                  <div><span className="text-gray-500 select-none">ID Réservation:</span> {createdReservation?.id}</div>
                  <div><span className="text-gray-500 select-none">Statut:</span> <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">{createdReservation?.status}</span></div>
                  <div><span className="text-gray-500 select-none">Contact:</span> {createdReservation?.contactName} ({createdReservation?.email})</div>
                  <div><span className="text-gray-500 select-none">Date d'enregistrement:</span> {createdReservation?.createdAt ? new Date(createdReservation.createdAt).toLocaleString() : ''}</div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Notre équipe va réviser votre emplacement sélectionné <strong>{selectedSpotId}</strong> à l’OFEC. En attendant, vous pouvez accéder à notre console organisateur pour approuver ou éditer cette réservation directement !
                </p>

                <div className="pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-navy-light transition-colors"
                  >
                    Fermer l'accueil exposant
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
