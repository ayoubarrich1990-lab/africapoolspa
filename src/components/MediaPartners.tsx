import React from 'react';
import { ExternalLink, Newspaper, Award, Globe, Building2, BookOpen } from 'lucide-react';
import bannerSvg from '../assets/images/partenaires_medias_banner.svg';

export interface MediaPartnerItem {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  badge: string;
}

export const MEDIA_PARTNERS: MediaPartnerItem[] = [
  {
    id: 'ae-magazine',
    name: 'A+E Architecture et Environnement au Maroc',
    category: 'Architecture & Design',
    description: 'La revue marocaine de référence consacrée à l’architecture contemporaine, au design d’espaces et à l’urbanisme durable.',
    url: 'https://aandemagazine.com',
    badge: 'Presse Spécialisée',
  },
  {
    id: 'chantiers-maroc',
    name: 'Chantiers du Maroc',
    category: 'BTP & Construction',
    description: '1er magazine d’information et d’actualité économique dédié aux acteurs des grands chantiers, des infrastructures et du BTP.',
    url: 'https://chantiersdumaroc.ma',
    badge: '1er Magazine BTP',
  },
  {
    id: 'telecontact',
    name: 'Telecontact.ma',
    category: 'Annuaire Professionnel B2B',
    description: 'La plateforme et annuaire d’entreprises leaders au Maroc pour le référencement, la visibilité et la mise en relation d’affaires.',
    url: 'https://www.telecontact.ma',
    badge: 'Annuaire N°1 Maroc',
  },
  {
    id: 'kompass',
    name: 'Kompass',
    category: 'Réseau d’Affaires International',
    description: 'Votre passeport d’affaires international : répertoire mondial d’entreprises et solutions de prospection commerciale B2B.',
    url: 'https://ma.kompass.com',
    badge: 'Réseau Mondial',
  },
];

export const MediaPartners: React.FC = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden border-t border-sky-100" id="partenaires-medias">
      {/* Soft ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-sky-100/40 blur-[110px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header matching user branding */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-[11px] font-bold uppercase tracking-widest">
            <Newspaper className="h-3.5 w-3.5 text-sky-600" />
            Rayonnement &amp; Couverture Presse
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wide text-slate-800 font-sans">
            PARTENAIRES MÉDIAS
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Les publications et canaux d'information économique de premier plan qui accompagnent la promotion et la visibilité d'<strong>Africa Pool &amp; Spa Expo 2026</strong>.
          </p>
        </div>

        {/* 4 Official Partner Logos Grid - High-fidelity styling matching the uploaded screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* 1. A+E Architecture et Environnement au Maroc */}
          <a
            href="https://aandemagazine.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-900/5 transition-all duration-300 relative text-left"
          >
            <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 text-sky-600" />
            </div>

            <div className="h-28 flex flex-col items-center justify-center border-b border-slate-100 pb-4 mb-4 select-none">
              <div className="flex items-start leading-none font-sans font-black tracking-tight text-3xl sm:text-4xl text-slate-900 group-hover:text-sky-600 transition-colors">
                <span>A</span>
                <span className="mx-0.5 text-2xl font-bold self-center text-slate-900">+</span>
                <span>E</span>
                <span className="text-sm font-bold -mt-1 ml-0.5">°</span>
              </div>
              <span className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-[0.12em] text-slate-800 mt-1.5 text-center leading-tight">
                ARCHITECTURE ET ENVIRONNEMENT AU MAROC
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded">
                  Architecture &amp; Design
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Magazine</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                Revue d'architecture marocaine de référence consacrée aux projets d'exception et à l'aménagement.
              </p>
            </div>
          </a>

          {/* 2. CHANTIERS du Maroc .ma */}
          <a
            href="https://chantiersdumaroc.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-900/5 transition-all duration-300 relative text-left"
          >
            <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 text-sky-600" />
            </div>

            <div className="h-28 flex items-center justify-center gap-2 border-b border-slate-100 pb-4 mb-4 select-none">
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#d9242a] font-sans">
                  CHANTIERS
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 -mt-0.5">
                  du Maroc<span className="text-xs font-black text-slate-700">.ma</span>
                </span>
              </div>
              <div className="h-10 w-[2px] bg-[#d9242a] mx-1 opacity-90" />
              <div className="text-[7.5px] sm:text-[8px] leading-[1.18] font-bold text-slate-800 uppercase tracking-tight text-left">
                <div>1<sup className="text-[6px]">er</sup> Magazine</div>
                <div>de l'actualité</div>
                <div>du secteur</div>
                <div>de la construction</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                  BTP &amp; Construction
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Presse B2B</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                Le magazine leader d'actualité du bâtiment, des travaux publics et des infrastructures au Maroc.
              </p>
            </div>
          </a>

          {/* 3. Telecontact.ma */}
          <a
            href="https://www.telecontact.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-900/5 transition-all duration-300 relative text-left"
          >
            <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 text-sky-600" />
            </div>

            <div className="h-28 flex items-center justify-center select-none font-sans border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center">
                <span className="text-2xl sm:text-[27px] font-bold tracking-tight text-slate-950">
                  Telecontact.
                </span>
                <div className="w-8 h-8 rounded-full bg-[#fed000] flex items-center justify-center shadow-xs ml-1 flex-shrink-0">
                  <span className="text-xs font-black text-slate-950">ma</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
                  Annuaire B2B N°1
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Digital</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                L'annuaire professionnel de référence pour trouver acheteurs, fournisseurs et prestataires au Maroc.
              </p>
            </div>
          </a>

          {/* 4. KOMPASS Your route to business worldwide */}
          <a
            href="https://ma.kompass.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-900/5 transition-all duration-300 relative text-left"
          >
            <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 text-sky-600" />
            </div>

            <div className="h-28 flex flex-col items-center justify-center select-none border-b border-slate-100 pb-4 mb-4">
              <span className="text-2xl sm:text-[28px] font-black tracking-wider text-[#e11d48] uppercase font-sans">
                KOMPASS
              </span>
              <span className="text-[8.5px] sm:text-[9.5px] font-medium text-[#e11d48] tracking-wide mt-1 whitespace-nowrap">
                Your route to business worldwide
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">
                  Réseau Mondial
                </span>
                <span className="text-[9px] text-slate-400 font-medium">B2B Global</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                Base de données mondiale et mise en relation internationale entre entreprises exportatrices et acheteurs.
              </p>
            </div>
          </a>

        </div>

        {/* Clean Banner Representation Container (matching the exact banner view) */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Bandeau officiel des partenaires médias accrédités
          </p>
          <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center overflow-x-auto">
            <img 
              src={bannerSvg} 
              alt="Partenaires Médias - Africa Pool & Spa Expo" 
              className="w-full max-w-4xl h-auto object-contain min-w-[650px]"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default MediaPartners;
