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
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Imports of modals & types
import StandBookingModal from './components/StandBookingModal';
import VisitorTicketModal from './components/VisitorTicketModal';
import Logo from './components/Logo';
import type { Exhibitor, StandReservation, VisitorTicket, ContactMessage } from './types';

export default function App() {
  // Lists fetched from Backend API
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [reservations, setReservations] = useState<StandReservation[]>([]);
  const [tickets, setTickets] = useState<VisitorTicket[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

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
  const [adminTab, setAdminTab] = useState<'stands' | 'visitors' | 'messages' | 'exhibitors'>('stands');
  const [adminSearch, setAdminSearch] = useState('');
  const [newExhibitorForm, setNewExhibitorForm] = useState({ name: '', highlightWord: '', logoColor: '#c8922a' });
  const [isAddingExhibitor, setIsAddingExhibitor] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Securely request and route admin console access and tab redirections
  const openAdminConsoleOrLogin = (defaultTab?: 'stands' | 'visitors' | 'messages' | 'exhibitors') => {
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
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de l’envoi.');
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
        setNewExhibitorForm({ name: '', highlightWord: '', logoColor: '#c8922a' });
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
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-25" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1600&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#050f22] via-[#0a1f44]/98 to-[#0a1f44]/60 z-0" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left" id="hero-left-col">
            <span className="inline-block px-3 py-1 bg-gold/10 border border-gold/40 text-gold text-[10px] font-bold tracking-widest uppercase rounded">
              💎 Édition Spéciale — Leadership &amp; Innovation
            </span>

            <h1 className="font-serif text-white tracking-tight leading-none text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">
              AFRICA <br />
              <span className="text-gold">POOL &amp; SPA</span> <br />
              EXPO <span className="text-gold">2026</span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-sans">
              Le rendez-vous unique des infrastructures aquatiques, de la domotique et du bien-être pour l'industrie hôtelière et touristique en pleine expansion sur le continent africain.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-white text-sm sm:text-base">
                <Calendar className="h-5 w-5 text-gold flex-shrink-0" />
                <span><strong>20 au 22 Octobre 2026</strong> — Sessions professionnelles B2B</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm sm:text-base">
                <MapPin className="h-5 w-5 text-gold flex-shrink-0" />
                <span><strong>OFEC</strong> — Office des Foires et Expositions de Casablanca, Maroc</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
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

          {/* Quick interactive floor card summary */}
          <div className="lg:col-span-5 relative" id="hero-right-col">
            <div className="bg-[#050f22]/85 backdrop-blur-md rounded-xl p-6 border border-gold/30 hover:border-gold/60 transition-colors shadow-2xl text-left space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Statut du Plan de Stand (LIVE)
                </span>
                <span className="text-[10px] font-mono font-bold bg-gold/15 text-gold px-2.5 py-1 rounded">
                  OFEC Hall Principal
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Sociétés Enregistrées:</span>
                  <span className="font-bold text-white font-mono">{reservations.length}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Dont Premium VIP:</span>
                  <span className="font-bold text-gold font-mono">
                    {reservations.filter(r => r.standType === 'premium').length}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Visiteurs Professionnels Accrédités:</span>
                  <span className="font-bold text-emerald-400 font-mono">{tickets.length}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-300">
                  <span>En attente de validation commerciale:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {reservations.filter(r => r.status === 'pending').length}
                  </span>
                </div>
              </div>

              {isAdminAuthenticated ? (
                <>
                  <div className="bg-light/5 p-3.5 rounded border border-white/5 space-y-1.5 text-xs text-gray-400 font-sans">
                    <span className="font-bold font-sans text-white text-[10px] uppercase block tracking-wider">Note Organisateur :</span>
                    <p className="leading-relaxed">
                      Utilisez la Console Admin (en haut à droite) pour simuler la validation commerciale, attribuer des numéros physiques de stands ou inspecter les participants.
                    </p>
                  </div>

                  <div className="pt-2 font-sans">
                    <button
                      onClick={() => setIsAdminPanelOpen(true)}
                      className="w-full py-2.5 bg-navy border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider rounded hover:bg-gold hover:text-navy hover:border-gold transition-all text-center block font-sans"
                    >
                      Ouvrir le Backoffice de Gestion →
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-light/5 p-3.5 rounded border border-white/5 space-y-1.5 text-xs text-gray-400 font-sans">
                  <span className="font-bold font-sans text-gold text-[10px] uppercase block tracking-wider">Information de Réservation :</span>
                  <p className="leading-relaxed">
                    Les attributions d'emplacements et de stands physiques dans le hall du salon de l'OFEC sont mises à jour régulièrement après validation par le comité directeur.
                  </p>
                </div>
              )}
            </div>
          </div>
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

      {/* ===== OUR SECTORS OF EXPERTISE ===== */}
      <section className="py-24 bg-white" id="secteurs">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">PANORAMA DU SALON</span>
            <h2 className="font-serif text-navy text-3xl sm:text-4xl md:text-5xl font-black">
              Secteurs Thématiques à l'<span>OFEC</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
              Découvrez les 6 univers et zones stratégiques d'exposition pour maximiser l'excellence technique et commerciale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative rounded-lg overflow-hidden group aspect-[4/3] shadow-md border border-gray-100">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=450&q=80" alt="Pool Equipment" className="w-full height-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-2xl mb-1 flex items-center justify-between">
                  <span>⚙️</span>
                  <span className="text-[10px] tracking-widest uppercase text-gold font-mono font-bold">Zone A</span>
                </div>
                <h4 className="font-serif font-bold text-base uppercase tracking-tight text-white mb-1">Pool Equipment &amp; Accessories</h4>
                <p className="text-xs text-gray-300">Pompes à chaleur, liners, éclairage LED subaquatique et robots...</p>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden group aspect-[4/3] shadow-md border border-gray-100">
              <img src="https://images.unsplash.com/photo-1559825481-12a05cc00344?w=450&q=80" alt="Water Treatment" className="w-full height-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-2xl mb-1 flex items-center justify-between">
                  <span>💧</span>
                  <span className="text-[10px] tracking-widest uppercase text-gold font-mono font-bold">Zone B</span>
                </div>
                <h4 className="font-serif font-bold text-base uppercase tracking-tight text-white mb-1">Water Treatment</h4>
                <p className="text-xs text-gray-300">Désinfection sans chlore, filtre écologique, électrolyseurs...</p>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden group aspect-[4/3] shadow-md border border-gray-100">
              <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=450&q=80" alt="Spa & Wellness" className="w-full height-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-2xl mb-1 flex items-center justify-between">
                  <span>🧘</span>
                  <span className="text-[10px] tracking-widest uppercase text-gold font-mono font-bold">Zone C</span>
                </div>
                <h4 className="font-serif font-bold text-base uppercase tracking-tight text-white mb-1">Spa &amp; Wellness</h4>
                <p className="text-xs text-gray-300">Jacuzzis haut de gamme, cabines de saunas hammams, esthétique...</p>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden group aspect-[4/3] shadow-md border border-gray-100">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=450&q=80" alt="Outdoor Living" className="w-full height-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-2xl mb-1 flex items-center justify-between">
                  <span>🌿</span>
                  <span className="text-[10px] tracking-widest uppercase text-gold font-mono font-bold">Zone D</span>
                </div>
                <h4 className="font-serif font-bold text-base uppercase tracking-tight text-white mb-1">Outdoor Living</h4>
                <p className="text-xs text-gray-300">Mobilier d'extérieur en teck, pergolas bioclimatiques...</p>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden group aspect-[4/3] shadow-md border border-gray-100">
              <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=450&q=80" alt="Hospitality Solutions" className="w-full height-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-2xl mb-1 flex items-center justify-between">
                  <span>🏨</span>
                  <span className="text-[10px] tracking-widest uppercase text-gold font-mono font-bold">Zone E</span>
                </div>
                <h4 className="font-serif font-bold text-base uppercase tracking-tight text-white mb-1">Hospitality Solutions</h4>
                <p className="text-xs text-gray-300">Architectures de piscine pour villages vacances et resorts...</p>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden group aspect-[4/3] shadow-md border border-gray-100">
              <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=450&q=80" alt="Automation & Digital" className="w-full height-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-2xl mb-1 flex items-center justify-between">
                  <span>🤖</span>
                  <span className="text-[10px] tracking-widest uppercase text-gold font-mono font-bold">Zone F</span>
                </div>
                <h4 className="font-serif font-bold text-base uppercase tracking-tight text-white mb-1">Automation &amp; Digital</h4>
                <p className="text-xs text-gray-300">Analyse de l'eau connectée par IA, régulateurs automatiques...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EMBED VIDEO PORTRAYAL / MAP ADVERT ===== */}
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

      {/* ===== EXHIBITORS SECTION (DYNAMIC FROM BACKEND) ===== */}
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
                  <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm text-navy mb-3" style={{ backgroundColor: ex.logoColor || '#e2e8f0' }}>
                    {ex.highlightWord ? ex.highlightWord.charAt(0).toUpperCase() : ex.name.charAt(0)}
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

      {/* ===== LOWER EVENT ADVERTISEMENT & PROMOTION BANNER ===== */}
      <section className="bg-gradient-to-r from-navy to-navy-light py-20 text-white border-t-2 border-gold" id="lower-stand-cta">
        <div className="container mx-auto px-6 lg:px-12 text-center space-y-6 max-w-3xl">
          <span className="text-xs uppercase font-extrabold tracking-widest text-gold font-mono">ENREGISTREMENT OUVERT</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black">
            Bâtissez de Grandes Alliances Commerciales
          </h2>
          <p className="text-gray-300 font-sans text-sm sm:text-base leading-relaxed">
            Configurez votre type de stand de <strong>9m² à 54m²</strong>, visualisez en temps réel son coût HT sur notre estimateur financier et transmettez le dossier en direct pour la commission d’implantation OFEC 2026.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              id="middle-reserve-stand-btn"
              onClick={() => setIsStandModalOpen(true)}
              className="px-8 py-3.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gold-light hover:shadow-xl transition-all w-full sm:w-auto"
            >
              🛠️ Ouvrir le simulateur de stand
            </button>
            <button
              id="middle-b2b-badge-btn"
              onClick={() => setIsTicketModalOpen(true)}
              className="px-8 py-3.5 bg-navy-light border border-gold/40 text-gold font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gold hover:text-navy hover:border-gold transition-all w-full sm:w-auto"
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

                        <div className="flex items-end justify-end">
                          <button
                            type="submit"
                            disabled={isAddingExhibitor}
                            className="px-5 py-2 bg-gold text-navy font-black text-xs uppercase tracking-wider rounded hover:bg-gold-light hover:shadow transition-all disabled:opacity-50"
                          >
                            {isAddingExhibitor ? 'Insertion...' : 'Enregistrer Exposant'}
                          </button>
                        </div>
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
                              <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: ex.logoColor || '#c8922a' }} />
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

              </div>

              {/* Footer status bar */}
              <div className="p-4 bg-[#050f22] border-t border-gray-800 text-center text-[10px] text-gray-400 font-mono">
                Connecté au serveur Express Node.js • Port 3000 • expo-database.json
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
