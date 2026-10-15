import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Building2, Search, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Exhibitor } from '../types';

interface ExhibitorsSintaProps {
  exhibitors: Exhibitor[];
  getExhibitorLogoUrl: (ex: Exhibitor) => string | undefined;
  onOpenBookingModal?: () => void;
  onOpenAdminConsole?: () => void;
  isAdminAuthenticated?: boolean;
}

export const ExhibitorsSinta: React.FC<ExhibitorsSintaProps> = ({
  exhibitors,
  getExhibitorLogoUrl,
  onOpenBookingModal,
  onOpenAdminConsole,
  isAdminAuthenticated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);

  // Extract distinct sectors/highlightWords for interactive filtering
  const sectors = ['all', ...Array.from(new Set(exhibitors.map((e) => e.highlightWord).filter(Boolean)))];

  const filteredExhibitors = exhibitors.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.highlightWord && ex.highlightWord.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSector = selectedSector === 'all' || ex.highlightWord === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Duplicate for seamless infinite horizontal loop
  const marqueeItems = [...exhibitors, ...exhibitors, ...exhibitors];

  return (
    <div className="space-y-12">
      {/* ===== SINTA (BANDE DÉFILANTE CONTINUE DES LOGOS EXPOSANTS) ===== */}
      <div className="relative overflow-hidden py-6 bg-gradient-to-r from-slate-900 via-[#0a192f] to-slate-900 rounded-2xl shadow-xl border border-sky-900/40">
        {/* Top ribbon micro-header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-sky-300 uppercase">
              LA SINTA OFFICIELLE DES EXPOSANTS &bull; AFRICA POOL &amp; SPA 2026
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <Sparkles className="w-3 h-3 text-gold" />
            <span>Défilement continu &bull; Pause au survol</span>
          </div>
        </div>

        {/* Gradient edge fades for luxurious depth */}
        <div className="pointer-events-none absolute left-0 top-12 bottom-0 w-24 bg-gradient-to-r from-slate-900 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-12 bottom-0 w-24 bg-gradient-to-l from-slate-900 to-transparent z-10" />

        {/* Marquee Track */}
        <div className="overflow-hidden py-4">
          <div className="flex gap-6 w-max animate-sinta-marquee hover:[animation-play-state:paused] cursor-pointer">
            {marqueeItems.map((ex, idx) => {
              const logo = getExhibitorLogoUrl(ex);
              const isWhiteLogo = ex.name.toLowerCase().includes('aiper') || (logo && logo.includes('white'));

              return (
                <div
                  key={`${ex.id}-${idx}`}
                  onClick={() => setSelectedExhibitor(ex)}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-white/40 hover:scale-105 transition-all duration-300 group select-none min-w-[210px] sm:min-w-[230px]"
                >
                  <div className={`w-14 h-10 rounded-lg flex items-center justify-center p-1.5 transition-colors overflow-hidden ${
                    isWhiteLogo ? 'bg-slate-900 border border-slate-700' : 'bg-slate-50 border border-slate-100'
                  }`}>
                    {logo ? (
                      <img
                        src={logo}
                        alt={`${ex.name} logo`}
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-extrabold text-xs text-sky-800">
                        {ex.name.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-xs tracking-tight group-hover:text-sky-700 transition-colors leading-tight">
                      {ex.name}
                    </p>
                    {ex.highlightWord && (
                      <span className="text-[10px] text-sky-600 font-medium block truncate max-w-[130px]">
                        {ex.highlightWord}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom micro-info */}
        <div className="px-6 pt-2 flex items-center justify-center text-[10px] text-slate-400 font-mono tracking-wider">
          <span className="text-sky-400 font-semibold">{exhibitors.length} Marques &amp; Industriels confirmés</span>
          <span className="mx-2 text-slate-600">&bull;</span>
          <span>Pavillon d'Exposition Casablanca 2026</span>
        </div>
      </div>

      {/* ===== INTERACTIVE EXHIBITORS GRID WITH SEARCH & FILTERS ===== */}
      <div className="space-y-6">
        {/* Search bar & Category Pills */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une marque, un fabricant..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            )}
          </div>

          {/* Sector tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {sectors.slice(0, 6).map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec || 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSector === sec
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sec === 'all' ? 'Toutes les Marques' : sec}
              </button>
            ))}
          </div>
        </div>

        {/* Exhibitors Cards Grid */}
        {filteredExhibitors.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center max-w-md mx-auto space-y-3">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Aucun exposant trouvé pour cette recherche.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('all');
              }}
              className="text-xs text-sky-600 hover:underline font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredExhibitors.map((ex) => {
              const logo = getExhibitorLogoUrl(ex);
              const isWhiteLogo = ex.name.toLowerCase().includes('aiper') || (logo && logo.includes('white'));

              return (
                <motion.div
                  key={ex.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedExhibitor(ex)}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-1 rounded-full bg-sky-50 text-sky-600 inline-block">
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Logo Container */}
                  <div className={`w-full h-20 rounded-xl flex items-center justify-center p-3 mb-4 transition-all ${
                    isWhiteLogo ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50/80 border border-slate-100 group-hover:bg-sky-50/40'
                  }`}>
                    {logo ? (
                      <img
                        src={logo}
                        alt={`${ex.name} Logo`}
                        className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white shadow-sm"
                        style={{ backgroundColor: ex.logoColor || '#0284c7' }}
                      >
                        {ex.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1 text-center">
                    <h5 className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-sky-700 transition-colors leading-snug">
                      {ex.name}
                    </h5>
                    {ex.highlightWord && (
                      <span className="inline-block text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                        {ex.highlightWord}
                      </span>
                    )}
                  </div>

                  {/* Footer status badge */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Confirmé
                    </span>
                    <span>2026</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== EXHIBITOR DETAIL MODAL ===== */}
      {selectedExhibitor && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedExhibitor(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedExhibitor(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg transition-colors"
            >
              &times;
            </button>

            {/* Header with logo */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-24 h-16 rounded-2xl flex items-center justify-center p-2.5 shadow-sm ${
                selectedExhibitor.name.toLowerCase().includes('aiper') ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-100'
              }`}>
                {getExhibitorLogoUrl(selectedExhibitor) ? (
                  <img
                    src={getExhibitorLogoUrl(selectedExhibitor)}
                    alt={selectedExhibitor.name}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-extrabold text-sky-800 text-sm">
                    {selectedExhibitor.name.slice(0, 3)}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Exposant Officiel 2026
                </span>
                <h3 className="font-serif text-2xl font-black text-slate-900 leading-tight">
                  {selectedExhibitor.name}
                </h3>
                {selectedExhibitor.highlightWord && (
                  <p className="text-xs text-slate-500 font-medium">{selectedExhibitor.highlightWord}</p>
                )}
              </div>
            </div>

            {/* Information Grid */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 mb-6 text-xs text-slate-600">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-400 font-medium">Statut au Salon :</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Stand Réservé &amp; Confirmé
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-400 font-medium">Zone d'exposition :</span>
                <span className="font-mono font-bold text-slate-800">Hall Principal &bull; Pavillon Équipements</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Dates de présence :</span>
                <span className="font-semibold text-slate-800">22 - 24 Septembre 2026 &bull; Casablanca</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {onOpenBookingModal && (
                <button
                  onClick={() => {
                    setSelectedExhibitor(null);
                    onOpenBookingModal();
                  }}
                  className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md text-center"
                >
                  Réserver un stand voisin
                </button>
              )}
              <button
                onClick={() => setSelectedExhibitor(null)}
                className="py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors text-center"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExhibitorsSinta;
