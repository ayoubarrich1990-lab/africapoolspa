import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  MapPin, 
  Check, 
  X, 
  Award, 
  ShieldCheck, 
  Sliders, 
  QrCode, 
  ChevronRight, 
  ChevronLeft,
  Send, 
  Loader2, 
  Plus, 
  Trash2, 
  Search, 
  Lock, 
  Megaphone, 
  Briefcase, 
  Cpu, 
  Layers, 
  Printer, 
  CheckCircle2, 
  ExternalLink,
  Database,
  Wifi,
  WifiOff,
  Copy,
  Sparkles,
  Flame,
  Droplet,
  Zap,
  TrendingUp,
  Users,
  Compass,
  Target,
  Home,
  Trees
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Imports of modals & types
import StandBookingModal from './components/StandBookingModal';
import VisitorTicketModal from './components/VisitorTicketModal';
import Logo from './components/Logo';
import { AIChatAssistant } from './components/AIChatAssistant';
import bgLuxuryPool from './assets/images/hero_expo_bg_1783518540159.jpg';
import bgDomedHall from './assets/images/hero_domed_hall_bg_1783520762693.jpg';
import bgCrowdHall from './assets/images/pool_expo_bg_1780934724088.png';
import logoSaya from './assets/images/regenerated_image_1781003477006.png';
import logoFrio from './assets/images/regenerated_image_1781000604311.jpg';
import logoPoolSpa from './assets/images/regenerated_image_1781003247380.png';
import logoPaledo from './assets/images/regenerated_image_1781001514526.png';
import logoCcei from './assets/images/regenerated_image_1781001515196.webp';
import logoNwg from './assets/images/regenerated_image_1781001515827.png';
import logoAtlanta from './assets/images/regenerated_image_1781003246792.webp';
import logoVerso from './assets/images/regenerated_image_1781001516746.png';
import type { Exhibitor, StandReservation, VisitorTicket, ContactMessage } from './types';

export default function App() {
  // Lists fetched from Backend API
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [reservations, setReservations] = useState<StandReservation[]>([]);
  const [tickets, setTickets] = useState<VisitorTicket[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Helper to obtain local optimized logos or use specific image assets
  const getExhibitorLogoUrl = (ex: Exhibitor): string | undefined => {
    const nameLower = ex.name?.toLowerCase() || '';
    if (ex.id === 'ex-1' || nameLower.includes('saya')) {
      return logoSaya;
    }
    if (ex.id === 'ex-2' || nameLower.includes('frio')) {
      return logoFrio;
    }
    if (ex.id === 'ex-3' || nameLower.includes('poolspa') || nameLower.includes('spa')) {
      return logoPoolSpa;
    }
    if (ex.id === 'ex-4' || nameLower.includes('paledo')) {
      return logoPaledo;
    }
    if (ex.id === 'ex-5' || nameLower.includes('ccei')) {
      return logoCcei;
    }
    if (ex.id === 'ex-6' || nameLower.includes('nwg')) {
      return logoNwg;
    }
    if (ex.id === 'ex-7' || nameLower.includes('atlanta')) {
      return logoAtlanta;
    }
    if (nameLower.includes('verso') || nameLower.includes('versô')) {
      return logoVerso;
    }
    return ex.logoUrl;
  };

  // Modals & Dashboard view triggers
  const [isStandModalOpen, setIsStandModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  // Admin Authentication States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('isAdminAuthenticated') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Handle Admin Auth
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    if (adminUsername.trim().toLowerCase() === 'admin' && adminPassword === 'casa2026') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setIsAdminLoginModalOpen(false);
      setIsAdminPanelOpen(true);
      setAdminUsername('');
      setAdminPassword('');
    } else {
      setAdminLoginError('Identifiant ou mot de passe incorrect.');
    }
  };
  
  // Navigation hamburger for small devices
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Background images for the hero slideshow (dynamic state with fallback)
  const defaultSlides = [bgLuxuryPool, bgDomedHall, bgCrowdHall];
  const [backgroundImages, setBackgroundImages] = useState<string[]>(defaultSlides);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [adminSlidesInput, setAdminSlidesInput] = useState('');
  const [isSavingSlides, setIsSavingSlides] = useState(false);

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/slides');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.slides) && data.slides.length > 0) {
          setBackgroundImages(data.slides);
        } else {
          setBackgroundImages(defaultSlides);
        }
      }
    } catch (e) {
      console.error('Error fetching dynamic slides:', e);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [backgroundImages.length]);

  // Status & loading indicators
  const [loadingExhibitors, setLoadingExhibitors] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [contactResultMsg, setContactResultMsg] = useState({ type: '', text: '' });
  
  // Contact state form
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Renseignements Généraux',
    message: '',
  });

  // Admin Dashboard States
  const [adminTab, setAdminTab] = useState<'stands' | 'visitors' | 'messages' | 'exhibitors' | 'slides'>('stands');
  const [adminSearch, setAdminSearch] = useState('');
  const [newExhibitorForm, setNewExhibitorForm] = useState({ name: '', highlightWord: '', logoColor: '#c8922a', logoUrl: '' });
  const [isAddingExhibitor, setIsAddingExhibitor] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Database status and verification states
  const [dbStatus, setDbStatus] = useState<{
    usePrisma: boolean;
    actuallyConnected: boolean;
    isPlaceholder: boolean;
    providerType: string;
    maskedUrl: string;
    connectionError: string | null;
  } | null>(null);
  const [loadingDbStatus, setLoadingDbStatus] = useState(false);
  const [showDbDiagnostics, setShowDbDiagnostics] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Securely request and route admin console access and tab redirections
  const openAdminConsoleOrLogin = (defaultTab?: 'stands' | 'visitors' | 'messages' | 'exhibitors' | 'slides') => {
    if (defaultTab) {
      setAdminTab(defaultTab);
    }
    if (isAdminAuthenticated) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  // Track window scroll for beautiful glowing glassy header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync API States on Mount
  useEffect(() => {
    fetchSlides();
    fetchExhibitors();
    fetchReservations();
    fetchTickets();
    fetchMessages();
  }, []);

  // Synchronise le paramètre URL ou le hash pour ouvrir le modal admin de connexion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin') {
        setIsAdminLoginModalOpen(true);
      }
    }
  }, []);

  const fetchExhibitors = async () => {
    try {
      setLoadingExhibitors(true);
      const res = await fetch('/api/exhibitors');
      if (res.ok) {
        const data = await res.json();
        setExhibitors(data);
      }
    } catch (e) {
      console.error('Error fetching exhibitors list:', e);
    } finally {
      setLoadingExhibitors(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (e) {
      console.error('Error fetching reservations:', e);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (e) {
      console.error('Error fetching tickets list:', e);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Error fetching messages log:', e);
    }
  };

  const fetchDbStatus = async () => {
    try {
      setLoadingDbStatus(true);
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.error('Error fetching database connection details:', e);
    } finally {
      setLoadingDbStatus(false);
    }
  };

  useEffect(() => {
    if (isAdminPanelOpen) {
      fetchDbStatus();
    }
  }, [isAdminPanelOpen]);

  // Submit Contact Us Client Action
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingMessage(true);
    setContactResultMsg({ type: '', text: '' });

    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactResultMsg({ type: 'error', text: 'Veuillez remplir le nom, l’adresse email et votre message.' });
      setIsSendingMessage(false);
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (res.ok) {
        setContactResultMsg({ 
          type: 'success', 
          text: 'Votre message a bien été envoyé à la direction de l’expo ! Nous vous répondrons sous 24h.' 
        });
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: 'Renseignements Généraux',
          message: '',
        });
        fetchMessages(); // refresh listing in admin backend
      } else {
        let errMsg = 'Erreur lors de l’envoi.';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {
          try {
            const rawText = await res.text();
            if (rawText && rawText.length < 200) {
              errMsg = rawText;
            }
          } catch {}
        }
        throw new Error(errMsg);
      }
    } catch (err: any) {
      setContactResultMsg({ type: 'error', text: err.message || 'Impossible de transmettre le formulaire.' });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Change Reservation status in the Admin controls
  const handleUpdateReservationStatus = async (id: string, status: 'approved' | 'rejected', defaultLocation?: string) => {
    try {
      const bodyPayload: any = { status };
      if (status === 'approved') {
        bodyPayload.assignedLocation = defaultLocation || `Hall central - Stand N°${Math.floor(Math.random() * 50 + 10)}`;
      }
      
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        fetchReservations(); // sync list
      }
    } catch (err) {
      console.error('Error modifying reservation:', err);
    }
  };

  // Delete Stand reservation
  const handleDeleteReservation = async (id: string) => {
    if (!window.confirm('Voulez-vous supprimer définitivement cette demande de stand de la base ?')) return;
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
      if (res.ok) fetchReservations();
    } catch (err) {
      console.error(err);
    }
  };

  // Read message handler
  const handleMarkMessageRead = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, { method: 'PATCH' });
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete contact form message
  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  // Admin view handler to add interactive dynamic exhibitors
  const handleAddExhibitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExhibitorForm.name) return;
    setIsAddingExhibitor(true);

    try {
      const res = await fetch('/api/exhibitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExhibitorForm),
      });

      if (res.ok) {
        setNewExhibitorForm({ name: '', highlightWord: '', logoColor: '#c8922a', logoUrl: '' });
        fetchExhibitors();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingExhibitor(false);
    }
  };

  // Delete exhibitor
  const handleDeleteExhibitor = async (id: string) => {
    try {
      const res = await fetch(`/api/exhibitors/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExhibitors();
    } catch (err) {
      console.error(err);
    }
  };

  // Slides slide managers
  const handleAddSlide = (url: string) => {
    if (!url.trim()) return;
    setBackgroundImages((prev) => [...prev, url.trim()]);
    setAdminSlidesInput('');
  };

  const handleRemoveSlide = (idx: number) => {
    setBackgroundImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length > 0 ? next : defaultSlides;
    });
    setCurrentBgIndex(0);
  };

  const handleMoveSlide = (idx: number, direction: 'up' | 'down') => {
    setBackgroundImages((prev) => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx >= 0 && targetIdx < next.length) {
        const temp = next[idx];
        next[idx] = next[targetIdx];
        next[targetIdx] = temp;
      }
      return next;
    });
  };

  const handleSaveSlides = async () => {
    try {
      setIsSavingSlides(true);
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: backgroundImages }),
      });
      if (res.ok) {
        alert('Diaporama enregistré avec succès !');
        fetchSlides();
      } else {
        alert('Erreur lors de l’enregistrement du diaporama.');
      }
    } catch (e) {
      console.error('Error saving slides:', e);
      alert('Erreur réseau lors de l’enregistrement du diaporama.');
    } finally {
      setIsSavingSlides(false);
    }
  };

  const handleResetSlides = async () => {
    if (confirm('Voulez-vous restaurer les 3 images de diaporama par défaut ?')) {
      try {
        setIsSavingSlides(true);
        const res = await fetch('/api/slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slides: [] }), // send empty array to tell backend to clear
        });
        if (res.ok) {
          setBackgroundImages(defaultSlides);
          setCurrentBgIndex(0);
          alert('Diaporama d’origine restauré avec succès !');
        }
      } catch (e) {
        console.error('Error resetting slides:', e);
      } finally {
        setIsSavingSlides(false);
      }
    }
  };

  // Standard Filters for Admin Grid
  const filteredReservations = reservations.filter(r => 
    r.companyName.toLowerCase().includes(adminSearch.toLowerCase()) || 
    r.contactName.toLowerCase().includes(adminSearch.toLowerCase()) ||
    r.sector.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredTickets = tickets.filter(t => 
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(adminSearch.toLowerCase()) ||
    t.company.toLowerCase().includes(adminSearch.toLowerCase()) || 
    t.ticketNumber.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
    m.message.toLowerCase().includes(adminSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-navy font-sans relative antialiased">
      
      {/* ===== HEADER NAVIGATION ===== */}
      <nav 
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 px-6 lg:px-12 flex items-center justify-between h-20 ${
          scrolled 
            ? 'bg-navy/98 shadow-xl backdrop-blur-md border-b border-gold/35' 
            : 'bg-navy/95 border-b border-gold/15'
        }`}
      >
        <div id="nav-brand-area" className="flex items-center gap-4">
          <Logo variant="horizontal" />
        </div>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-6 xl:gap-8 font-sans" id="nav-desktop-menus">
          <li>
            <a href="#hero" className="text-white/80 hover:text-gold text-xs font-bold uppercase tracking-wider transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-0.5 after:bg-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
              Accueil
            </a>
          </li>
          <li>
            <a href="#about" className="text-white/80 hover:text-gold text-xs font-bold uppercase tracking-wider transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-0.5 after:bg-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
              Pourquoi Visiter
            </a>
          </li>
          <li>
            <a href="#secteurs" className="text-white/80 hover:text-gold text-xs font-bold uppercase tracking-wider transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-0.5 after:bg-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
              Secteurs
            </a>
          </li>
          <li>
            <a href="#exposants" className="text-white/80 hover:text-gold text-xs font-bold uppercase tracking-wider transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-0.5 after:bg-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
              Exposants
            </a>
          </li>
          <li>
            <a href="#contact-section" className="text-white/80 hover:text-gold text-xs font-bold uppercase tracking-wider transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-0.5 after:bg-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
              Contact
            </a>
          </li>
          
          {/* Quick link button to slide admin */}
          {isAdminAuthenticated && (
            <li>
              <button 
                id="admin-console-trigger-nav"
                onClick={() => setIsAdminPanelOpen(true)}
                className="px-3 py-1.5 rounded bg-white/10 text-gold hover:bg-gold hover:text-navy text-[10px] font-extrabold uppercase tracking-widest border border-gold/45 transition-all flex items-center gap-1.5"
              >
                <Sliders className="h-3.5 w-3.5" /> ⚙️ Admin Console
              </button>
            </li>
          )}

          <li>
            <button 
              id="reserver-stand-trigger-nav"
              onClick={() => setIsStandModalOpen(true)}
              className="px-4 py-2 bg-gold text-white text-xs font-bold uppercase tracking-wider rounded border border-gold hover:bg-gold-light hover:border-gold-light shadow hover:shadow-lg transition-all"
            >
              Réserver un Stand
            </button>
          </li>
        </ul>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 lg:hidden" id="nav-mobile-trigger-area">
          {isAdminAuthenticated && (
            <button 
              onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
              className="p-1.5 text-gold border border-gold/30 rounded bg-navy-light/60"
              title="Console Admin"
            >
              <Sliders className="h-4 w-4" />
            </button>
          )}
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-gold flex flex-col gap-1.5 focus:outline-none p-1.5"
            aria-label="Toggle menu"
            id="mobile-hamburger-btn"
          >
            <span className={`w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Links Overlay Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed top-20 left-0 right-0 bg-navy text-white z-[999] border-b border-gold/30 shadow-2xl overflow-hidden"
            id="mobile-drawer"
          >
            <div className="px-6 py-6 space-y-4">
              <a 
                href="#hero" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white/95 text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2"
              >
                Accueil
              </a>
              <a 
                href="#about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white/95 text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2"
              >
                Pourquoi Visiter
              </a>
              <a 
                href="#secteurs" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white/95 text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2"
              >
                Secteurs
              </a>
              <a 
                href="#exposants" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white/95 text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2"
              >
                Exposants
              </a>
              <a 
                href="#contact-section" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white/95 text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2"
              >
                Contact
              </a>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsStandModalOpen(true);
                  }}
                  className="w-full px-4 py-3 bg-gold text-white text-xs font-bold uppercase tracking-wider rounded text-center"
                >
                  Stand Exposant
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsTicketModalOpen(true);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded text-center hover:bg-white/15"
                >
                  Visiteur Ticket
                </button>
              </div>

              {isAdminAuthenticated && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAdminPanelOpen(true);
                  }}
                  className="w-full py-2.5 bg-navy-light text-gold font-bold text-xs uppercase tracking-widest rounded border border-gold/30 text-center flex items-center justify-center gap-2"
                >
                  <Sliders className="h-3.5 w-3.5" /> Ouvrir Console Administrateur
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HERO SECTION ===== */}
      <section className="min-h-screen relative bg-navy flex items-center pt-24 pb-12 overflow-hidden" id="hero">
        {/* Sliding Background Images with smooth transitions */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentBgIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundImages[currentBgIndex]})`,
                filter: 'saturate(1.1) contrast(1.1) brightness(0.4)',
              }}
            />
          </AnimatePresence>
        </div>
        
        {/* Ambient Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none select-none" 
          style={{ 
            background: 'linear-gradient(to bottom, rgba(5, 10, 47, 0.2) 0%, rgba(5, 10, 47, 0.7) 100%)',
          }} 
        />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10 w-full flex flex-col items-center justify-center py-12 text-center">
          
          <div className="max-w-4xl space-y-6 text-center flex flex-col items-center" id="hero-left-col">
            <span className="inline-block px-3 py-1 bg-gold/10 border border-gold/40 text-gold text-[10px] font-bold tracking-widest uppercase rounded">
              💎 Édition Spéciale — Leadership &amp; Innovation
            </span>

            <h1 className="font-serif text-white tracking-tight leading-none text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">
              AFRICA <br />
              <span className="text-gold">POOL &amp; SPA</span> <br />
              EXPO <span className="text-gold">2026</span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-sans mx-auto">
              Le rendez-vous unique des infrastructures aquatiques, de la domotique et du bien-être pour l'industrie hôtelière et touristique en pleine expansion sur le continent africain.
            </p>

            <div className="space-y-3 pt-2 text-center">
              <div className="flex items-center gap-3 text-white text-sm sm:text-base justify-center">
                <Calendar className="h-5 w-5 text-gold flex-shrink-0" />
                <span><strong>20 au 22 Octobre 2026</strong> — Sessions professionnelles B2B</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm sm:text-base justify-center">
                <MapPin className="h-5 w-5 text-gold flex-shrink-0" />
                <span><strong>OFEC</strong> — Office des Foires et Expositions de Casablanca, Maroc</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <button
                id="btn-main-reserve-stand"
                onClick={() => setIsStandModalOpen(true)}
                className="px-8 py-4 bg-gold text-white font-extrabold text-sm uppercase tracking-widest rounded shadow-xl hover:bg-gold-light hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>S'enregistrer comme Exposant</span> <ChevronRight className="h-4 w-4" />
              </button>
              <button
                id="btn-main-visitor-badge"
                onClick={() => setIsTicketModalOpen(true)}
                className="px-8 py-4 bg-white/10 border border-white/20 text-white font-extrabold text-sm uppercase tracking-widest rounded hover:bg-white/15 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Obtenir mon e-Badge Gratuit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Slide Navigation Arrows */}
        <button
          onClick={() => setCurrentBgIndex((prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-navy/40 hover:bg-gold hover:text-navy text-white transition-all pointer-events-auto cursor-pointer border border-white/10 hover:border-gold md:flex hidden hover:scale-105"
          aria-label="Slide Précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-navy/40 hover:bg-gold hover:text-navy text-white transition-all pointer-events-auto cursor-pointer border border-white/10 hover:border-gold md:flex hidden hover:scale-105"
          aria-label="Slide Suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {backgroundImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBgIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                currentBgIndex === idx ? 'bg-gold w-8' : 'bg-white/35 hover:bg-white/60'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ===== STATISTICS BAR ===== */}
      <section className="bg-navy py-12 border-y border-gold/30" id="stats-banner">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-serif font-black text-gold">300+</div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Exposants Prévus</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-serif font-black text-gold">8 000+</div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visiteurs B2B</p>
            </div>
            <div className="space-y-1 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="text-3xl md:text-4xl font-serif font-black text-gold">30+</div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pays d'Afrique & UE</p>
            </div>
            <div className="space-y-1 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="text-3xl md:text-4xl font-serif font-black text-gold">15 000 m²</div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Surfaces Disponibles</p>
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="text-3xl md:text-4xl font-serif font-black text-emerald-400">100%</div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Échanges Réseau B2B</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY EXHIBIT/VISIT ABOUT ===== */}
      <section className="py-24 bg-light/35" id="about">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">POURQUOI VISITER</span>
            <h2 className="font-serif text-navy text-3xl sm:text-4xl md:text-5xl font-black">
              Pourquoi Rejoindre l'Expo en <span className="text-gold">2026</span> ?
            </h2>
            <p className="text-gray-500 font-sans max-w-2xl mx-auto text-sm sm:text-base">
              L'Afrique enregistre la dynamique hôtelière et touristique de luxe la plus intense de la décennie. Les piscines intelligentes et les équipements spas de bien-être en sont un levier capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 rounded bg-navy text-gold flex items-center justify-center text-xl font-bold font-serif shadow-sm">
                🤝
              </div>
              <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-tight">Décideurs &amp; Acheteurs</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-sans">
                Rencontrez directement les investisseurs hôteliers, architectes, urbanistes en chef, directeurs de spas et installateurs agréés d'Afrique subsaharienne et du Maghreb.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 rounded bg-navy text-gold flex items-center justify-center text-xl font-bold font-serif shadow-sm">
                📈
              </div>
              <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-tight">Marché en Expansion</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-sans">
                Captez des opportunités exceptionnelles découlant du boom immobilier marocain de haut standing, du développement touristique côtier et des stratégies d'urbanisation durable.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 rounded bg-navy text-gold flex items-center justify-center text-xl font-bold font-serif shadow-sm">
                ✨
              </div>
              <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-tight">Vitrine &amp; Innovation</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-sans">
                Exposez vos technologies écologiques ou connectées (filtration bio, traitement d'eau économe, pompes haute performance, spas novateurs) en face-à-face durant 3 jours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 1: DETAILED EXHIBITION SECTORS ===== */}
      <section className="py-24 bg-gradient-to-b from-white to-light/20 border-t border-gray-100" id="secteurs">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">16 SECTEURS SPÉCIALISÉS</span>
            <h2 className="font-serif text-navy text-3xl sm:text-4xl md:text-5xl font-black">
              Explorez les secteurs de l'industrie <span className="text-gold">Pool, Spa & Outdoor</span>
            </h2>
            <p className="text-gray-500 font-sans max-w-2xl mx-auto text-sm sm:text-base">
              Découvrez le panorama complet des produits, technologies et services d'exception présentés par les plus grands leaders internationaux lors d'Africa Pool & Spa Expo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* 1. Piscines */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80" 
                  alt="Piscines" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Premium
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏊</span>
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Piscines</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Bassins résidentiels, piscines à débordement de luxe, couloirs de nage et innovations architecturales d'exception.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 2. Traitement de l'eau */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" 
                  alt="Traitement de l'eau" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Technique
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-gold" />
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Traitement de l'eau</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Solutions écologiques, électrolyse au sel de dernière génération, filtration UV et désinfection intelligente.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 3. Pompes & Filtration */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" 
                  alt="Pompes & Filtration" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Ingénierie
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚙️</span>
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Pompes & Filtration</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Systèmes de circulation haute performance, filtres à verre activé écologiques et pompes à vitesse variable.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 4. Chauffage & Pompes à chaleur */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80" 
                  alt="Chauffage & PAC" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Thermique
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-gold" />
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Chauffage & PAC</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Chauffage solaire innovant, échangeurs thermiques en titane et pompes à chaleur ultra-silencieuses.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 5. Spa & Wellness */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80" 
                  alt="Spa & Wellness" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Bien-être
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧖</span>
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Spa & Wellness</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Spas de relaxation haut de gamme, saunas scandinaves, hammams traditionnels sur mesure et rituels.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 6. Pergolas */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80" 
                  alt="Pergolas" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Structure
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gold" />
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Pergolas</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Pergolas bioclimatiques motorisées, toits rétractables imperméables et structures d'ombrage design.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 7. Paysagisme */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80" 
                  alt="Paysagisme" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Aménagement
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trees className="h-4 w-4 text-gold" />
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Paysagisme</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Jardins paysagers d'exception, chutes d'eau artistiques et végétalisation méditerranéenne & tropicale.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 8. Bois composite & Decking */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&auto=format&fit=crop&q=80" 
                  alt="Bois composite & Decking" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Matériaux
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🪵</span>
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Bois composite & Decking</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Terrasses ultra-résistantes, plages de piscine chaleureuses en bois naturel ou composite éco-responsable.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 9. Revêtements */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?w=600&auto=format&fit=crop&q=80" 
                  alt="Revêtements" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Finitions
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧱</span>
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Revêtements</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Mosaïques de verre d'art, liners armés 3D à effet texturé, enduits minéraux et pierres naturelles de piscine.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 10. Éclairage extérieur */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1565538810844-1e119412e866?w=600&auto=format&fit=crop&q=80" 
                  alt="Éclairage" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Lumière
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Éclairage</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Luminaires LED subaquatiques RGB, éclairages autonomes solaires et scénographies lumineuses pour parcs.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 11. Mobilier Outdoor */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80" 
                  alt="Mobilier Outdoor" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Design
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🪑</span>
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Mobilier Outdoor</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Salons de jardin résistants aux UV et au sel, lits de soleil ergonomiques de palace et canapés d'extérieur.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 12. Produits chimiques */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1617155093730-a8bf47be792d?w=600&auto=format&fit=crop&q=80" 
                  alt="Produits chimiques" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Expertise
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧪</span>
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Produits chimiques</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Équilibre de l'eau éco-responsable, oxygène actif, chlore stabilisé haute pureté et galets multifonctions.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 13. Pierre naturelle & margelles */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop&q=80" 
                  alt="Pierre naturelle" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Authenticité
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🪨</span>
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Pierre naturelle</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Dalles en travertin, margelles en granit noble, pierre de Bali haut de gamme et ardoises de caractère.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 14. Domotique & automatisation */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80" 
                  alt="Domotique" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Futuriste
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-gold" />
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Domotique</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Sondes intelligentes d'analyse en temps réel, régulations automatiques et contrôle domotique complet.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 15. Énergies renouvelables */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&auto=format&fit=crop&q=80" 
                  alt="Énergies renouvelables" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Écologie
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gold" />
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Énergies renouvelables</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Alimentation par panneaux photovoltaïques, couvertures solaires thermiques et systèmes à basse consommation.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* 16. Maintenance & Services */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80" 
                  alt="Maintenance & Services" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-navy/90 text-gold px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Solutions
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛠️</span>
                    <h4 className="font-serif font-bold text-navy text-sm sm:text-base uppercase tracking-tight">Maintenance & Services</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Audits énergétiques certifiés, rénovations structurelles lourdes, et contrats de maintenance hôtelière.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy group-hover:text-gold transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: INNOVATION SHOWCASE ===== */}
      <section className="bg-navy py-24 text-white relative overflow-hidden border-t border-b border-gold/20" id="innovations">
        {/* Decorative backdrop gradients */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">ART DE VIVRE EN EXTÉRIEUR</span>
            <h2 className="font-serif text-white text-3xl sm:text-4xl md:text-5xl font-black">
              Les Innovations du Secteur : <span className="text-gold">Outdoor Luxury</span>
            </h2>
            <p className="text-gray-300 font-sans max-w-2xl mx-auto text-sm sm:text-base">
              Plongez dans l'alliance du design de luxe et de la technologie environnementale pour sublimer vos terrasses et zones bien-être hôtelières.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Main spotlight item (7 cols) */}
            <div className="lg:col-span-7 bg-[#0a1f44] border border-gold/20 rounded-2xl overflow-hidden flex flex-col justify-between group h-full">
              <div className="relative h-96 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80" 
                  alt="Outdoor luxury concept" 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f44] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <span className="px-2.5 py-1 bg-gold text-navy rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                    CONGRES DE L'INNOVATION
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Piscines d'Exception & Architectures Connectées
                  </h3>
                </div>
              </div>
              <div className="p-8 text-left space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-gray-300 leading-relaxed font-sans">
                  Une immersion complète dans les infrastructures de piscines intelligentes à débordement de luxe, spas de relaxation sensoriels, pergolas bioclimatiques motorisées, et cuisines d'extérieur pour le secteur résidentiel et hôtelier haut de gamme en Afrique.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" />
                    <span>Conception sur mesure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" />
                    <span>Matériaux haute technologie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" />
                    <span>Régulation connectée par IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" />
                    <span>Basse consommation thermique</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid of details (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6 h-full">
              {/* Card 1: Wellness */}
              <div className="bg-[#0a1f44] border border-gold/20 rounded-2xl p-6 flex gap-4 text-left group hover:border-gold/50 transition-colors">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80" 
                    alt="Spas & Wellness" 
                    loading="lazy"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-serif font-bold text-white text-base">Spas & Saunas Intelligents</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Découvrez les cabines de sauna infrarouge à faible consommation, spas de nage à contre-courant et équipements de bien-être haut de gamme.
                  </p>
                </div>
              </div>

              {/* Card 2: Pergolas */}
              <div className="bg-[#0a1f44] border border-gold/20 rounded-2xl p-6 flex gap-4 text-left group hover:border-gold/50 transition-colors">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=300&auto=format&fit=crop&q=80" 
                    alt="Outdoor furniture" 
                    loading="lazy"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-serif font-bold text-white text-base">Pergolas & Mobilier de créateurs</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Pergolas bioclimatiques avec stations de recharge solaire, éclairages d'ambiance LED intégrés et canapés d'extérieur résistants.
                  </p>
                </div>
              </div>

              {/* Card 3: Ecology */}
              <div className="bg-[#0a1f44] border border-gold/20 rounded-2xl p-6 flex gap-4 text-left group hover:border-gold/50 transition-colors">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&auto=format&fit=crop&q=80" 
                    alt="Eco equipment" 
                    loading="lazy"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-serif font-bold text-white text-base">Traitement d'Eau Éco-Intelligent</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Systèmes d'hydrolyse pour désinfection bio sans chlore, filtres à sable de verre recyclé autonettoyants et pompes autonomes solaires.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-navy py-20 text-white relative overflow-hidden" id="opportunities">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none select-none">
          <QrCode className="w-full h-full text-gold stroke-[0.1]" />
        </div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-mono font-bold text-gold uppercase tracking-widest">FILM / APERÇU OFFICIEL DE L’EXPO</span>
            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
              Une Plateforme <span className="text-gold">Multinationale</span> au Cœur de Casablanca
            </h3>
            
            <p className="text-gray-300 leading-relaxed font-sans text-sm sm:text-base">
              L’Office des Foires et Expositions de Casablanca (OFEC) accueille ce sommet pour offrir des liaisons directes de négoce. En tant que hub financier nord-africain, le Maroc favorise les opportunités de réseaux exceptionnels.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-gold/20 text-gold text-xs font-bold font-mono mt-0.5 select-none">01</span>
                <div>
                  <h5 className="font-bold text-white text-sm">Rendez-vous pré-programmés (Formule B2B Match)</h5>
                  <p className="text-xs text-gray-400">Pour garantir des entretiens fructueux avec des investisseurs stratégiques.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-gold/20 text-gold text-xs font-bold font-mono mt-0.5 select-none">02</span>
                <div>
                  <h5 className="font-bold text-white text-sm">Conférences &amp; Séminaires Techniques</h5>
                  <p className="text-xs text-gray-400">Interventions d'experts certifiés sur le recyclage de l’eau et l'énergie solaire.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative border border-gold/30 rounded-xl overflow-hidden aspect-video bg-navy shadow-2xl">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/0DmmOvv9R-k?autoplay=1&mute=1&loop=1&playlist=0DmmOvv9R-k&controls=0&showinfo=0&rel=0"
                title="Africa Pool Spa Video Stream"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-navy/35 hover:bg-transparent transition-colors pointer-events-none flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gold border-2 border-white/40 flex items-center justify-center text-white text-[20px] shadow-lg">
                  ▶
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 text-center italic">
              Aperçu vidéo : Découvrez le dynamisme des infrastructures touristiques de spa et bien-être en Afrique
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: MARKET OPPORTUNITIES ===== */}
      <section className="py-24 bg-white border-b border-gray-100" id="opportunites-marche">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LHS (6 cols) */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">DÉVELOPPEMENT CONTINENTAL</span>
              <h2 className="font-serif text-navy text-3xl sm:text-4xl md:text-5xl font-black">
                Les opportunités du marché africain : <span className="text-gold">Secteur en plein essor</span>
              </h2>
              <p className="text-gray-500 font-sans text-sm sm:text-base leading-relaxed">
                L’Afrique connaît actuellement l’une des plus fortes dynamiques de développement d’infrastructures touristiques et résidentielles de luxe de la décennie. L’intégration de solutions d’eau de haute technologie et d’équipements bien-être d’exception s’impose aujourd’hui comme un critère de valorisation incontournable.
              </p>
              <p className="text-gray-500 font-sans text-sm leading-relaxed">
                Le Maroc, idéalement positionné comme hub stratégique régional, offre des conditions commerciales et fiscales optimales pour les constructeurs, distributeurs et équipementiers internationaux désireux de s'étendre sur le continent africain.
              </p>
              
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h5 className="font-bold text-navy text-sm font-serif">Hub Régional</h5>
                  <p className="text-xs text-gray-400">Le Maroc comme passerelle stratégique et commerciale de référence vers l'Afrique subsaharienne.</p>
                </div>
                <div className="space-y-1.5">
                  <h5 className="font-bold text-navy text-sm font-serif">Essor Touristique</h5>
                  <p className="text-xs text-gray-400">Une croissance exponentielle des investissements hôteliers haut de gamme et des complexes balnéaires.</p>
                </div>
              </div>
            </div>

            {/* RHS Illustrated business points (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Point 1 */}
              <div className="p-6 bg-light/30 border border-gray-100 rounded-xl flex gap-4 text-left group hover:border-gold/30 transition-all">
                <div className="w-12 h-12 bg-navy text-gold rounded-lg flex items-center justify-center text-xl font-bold flex-shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-navy text-base">Le boom résidentiel et hôtelier</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    La multiplication de projets résidentiels haut de gamme, de resorts côtiers et de rénovations de palaces crée une demande constante en équipements de piscines innovantes.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="p-6 bg-light/30 border border-gray-100 rounded-xl flex gap-4 text-left group hover:border-gold/30 transition-all">
                <div className="w-12 h-12 bg-navy text-gold rounded-lg flex items-center justify-center text-xl font-bold flex-shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-navy text-base">La transition écologique incontournable</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Les enjeux hydriques poussent les décideurs vers des solutions éco-conçues : recyclage d'eau, filtration économe, pompes solaires et régulations intelligentes.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="p-6 bg-light/30 border border-gray-100 rounded-xl flex gap-4 text-left group hover:border-gold/30 transition-all">
                <div className="w-12 h-12 bg-navy text-gold rounded-lg flex items-center justify-center text-xl font-bold flex-shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-navy text-base">L'explosion du Wellness haut de gamme</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Les spas, hammams haut de gamme et centres de bien-être deviennent des éléments centraux d'attractivité pour la clientèle internationale en quête de séjours d'exception.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: WHY EXHIBIT ===== */}
      <section className="py-24 bg-light/35 border-b border-gray-200/50" id="pourquoi-exposer">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">B2B OPPORTUNITÉS</span>
            <h2 className="font-serif text-navy text-3xl sm:text-4xl md:text-5xl font-black">
              Pourquoi exposer au salon ?
            </h2>
            <p className="text-gray-500 font-sans max-w-2xl mx-auto text-sm sm:text-base">
              Positionnez votre entreprise au centre de l'industrie de la piscine et du spa en Afrique, et accélérez votre croissance commerciale internationale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 text-left group"
            >
              <div className="w-12 h-12 rounded bg-navy text-gold flex items-center justify-center text-xl font-bold font-serif shadow-sm group-hover:bg-gold group-hover:text-navy transition-all">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-tight">Rencontrer des acheteurs qualifiés</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Échangez directement avec des décideurs à fort pouvoir d'achat : hôteliers, promoteurs immobiliers, architectes, et chefs de projets gouvernementaux.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 text-left group"
            >
              <div className="w-12 h-12 rounded bg-navy text-gold flex items-center justify-center text-xl font-bold font-serif shadow-sm group-hover:bg-gold group-hover:text-navy transition-all">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-tight">Lancer de nouveaux produits</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Profitez d'une vitrine internationale d'exception pour présenter vos innovations techniques, vos designs phares et vos exclusivités devant les médias du secteur.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 text-left group"
            >
              <div className="w-12 h-12 rounded bg-navy text-gold flex items-center justify-center text-xl font-bold font-serif shadow-sm group-hover:bg-gold group-hover:text-navy transition-all">
                <Compass className="h-5 w-5" />
              </div>
              <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-tight">Accéder au marché africain</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Prenez une longueur d'avance en vous implantant durablement dans l'un des marchés émergents les plus dynamiques du globe pour l'équipement d'extérieur.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 text-left group"
            >
              <div className="w-12 h-12 rounded bg-navy text-gold flex items-center justify-center text-xl font-bold font-serif shadow-sm group-hover:bg-gold group-hover:text-navy transition-all">
                <Briefcase className="h-5 w-5" />
              </div>
              <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-tight">Développer son réseau</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Renforcez vos liens avec les distributeurs locaux, trouvez de nouveaux partenaires technologiques ou commerciaux stratégiques et élargissez votre écosystème.
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 text-left group"
            >
              <div className="w-12 h-12 rounded bg-navy text-gold flex items-center justify-center text-xl font-bold font-serif shadow-sm group-hover:bg-gold group-hover:text-navy transition-all">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-tight">Générer des opportunités commerciales</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Détectez de nouveaux leads qualifiés pendant et après le salon grâce à notre système de mise en relation exclusif B2B Match pré-organisé.
              </p>
            </motion.div>

            {/* Card 6 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 text-left group"
            >
              <div className="w-12 h-12 rounded bg-navy text-gold flex items-center justify-center text-xl font-bold font-serif shadow-sm group-hover:bg-gold group-hover:text-navy transition-all">
                <Megaphone className="h-5 w-5" />
              </div>
              <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-tight">Augmenter sa visibilité de marque</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Affirmez votre statut d'acteur clé ou de leader du secteur auprès de l'ensemble de la profession et des délégations officielles africaines présentes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: WHO VISITS ===== */}
      <section className="py-24 bg-white border-b border-gray-100" id="qui-visite">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">DÉLÉGATIONS & PROFESSIONNELS</span>
            <h2 className="font-serif text-navy text-3xl sm:text-4xl md:text-5xl font-black">
              Qui visite le salon ?
            </h2>
            <p className="text-gray-500 font-sans max-w-2xl mx-auto text-sm sm:text-base">
              L'Africa Pool & Spa Expo rassemble un visitorat de pointe rigoureusement sélectionné et ciblé, représentant l'ensemble des experts de l'aménagement.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* 1 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">🏨</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Hôtels & Resorts</h5>
                <p className="text-[11px] text-gray-400">Directeurs généraux, responsables des achats et directeurs techniques de resorts.</p>
              </div>
            </div>

            {/* 2 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">🏗️</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Promoteurs immobiliers</h5>
                <p className="text-[11px] text-gray-400">Développeurs de complexes haut de gamme et d'infrastructures résidentielles.</p>
              </div>
            </div>

            {/* 3 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">📐</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Architectes</h5>
                <p className="text-[11px] text-gray-400">Cabinets d'architectures d'intérieur et designers d'espaces de vie prestigieux.</p>
              </div>
            </div>

            {/* 4 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">🏊</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Constructeurs de piscines</h5>
                <p className="text-[11px] text-gray-400">Installateurs, pisciniers spécialisés, techniciens et rénovateurs de bassins.</p>
              </div>
            </div>

            {/* 5 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">🌿</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Paysagistes</h5>
                <p className="text-[11px] text-gray-400">Architectes paysagers et designers d'extérieurs d'exception et terrasses.</p>
              </div>
            </div>

            {/* 6 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">🧖</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Centres de bien-être</h5>
                <p className="text-[11px] text-gray-400">Gérants de spas, centres thermaux, instituts de massage, thalassothérapies.</p>
              </div>
            </div>

            {/* 7 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">🏛️</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Collectivités</h5>
                <p className="text-[11px] text-gray-400">Décideurs publics, ingénieurs municipaux et directeurs d'équipements sportifs.</p>
              </div>
            </div>

            {/* 8 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">📦</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Distributeurs</h5>
                <p className="text-[11px] text-gray-400">Grossistes spécialisés en plomberie technique, chimie d'eau et pompage.</p>
              </div>
            </div>

            {/* 9 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">🛍️</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Revendeurs</h5>
                <p className="text-[11px] text-gray-400">Détaillants de mobilier outdoor, boutiques de bricolage et d'équipements.</p>
              </div>
            </div>

            {/* 10 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">🧱</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Entreprises du BTP</h5>
                <p className="text-[11px] text-gray-400">Entreprises de génie civil et de construction générale d'envergure.</p>
              </div>
            </div>

            {/* 11 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">💼</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Facility Managers</h5>
                <p className="text-[11px] text-gray-400">Gestionnaires de copropriétés de luxe, résidences et clubs de sports.</p>
              </div>
            </div>

            {/* 12 */}
            <div className="p-6 bg-light/30 border border-gray-100 rounded-xl text-left flex items-start gap-3 hover:border-gold/30 transition-all">
              <span className="text-2xl mt-0.5">💰</span>
              <div className="space-y-1">
                <h5 className="font-serif font-bold text-navy text-sm sm:text-base">Investisseurs</h5>
                <p className="text-[11px] text-gray-400">Fonds d'investissement, business angels et porteurs de projets d'envergure.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: WHY VISIT ===== */}
      <section className="py-24 bg-gradient-to-b from-light/20 to-white border-b border-gray-200/50" id="pourquoi-visiter">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">BÉNÉFICES VISITEURS</span>
            <h2 className="font-serif text-navy text-3xl sm:text-4xl md:text-5xl font-black">
              Pourquoi visiter le salon ?
            </h2>
            <p className="text-gray-500 font-sans max-w-2xl mx-auto text-sm sm:text-base">
              Participez à 3 jours d'échanges intenses, découvrez des technologies d'avant-garde et propulsez vos projets d'aménagement vers l'excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Benefit 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-left space-y-4 flex flex-col justify-between hover:border-gold/30 transition-colors">
              <div className="space-y-3">
                <span className="text-3xl">💡</span>
                <h4 className="font-serif font-bold text-navy text-base leading-snug">Découvrir les nouveautés</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Explorez en avant-première les dernières innovations mondiales en robotique de nettoyage, régulation pH et design outdoor.
                </p>
              </div>
              <div className="text-[10px] font-mono text-gold font-bold uppercase tracking-widest pt-2 border-t border-gray-50">01 / Innovations</div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-left space-y-4 flex flex-col justify-between hover:border-gold/30 transition-colors">
              <div className="space-y-3">
                <span className="text-3xl">🤝</span>
                <h4 className="font-serif font-bold text-navy text-base leading-snug">Rencontrer les fournisseurs</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Négociez en direct avec les fabricants et équipementiers mondiaux de premier plan sans intermédiaires commerciaux.
                </p>
              </div>
              <div className="text-[10px] font-mono text-gold font-bold uppercase tracking-widest pt-2 border-t border-gray-50">02 / Fournisseurs</div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-left space-y-4 flex flex-col justify-between hover:border-gold/30 transition-colors">
              <div className="space-y-3">
                <span className="text-3xl">🎤</span>
                <h4 className="font-serif font-bold text-navy text-base leading-snug">Assister aux conférences</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Profitez d'interventions de haut niveau animées par des experts internationaux sur l'eau éco-responsable et l'énergie solaire.
                </p>
              </div>
              <div className="text-[10px] font-mono text-gold font-bold uppercase tracking-widest pt-2 border-t border-gray-50">03 / Conférences</div>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-left space-y-4 flex flex-col justify-between hover:border-gold/30 transition-colors">
              <div className="space-y-3">
                <span className="text-3xl">🕸️</span>
                <h4 className="font-serif font-bold text-navy text-base leading-snug">Développer son réseau</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Établissez des relations de confiance durables avec l'ensemble des professionnels du Maghreb et d'Afrique subsaharienne.
                </p>
              </div>
              <div className="text-[10px] font-mono text-gold font-bold uppercase tracking-widest pt-2 border-t border-gray-50">04 / Networking</div>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-left space-y-4 flex flex-col justify-between hover:border-gold/30 transition-colors">
              <div className="space-y-3">
                <span className="text-3xl">⚖️</span>
                <h4 className="font-serif font-bold text-navy text-base leading-snug">Comparer les solutions</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Évaluez de manière critique des centaines de marques représentées au même endroit afin de choisir les meilleurs prix.
                </p>
              </div>
              <div className="text-[10px] font-mono text-gold font-bold uppercase tracking-widest pt-2 border-t border-gray-50">05 / Comparaison</div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-light/30" id="exposants">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="space-y-3 text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">DYNAMIQUE COMMERCIALE</span>
              <h2 className="font-serif text-navy text-3xl sm:text-4xl font-black">
                Ils Seront <span className="text-gold">Exposants</span>
              </h2>
              <p className="text-gray-500 max-w-lg text-xs sm:text-sm">
                Une liste d'exposants en temps réel synchronisée directement avec le serveur principal d'Africa Pool &amp; Spa.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <button
                id="organizer-console-panel-open"
                onClick={() => openAdminConsoleOrLogin('exhibitors')}
                className="px-4 py-2 border-2 border-gold/40 hover:border-gold/90 text-navy font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
              >
                {isAdminAuthenticated ? '⚙️ Ajouter Ma Société' : '🔒 Connexion Organisateur'} (Espace Organisateur)
              </button>
            </div>
          </div>

          {loadingExhibitors ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 text-gold animate-spin" />
              <p className="text-xs text-gray-500">Chargement de la liste des exposants...</p>
            </div>
          ) : exhibitors.length === 0 ? (
            <div className="bg-white p-12 text-center rounded border border-gray-100 max-w-md mx-auto">
              <p className="text-sm text-gray-500 font-medium">Aucun exposant trouvé dans la base.</p>
              <p className="text-xs text-gray-400 mt-1">Utilisez l'onglet "Exposants" dans la console d'administration pour en insérer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {exhibitors.map((ex) => (
                <motion.div 
                  key={ex.id}
                  whileHover={{ y: -3 }}
                  className="bg-white p-5 rounded-lg border border-gray-200/80 shadow-sm text-center flex flex-col justify-between min-h-[140px]"
                >
                  <div className="w-full h-16 mb-3 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center border border-gray-100 p-1">
                    {getExhibitorLogoUrl(ex) ? (
                      <img 
                        src={getExhibitorLogoUrl(ex)} 
                        alt={`${ex.name} Logo`} 
                        className="max-w-full max-h-full object-contain rounded-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-sm" style={{ backgroundColor: ex.logoColor || '#cbd5e1' }}>
                        {ex.highlightWord ? ex.highlightWord.charAt(0).toUpperCase() : ex.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-navy text-sm font-sans tracking-tight block">
                      {ex.name}
                    </h5>
                    {ex.highlightWord && (
                      <span className="text-[10px] text-gold font-bold uppercase tracking-wider mt-1 block">
                        {ex.highlightWord}
                      </span>
                    )}
                  </div>

                  <div className="text-[9px] text-gray-400 font-mono mt-2">
                    EX-ID: {ex.id.slice(3, 8)}...
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== LOWER EVENT ADVERTISEMENT & PROMOTION BANNER (PREMIUM CTA SECTION) ===== */}
      <section className="bg-navy relative py-28 text-white border-t-2 border-gold overflow-hidden" id="lower-stand-cta">
        {/* Ambient background decoration */}
        <div className="absolute inset-0 bg-radial-gradient from-navy-light/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute left-10 top-10 w-72 h-72 bg-navy-light/20 blur-2xl rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center space-y-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold font-mono">INSCRIPTIONS & RÉSERVATIONS EN COURS</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto">
            Propulsez Votre Entreprise au Coeur de <span className="text-gold italic font-serif">l'Écosystème</span> Africain
          </h2>
          
          <p className="text-gray-300 font-sans text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Que vous soyez fabricant international souhaitant étendre sa distribution, ou professionnel en quête des dernières avancées technologiques, l'Africa Pool &amp; Spa Expo est votre point d'ancrage stratégique.
          </p>

          {/* Premium visual benefits list before CTA buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto py-6 border-y border-white/10">
            <div className="text-center space-y-1">
              <div className="text-gold font-serif font-bold text-lg md:text-xl">150+</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Exposants Globaux</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-gold font-serif font-bold text-lg md:text-xl">Casablanca</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Hub Stratégique</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-gold font-serif font-bold text-lg md:text-xl">B2B Match</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Rendez-vous Ciblés</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-gold font-serif font-bold text-lg md:text-xl">Éco-Intelligent</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Focus Innovation</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              id="middle-reserve-stand-btn"
              onClick={() => setIsStandModalOpen(true)}
              className="px-8 py-4 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gold-light hover:shadow-xl transition-all w-full sm:w-auto shadow-md"
            >
              🛠️ Ouvrir le simulateur de stand
            </button>
            <button
              id="middle-b2b-badge-btn"
              onClick={() => setIsTicketModalOpen(true)}
              className="px-8 py-4 bg-navy-light border border-gold/40 text-gold font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gold hover:text-navy hover:border-gold transition-all w-full sm:w-auto"
            >
              🎟️ Demander mon Badge d'Accès
            </button>
          </div>
        </div>
      </section>

      {/* ===== MULTIPART CONTACT SECTION ===== */}
      <section className="py-24 bg-white" id="contact-section">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LHS Contacts, phone, social & addresses (5 cols) */}
            <div className="lg:col-span-4 space-y-6 text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">INFORMATIONS PRATIQUES</span>
              <h3 className="font-serif text-navy text-2xl sm:text-3xl font-extrabold leading-tight">
                Direction du Salon &amp; Réservations
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed">
                Le secrétariat général de l'Africa Pool &amp; Spa Expo est à votre entière disposition pour toute demande de plan sur mesure, accréditation de presse, ou sponsoring premium.
              </p>

              <div className="space-y-4 pt-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-light text-gold flex items-center justify-center font-bold">📞</div>
                  <div>
                    <div className="text-gray-400">Direction Casablanca:</div>
                    <div className="font-bold text-navy">+212 5 22 30 59 55</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-light text-gold flex items-center justify-center font-bold">💬</div>
                  <div>
                    <div className="text-gray-400">WhatsApp Commercial:</div>
                    <div className="font-bold text-navy">+212 661 482 497</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-light text-gold flex items-center justify-center font-bold">✉️</div>
                  <div>
                    <div className="text-gray-400">Email Général:</div>
                    <div className="font-bold text-navy hover:text-gold select-all">contact@africapoolspa.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-light text-gold flex items-center justify-center font-bold">📍</div>
                  <div>
                    <div className="text-gray-400">Emplacement Physique:</div>
                    <div className="font-bold text-navy">OFEC, Boulevard de l'éventail, Casablanca, Maroc</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => openAdminConsoleOrLogin('messages')}
                  className="text-xs font-bold text-gold hover:text-gold-light flex items-center gap-2 underline text-left"
                >
                  🔒 Accéder à l'espace de messagerie de l'exposition (Admin)
                </button>
              </div>
            </div>

            {/* RHS Interactive form (8 cols) */}
            <div className="lg:col-span-8 bg-light/40 p-8 rounded-lg border border-gray-200 text-left">
              <h4 className="font-serif text-lg font-bold text-navy mb-4">Écrire au Secrétariat Général</h4>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                
                {contactResultMsg.text && (
                  <div className={`p-4 rounded text-xs font-semibold ${
                    contactResultMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'
                  }`}>
                    {contactResultMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Nom Complet *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Karim Bensalah"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-gold focus:outline-none bg-white text-xs"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Email Professionnel *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Ex: k.bensalah@piscines-casa.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-gold focus:outline-none bg-white text-xs"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Téléphone Direct</label>
                    <input 
                      type="tel" 
                      placeholder="Ex: +212 6..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-gold focus:outline-none bg-white text-xs"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Objet du message *</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-gold focus:outline-none bg-white text-xs"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    >
                      <option value="Renseignements Généraux">Renseignements Généraux</option>
                      <option value="Demande d'implantation sur plan">Demande d'implantation sur plan</option>
                      <option value="Sponsoring & Partenariats">Sponsoring &amp; Partenariats</option>
                      <option value="Accréditation Presse & Média">Accréditation Presse &amp; Média</option>
                      <option value="Autre">Autre question ou support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70 mb-1">Votre Message *</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Saisissez ici le détail de votre demande. Notre comité administratif vous apportera une réponse personnalisée..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-gold focus:outline-none bg-white text-xs resize-none"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] text-gray-400">
                    * Informations obligatoires. Traitement sécurisé RGPD.
                  </p>
                  <button
                    type="submit"
                    disabled={isSendingMessage}
                    className="px-6 py-2.5 bg-navy text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-navy-light hover:shadow-md transition-all flex items-center gap-1.5"
                  >
                    {isSendingMessage ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Transmettant...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Envoyer →
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOTTOM FOOTER AREA ===== */}
      <footer className="bg-[#050f22] text-white/50 pt-16 pb-8 border-t border-white/5" id="main-footer">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/5">
            <div className="space-y-4">
              <Logo variant="horizontal" className="scale-90 origin-left" />
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                La référence absolue en Afrique pour la piscine et le spa. Un événement B2B incontournable conçu pour stimuler le tourisme haut de gamme.
              </p>
              <div className="text-xs text-gold font-bold">
                ⭐ Propulsé par le serveur Express + DB
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] uppercase tracking-wider text-gold font-bold">Espace Organisateur</h5>
              <div className="flex flex-col gap-2 text-xs">
                {isAdminAuthenticated ? (
                  <>
                    <button 
                      onClick={() => setIsAdminPanelOpen(true)}
                      className="text-left text-gray-300 hover:text-gold transition-colors block"
                    >
                      🔑 Console Administrateur
                    </button>
                    <button 
                      onClick={() => {
                        setIsAdminPanelOpen(true);
                        setAdminTab('stands');
                      }}
                      className="text-left text-gray-300 hover:text-gold transition-colors block"
                    >
                      📋 Validation de dossiers stands
                    </button>
                    <button
                      onClick={() => {
                        setIsAdminPanelOpen(true);
                        setAdminTab('visitors');
                      }}
                      className="text-left text-gray-300 hover:text-gold transition-colors block"
                    >
                      🎟️ Liste des badges professionnels
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsAdminLoginModalOpen(true)}
                    className="text-left text-gray-400 hover:text-gold transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="h-3 w-3 text-gold" /> Connexion Administrateur
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] uppercase tracking-wider text-gold font-bold">Secteurs techniques</h5>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>Pool Equipment - Équipement Piscine</li>
                <li>Water Treatment - Traitement de l’Eau</li>
                <li>Spa &amp; Wellness - Spas &amp; Bien-être</li>
                <li>Outdoor Living - Mobilier de Jardin</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] uppercase tracking-wider text-gold font-bold">Partenaires exposants</h5>
              <p className="text-xs text-gray-400">
                Saya Line, Frio Équipement, PoolSPA, PALEDO, CCEI, NWG, Atlanta Pompe, First Water, SWIN.LED.
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
            <p className="font-sans">
              © 2026 Africa Pool &amp; Spa Expo. Tous droits réservés. Événement professionnel de Casablanca.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-0 text-[10px] tracking-widest uppercase font-bold text-gray-500">
              <a href="#" className="hover:text-gold">LinkedIn</a>
              <span>•</span>
              <a href="#" className="hover:text-gold">Facebook</a>
              <span>•</span>
              <a href="#" className="hover:text-gold">Instagram</a>
            </div>
          </div>
        </div>
      </footer>


      {/* ===== INTERACTIVE MODALS INJECTION ===== */}
      <StandBookingModal 
        isOpen={isStandModalOpen} 
        onClose={() => setIsStandModalOpen(false)} 
        onSuccess={(newRes) => {
          fetchReservations(); // Sync standalone state
        }}
      />

      <VisitorTicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
        onSuccess={(newTicket) => {
          fetchTickets(); // Sync ticket state
        }}
      />


      {/* ===== SECURE ORGANIZER SIGNIN DIALOG ===== */}
      <AnimatePresence>
        {isAdminLoginModalOpen && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 font-sans" id="admin-login-modal-wrapper">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAdminLoginModalOpen(false);
                setAdminLoginError('');
              }}
              className="absolute inset-0 bg-[#050f22]/90 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0a1f44] border-2 border-gold/40 rounded-xl p-8 shadow-2xl text-white z-10 font-sans"
              id="admin-login-modal-content"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsAdminLoginModalOpen(false);
                  setAdminLoginError('');
                }}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors"
                title="Clore la fenêtre de connexion"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Padlock Accent banner */}
              <div className="flex flex-col items-center text-center space-y-3 mb-6">
                <div className="w-14 h-14 bg-gold/10 border border-gold/40 text-gold flex items-center justify-center rounded-full shadow-inner animate-[pulse_3s_infinite]">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold tracking-tight text-white">Espace Administrateur</h3>
                  <p className="text-xs text-gray-400 mt-1">Accès réservé aux organisateurs du salon de Casablanca</p>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                {adminLoginError && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded text-rose-300 text-xs text-left leading-relaxed">
                    ⚠️ {adminLoginError}
                  </div>
                )}

                <div className="space-y-1.5 text-left text-xs">
                  <label className="block text-gray-300 font-bold uppercase tracking-wider">Identifiant Administrateur</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gold" />
                    <input 
                      type="text"
                      required
                      autoFocus
                      placeholder="Identifiant de l'organisateur"
                      className="w-full bg-[#050f22] border border-gray-700 hover:border-gold/30 focus:border-gold rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all text-xs font-mono"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left text-xs">
                  <label className="block text-gray-300 font-bold uppercase tracking-wider">Mot de passe / Passcode</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gold" />
                    <input 
                      type="password"
                      required
                      placeholder="Mot de passe"
                      className="w-full bg-[#050f22] border border-gray-700 hover:border-gold/30 focus:border-gold rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-all text-xs font-mono"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gold text-navy font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gold-light transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <ShieldCheck className="h-4 w-4" /> Se connecter au Backoffice
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ===== OVERLAY SIDEBAR SLIDE PANEL — INTERACTIVE ORGANIZER BACKOFFICE ===== */}
      <AnimatePresence>
        {isAdminPanelOpen && isAdminAuthenticated && (
          <div className="fixed inset-0 z-[3000] flex justify-end" id="admin-backoffice-overlay-container">
            {/* Dark backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminPanelOpen(false)}
              className="absolute inset-0 bg-[#050f22]/80 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative bg-[#0a1f44] text-white w-full max-w-4xl h-full shadow-2xl border-l border-gold/40 flex flex-col z-10"
              id="admin-rolling-card"
            >
              
              {/* Header */}
              <div className="px-6 py-5 bg-navy-light text-white border-b border-gold/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sliders className="text-gold h-5 w-5" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      Organisateur Backoffice <span className="text-gold text-xs px-2 py-0.5 bg-gold/15 rounded">B2B Core API</span>
                    </h3>
                    <p className="text-[10px] text-gray-400">Simulation de gestion d'implantation, de badges et contact en temps réel</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      sessionStorage.removeItem('isAdminAuthenticated');
                      setIsAdminAuthenticated(false);
                      setIsAdminPanelOpen(false);
                    }}
                    className="px-2.5 py-1 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/20 rounded text-[10px] uppercase font-bold tracking-wider transition-all"
                  >
                    Se Déconnecter
                  </button>
                  <button 
                    onClick={() => setIsAdminPanelOpen(false)}
                    className="p-1 text-white hover:text-gold transition-colors"
                    title="Fermer la console"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Control Area Tabs */}
              <div className="px-6 bg-navy/95 border-b border-[#050f22] flex items-center justify-between flex-wrap gap-2 text-xs py-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setAdminTab('stands')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      adminTab === 'stands' ? 'bg-gold text-navy font-black' : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    ⛺ Stands ({filteredReservations.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('visitors')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      adminTab === 'visitors' ? 'bg-gold text-navy font-black' : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    🎫 Badges ({filteredTickets.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('messages')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      adminTab === 'messages' ? 'bg-gold text-navy font-black' : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    💬 Messages ({filteredMessages.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('exhibitors')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      adminTab === 'exhibitors' ? 'bg-gold text-navy font-black' : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    🏢 Edit Exposants ({exhibitors.length})
                  </button>
                  <button
                    onClick={() => setAdminTab('slides')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      adminTab === 'slides' ? 'bg-gold text-navy font-black' : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    🖼️ Diaporama ({backgroundImages.length})
                  </button>
                </div>

                {/* Search query input */}
                <div className="relative mt-1 sm:mt-0">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gold" />
                  <input
                    type="text"
                    placeholder="Filtrer..."
                    className="pl-8 pr-3 py-1 text-xs bg-navy border border-gray-700 rounded text-white focus:outline-none focus:border-gold w-36 sm:w-48 font-mono"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Data listing (Flex Scrollbody) */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6 text-left">
                
                {/* Real-time DB Connection Monitor (Support Supabase directly) */}
                <div className="bg-[#051330] border border-gold/25 rounded-lg p-4 mb-1" id="supabase-db-diagnostics-card">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-gold/10">
                        <Database className="h-4 w-4 text-gold shrink-0" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono tracking-wider text-gray-400 uppercase leading-none block">
                          Base de Données
                        </span>
                        <h5 className="text-xs font-bold text-white mt-0.5">
                          {dbStatus ? dbStatus.providerType : 'Détection du statut...'}
                        </h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {loadingDbStatus ? (
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                          <Loader2 className="h-3 w-3 animate-spin text-gold" />
                          <span>Pinging...</span>
                        </div>
                      ) : dbStatus?.actuallyConnected ? (
                        <div className="flex items-center gap-1.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded font-mono font-bold">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          <span>EN LIGNE (Supabase / Postgres)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded font-mono font-bold" title="Utilisation de fichiers locaux temporaires">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                          </span>
                          <span>MODE FALLBACK LOCAL</span>
                        </div>
                      )}

                      <button 
                        onClick={fetchDbStatus}
                        className="p-1 text-gold hover:bg-white/5 rounded transition-colors"
                        title="Rafraîchir l'état de connexion"
                      >
                        <svg className={`h-3.5 w-3.5 ${loadingDbStatus ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Masked database URL showcase */}
                  {dbStatus && (
                    <div className="text-[10.5px] bg-[#030d22] rounded border border-gray-800/80 p-2.5 font-mono space-y-1" id="supabase-details-box">
                      <div className="flex items-center justify-between text-[9px] text-gray-500">
                        <span>Chaîne de connexion active :</span>
                        <span className="text-[8px] uppercase font-bold tracking-wider px-1 bg-gold/10 text-gold rounded font-mono">
                          {dbStatus.usePrisma ? 'Prisma Client' : 'SQLite fallback'}
                        </span>
                      </div>
                      <div className="text-gray-300 break-all pr-6 relative flex items-center justify-between">
                        <span className="truncate max-w-[90%] font-mono text-gold text-[10px]">
                          {dbStatus.isPlaceholder || !dbStatus.maskedUrl 
                            ? 'expo-database.json (Fichier Local SQLite/JSON)' 
                            : dbStatus.maskedUrl
                          }
                        </span>
                        {!dbStatus.isPlaceholder && dbStatus.maskedUrl && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(dbStatus.maskedUrl);
                              setCopiedText(true);
                              setTimeout(() => setCopiedText(false), 2000);
                            }}
                            className="absolute right-0 hover:text-gold text-gray-500 transition-colors"
                            title="Copier l'URL de connexion masquée"
                          >
                            {copiedText ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                          </button>
                        )}
                      </div>

                      {dbStatus.connectionError && (
                        <div className="pt-1.5 border-t border-rose-500/15 text-[9.5px] text-rose-400 mt-1 leading-normal">
                          <div className="font-bold uppercase tracking-wider text-[8px] text-rose-300">Détail de l'erreur PostgreSQL / Supabase :</div>
                          <p className="font-mono bg-rose-950/20 p-1 rounded border border-rose-500/10 mt-0.5 select-text overflow-x-auto max-h-20">{dbStatus.connectionError}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Config assistance guide */}
                  <div className="mt-2 pl-0.5">
                    <button
                      onClick={() => setShowDbDiagnostics(!showDbDiagnostics)}
                      className="text-[9px] text-gold hover:text-white uppercase font-bold tracking-wider flex items-center gap-1 focus:outline-none transition-colors"
                    >
                      <span>{showDbDiagnostics ? '▼ Masquer' : '▶'} Comment connecter votre base Supabase ?</span>
                    </button>

                    {showDbDiagnostics && (
                      <div className="mt-2 text-xs text-gray-300 space-y-1.5 border-l border-gold/25 pl-3 py-0.5" id="supabase-step-guide">
                        <p className="text-[11px] leading-relaxed text-gray-300">
                          Pour connecter à vie votre propre base de données relationnelle <strong>Supabase (PostgreSQL)</strong>, procédez ainsi :
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-[10px] text-gray-400 font-sans leading-normal">
                          <li>
                            Créez un projet gratuit sur{' '}
                            <a 
                              href="https://supabase.com" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-gold underline hover:text-white inline-flex items-center gap-0.5"
                            >
                              supabase.com <ExternalLink className="h-2 w-2 inline" />
                            </a>
                          </li>
                          <li>
                            Allez dans <strong>Settings &gt; Database &gt; Connection Strings</strong>.
                          </li>
                          <li>
                            Copiez l'URI (de préférence le mode <strong>Transaction / PgBouncer</strong> sur le port 6543) et ajoutez-la en tant que secret de l'application dans les configurations d'environnement de la plateforme avec le nom de variable :
                            <div className="bg-black/40 p-1 rounded font-mono text-[9px] text-gray-200 mt-1">
                              <code className="text-gold font-bold select-all">POSTGRES_PRISMA_URL="votre_uri_supabase"</code>
                            </div>
                          </li>
                        </ol>
                        <p className="text-[9px] text-gray-400 italic leading-snug">
                          💡 Dès que cette clé secrète sera renseignée, l'application basculera instantanément au statut <span className="text-emerald-400 font-bold">EN LIGNE</span>, créera vos tables par Prisma, et y synchronisera les données de l'Exposition !
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {adminTab === 'stands' && (
                  <div className="space-y-4">
                    <div className="border-b border-gray-800 pb-2">
                      <h4 className="font-serif font-bold text-white text-base">
                        Demandes d'Implantation Stands d'Expositions
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        Chaque exposant transmet son souhait de stand et sa surface (9 à 54 m²). Validez ou refusez l'implantation en temps réel.
                      </p>
                    </div>

                    {filteredReservations.length === 0 ? (
                      <div className="py-12 text-center text-gray-500 font-mono text-xs">
                        Aucune demande d'implantation enregistrée sous ce filtre.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredReservations.map((item) => (
                          <div 
                            key={item.id} 
                            className="bg-navy-light/40 border border-gray-800 rounded-lg p-4 space-y-3 hover:border-gold/30 transition-all font-sans"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h5 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                                  {item.companyName}
                                  <span className={`text-[8px] tracking-widest uppercase font-extrabold px-2 py-0.5 rounded ${
                                    item.standType === 'premium' ? 'bg-gold text-navy' : 'bg-gray-700 text-gray-300'
                                  }`}>
                                    {item.standType} {item.standSize} m²
                                  </span>
                                </h5>
                                <p className="text-xs text-gold font-mono font-bold mt-0.5">{item.sector}</p>
                              </div>

                              <div className="flex items-center gap-1.5 select-none">
                                <span className="text-[10px] text-gray-400 mr-2 font-mono">{new Date(item.createdAt).toLocaleDateString()}</span>
                                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase font-mono ${
                                  item.status === 'approved' 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : item.status === 'rejected'
                                      ? 'bg-rose-500/20 text-rose-400'
                                      : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed font-sans italic bg-black/10 p-2.5 rounded border border-white/5">
                              "{item.description || 'Pas d’instructions fournies'}"
                            </p>

                            <div className="text-xs space-y-1 text-gray-400 font-mono">
                              <div>👤 Représentant : <strong>{item.contactName}</strong> ({item.email})</div>
                              <div>📞 Numéro de Mobile B2B : <span className="select-all">{item.phone}</span></div>
                              {item.assignedLocation && (
                                <div className="text-emerald-400 font-bold bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20 mt-1">
                                  📍 Stand Attribué sur le plan : {item.assignedLocation}
                                </div>
                              )}
                            </div>

                            {/* Actions bar for Organizer simulation */}
                            <div className="flex items-center justify-end gap-2 border-t border-gray-800 pt-3">
                              <button
                                onClick={() => handleDeleteReservation(item.id)}
                                title="Supprimer la demande de stand"
                                className="p-1 px-2.5 rounded text-xs text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors mr-auto font-mono"
                              >
                                <Trash2 className="h-3.5 w-3.5 inline mr-1" /> Supprimer
                              </button>

                              {item.status !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateReservationStatus(item.id, 'approved')}
                                  className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] uppercase rounded hover:bg-emerald-500 transition-colors"
                                >
                                  ✔ Approuver &amp; Assigner Espace
                                </button>
                              )}
                              
                              {item.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateReservationStatus(item.id, 'rejected')}
                                  className="px-3 py-1 bg-rose-600/30 border border-rose-600 text-rose-300 font-bold text-[10px] uppercase rounded hover:bg-rose-600 hover:text-white transition-all"
                                >
                                  ✖ Refuser l'Agréation
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {adminTab === 'visitors' && (
                  <div className="space-y-4">
                    <div className="border-b border-gray-800 pb-2">
                      <h4 className="font-serif font-bold text-white text-base">
                        Visiteurs Professionnels Enregistrés (Accréditations)
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        Liste en direct des participants ayant obtenu un badge professionnel de passage de 3 jours à l'OFEC Casablanca.
                      </p>
                    </div>

                    {filteredTickets.length === 0 ? (
                      <div className="py-12 text-center text-gray-500 font-mono text-xs">
                        Aucun e-badge professionnel identifié sous ce filtre.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {filteredTickets.map((tkt) => (
                          <div 
                            key={tkt.id} 
                            className="bg-navy-light/10 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs"
                          >
                            <div className="space-y-1">
                              <div className="font-bold text-white text-sm font-sans uppercase">
                                {tkt.firstName} {tkt.lastName}
                              </div>
                              <div className="text-gold font-bold">{tkt.jobTitle} - <span className="text-white font-normal">{tkt.company}</span></div>
                              <div className="text-gray-400">Email: {tkt.email} | Portable: {tkt.phone}</div>
                              <div className="text-gray-500 text-[10px]">Centres d'intérêt: <strong>{tkt.sectorInterest}</strong></div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1.5 self-stretch sm:self-auto justify-between sm:justify-center">
                              <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/20">
                                {tkt.ticketNumber}
                              </span>
                              <span className="text-[10px] text-gray-400">Inscrit le {new Date(tkt.createdAt).toLocaleDateString()}</span>
                              
                              <button
                                onClick={() => {
                                  // Trigger mock popup badge or details easily by opening badge popup
                                  setIsTicketModalOpen(true);
                                }}
                                className="text-[10px] text-gold hover:underline flex items-center gap-1 font-serif mt-1 font-sans"
                              >
                                🖨️ Simuler impression de badge
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {adminTab === 'messages' && (
                  <div className="space-y-4">
                    <div className="border-b border-gray-800 pb-2">
                      <h4 className="font-serif font-bold text-white text-base">
                        Messages &amp; Accréditations du Secrétariat Général
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        Visualisez les courriers directeurs d’utilisateurs cherchant à exposer ou à lier des alliances.
                      </p>
                    </div>

                    {filteredMessages.length === 0 ? (
                      <div className="py-12 text-center text-gray-500 font-mono text-xs">
                        Aucun courrier reçu ou filtre n'a trouvé de résultats.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`p-4 rounded-lg border transition-all ${
                              msg.read ? 'bg-navy-light/10 border-gray-800' : 'bg-gold/5 border-gold/30'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div>
                                <span className="font-bold text-sm text-white font-sans block">{msg.name}</span>
                                <span className="text-xs text-gray-400 font-mono">{msg.email} {msg.phone ? `| Tél: ${msg.phone}` : ''}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 font-mono">{new Date(msg.createdAt).toLocaleString()}</span>
                                {!msg.read && (
                                  <span className="bg-gold text-navy font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded">
                                    Nouveau
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 text-xs font-mono text-gray-300 font-bold border-b border-gray-800/60 pb-1">
                              Objet: <span className="text-gold">{msg.subject}</span>
                            </div>

                            <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-line">
                              {msg.message}
                            </p>

                            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-800/40">
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1 px-2 rounded hover:bg-red-500/10 text-red-400 text-xs font-mono mr-auto"
                              >
                                Supprimer
                              </button>

                              {!msg.read && (
                                <button
                                  onClick={() => handleMarkMessageRead(msg.id)}
                                  className="px-2.5 py-1 bg-white/10 hover:bg-gold hover:text-navy text-[10px] font-bold uppercase rounded transition-colors"
                                >
                                  Marquer comme lu
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {adminTab === 'exhibitors' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-800 pb-2">
                      <h4 className="font-serif font-bold text-white text-base">
                        Éditeur et Insertion d'Exposants (Dynamique API)
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        Ajoutez directement un nouveau sponsor ou prestataire exposé pour qu'il soit instancié sur la vitrine publique d'accueil !
                      </p>
                    </div>

                    {/* New exhibitor form */}
                    <form onSubmit={handleAddExhibitorSubmit} className="bg-navy-light/30 border border-gray-800 p-4 rounded-lg space-y-4">
                      <h5 className="text-xs font-extrabold uppercase text-gold tracking-widest flex items-center gap-1.5">
                        <Plus className="h-4 w-4" /> Insérer un Établissement
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-400 mb-1">Nom d'Exposant *</label>
                          <input 
                            type="text"
                            required
                            placeholder="Mosaïque Aqua Sarl"
                            className="w-full bg-navy border border-gray-700 rounded px-2.5 py-2 text-white text-xs focus:outline-none focus:border-gold font-mono"
                            value={newExhibitorForm.name}
                            onChange={(e) => setNewExhibitorForm({ ...newExhibitorForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1">Slogan ou Marque</label>
                          <input 
                            type="text"
                            placeholder="AQUAMARINE"
                            className="w-full bg-navy border border-gray-700 rounded px-2.5 py-2 text-white text-xs focus:outline-none focus:border-gold font-mono"
                            value={newExhibitorForm.highlightWord}
                            onChange={(e) => setNewExhibitorForm({ ...newExhibitorForm, highlightWord: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-400 mb-1">Couleur thématique du logo</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color"
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                              value={newExhibitorForm.logoColor}
                              onChange={(e) => setNewExhibitorForm({ ...newExhibitorForm, logoColor: e.target.value })}
                            />
                            <span className="font-mono text-xs">{newExhibitorForm.logoColor}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-400 mb-1">URL de l'image du Logo (Optionnel)</label>
                          <input 
                            type="url"
                            placeholder="https://images.unsplash.com/... ou URL d'image"
                            className="w-full bg-navy border border-gray-700 rounded px-2.5 py-2 text-white text-xs focus:outline-none focus:border-gold font-mono"
                            value={newExhibitorForm.logoUrl}
                            onChange={(e) => setNewExhibitorForm({ ...newExhibitorForm, logoUrl: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isAddingExhibitor}
                          className="px-5 py-2 bg-gold text-navy font-black text-xs uppercase tracking-wider rounded hover:bg-gold-light hover:shadow transition-all disabled:opacity-50"
                        >
                          {isAddingExhibitor ? 'Insertion...' : 'Enregistrer Exposant'}
                        </button>
                      </div>
                    </form>

                    {/* Miniature list of exhibitors with deletion rights */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-xs uppercase text-gray-400 tracking-wider">
                        Liste Actuelle ({exhibitors.length})
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                        {exhibitors.map((ex) => (
                          <div key={ex.id} className="bg-[#050f22]/50 border border-gray-800 rounded p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getExhibitorLogoUrl(ex) ? (
                                <img 
                                  src={getExhibitorLogoUrl(ex)} 
                                  alt="Icon" 
                                  className="w-6 h-6 rounded object-cover border border-gray-800"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: ex.logoColor || '#c8922a' }} />
                              )}
                              <span className="text-white font-sans font-bold">{ex.name}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteExhibitor(ex.id)}
                              className="text-red-400 hover:text-red-500 p-1"
                              title="Retirer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminTab === 'slides' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-800 pb-2 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h4 className="font-serif font-bold text-white text-base">
                          Gestionnaire du Diaporama Hero (Dynamique API)
                        </h4>
                        <p className="text-[10px] text-gray-400">
                          Configurez, supprimez et réordonnez les images d'arrière-plan de la section principale d'accueil.
                        </p>
                      </div>
                      <button
                        onClick={handleResetSlides}
                        disabled={isSavingSlides}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                      >
                        🔄 Réinitialiser
                      </button>
                    </div>

                    {/* Add slide form */}
                    <div className="bg-navy-light/30 border border-gray-800 p-4 rounded-lg space-y-3">
                      <h5 className="text-xs font-extrabold uppercase text-gold tracking-widest flex items-center gap-1.5">
                        <Plus className="h-4 w-4" /> Ajouter une Image au Diaporama
                      </h5>
                      <div className="flex gap-2">
                        <input 
                          type="url"
                          placeholder="https://images.unsplash.com/... ou URL absolue de l'image"
                          className="flex-1 bg-navy border border-gray-700 rounded px-2.5 py-2 text-white text-xs focus:outline-none focus:border-gold font-mono"
                          value={adminSlidesInput}
                          onChange={(e) => setAdminSlidesInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSlide(adminSlidesInput);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSlide(adminSlidesInput)}
                          className="px-4 py-2 bg-gold text-navy font-black text-xs uppercase tracking-wider rounded hover:bg-gold-light transition-all cursor-pointer"
                        >
                          Ajouter
                        </button>
                      </div>

                      {/* Fast suggestions */}
                      <div className="text-[10px] text-gray-400">
                        <span className="font-bold">Suggestions rapides : </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => handleAddSlide('https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1200&auto=format&fit=crop')}
                            className="bg-navy border border-gray-800 hover:border-gold/50 text-[9px] text-gray-300 px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            ➕ Piscine Design
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddSlide('https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop')}
                            className="bg-navy border border-gray-800 hover:border-gold/50 text-[9px] text-gray-300 px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            ➕ Spa & Wellness
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddSlide('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop')}
                            className="bg-navy border border-gray-800 hover:border-gold/50 text-[9px] text-gray-300 px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            ➕ Extérieur Thermal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddSlide('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop')}
                            className="bg-navy border border-gray-800 hover:border-gold/50 text-[9px] text-gray-300 px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            ➕ Événementiel B2B
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Current slideshow queue */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-1">
                        <h5 className="font-bold text-xs uppercase text-gray-400 tracking-wider">
                          Diapositives Actuelles ({backgroundImages.length})
                        </h5>
                        <span className="text-[10px] text-gray-400 italic">
                          💡 Cliquez sur une image pour l'apercevoir en fond du Hero
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {backgroundImages.map((slide, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setCurrentBgIndex(idx)}
                            className={`group bg-[#050f22]/50 border rounded p-3 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                              currentBgIndex === idx ? 'border-gold bg-gold/5' : 'border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="font-mono text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded shrink-0">
                                #{idx + 1}
                              </div>
                              <img 
                                src={slide} 
                                alt={`Slide ${idx + 1}`} 
                                className="w-16 h-10 object-cover rounded border border-gray-800 shrink-0"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as any).src = 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=200&auto=format&fit=crop';
                                }}
                              />
                              <div className="min-w-0">
                                <p className="text-xs text-white truncate font-mono select-all">
                                  {slide}
                                </p>
                                {currentBgIndex === idx && (
                                  <span className="text-[9px] text-gold font-bold uppercase tracking-wider block mt-0.5">
                                    ★ En cours d'aperçu
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveSlide(idx, 'up')}
                                className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Monter"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={idx === backgroundImages.length - 1}
                                onClick={() => handleMoveSlide(idx, 'down')}
                                className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Descendre"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSlide(idx)}
                                className="p-1 hover:bg-red-500/10 rounded text-red-400 hover:text-red-500 ml-1 cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-gray-800 flex justify-end">
                      <button
                        onClick={handleSaveSlides}
                        disabled={isSavingSlides}
                        className="px-6 py-2.5 bg-gold text-navy font-extrabold text-xs uppercase tracking-wider rounded hover:bg-gold-light hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingSlides ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-navy" /> Enregistrement...
                          </>
                        ) : (
                          'Enregistrer le Diaporama'
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer status bar */}
              <div className="p-4 bg-[#050f22] border-t border-gray-800 text-center text-[10px] text-gray-400 font-mono">
                Connecté au serveur Express Node.js • Port 3000 • expo-database.json
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* Floating AI Chat Assistant */}
      <AIChatAssistant />

    </div>
  );
}
