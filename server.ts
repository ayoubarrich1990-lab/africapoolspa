import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { Exhibitor, StandReservation, VisitorTicket, ContactMessage } from './src/types.js';

const app = express();
const PORT = 3000;

// Enable JSON parsing
app.use(express.json());

// Define DB path
const DB_FILE = path.join(process.cwd(), 'expo-database.json');

interface DatabaseSchema {
  exhibitors: Exhibitor[];
  reservations: StandReservation[];
  tickets: VisitorTicket[];
  messages: ContactMessage[];
}

// Default initial database to populate on first run
const getInitialDb = (): DatabaseSchema => {
  return {
    exhibitors: [
      { id: 'ex-1', name: 'Saya Line', highlightWord: 'Saya' },
      { id: 'ex-2', name: 'Frio Équipement', highlightWord: 'Frio' },
      { id: 'ex-3', name: 'PoolSPA', highlightWord: 'SPA' },
      { id: 'ex-4', name: 'PALEDO', highlightWord: 'PALEDO' },
      { id: 'ex-5', name: 'CCEI', highlightWord: 'CCEI' },
      { id: 'ex-6', name: 'NWG', highlightWord: 'NWG' },
      { id: 'ex-7', name: 'Atlanta Pompe', highlightWord: 'Atlanta' },
      { id: 'ex-8', name: 'First Water', highlightWord: 'First' },
      { id: 'ex-9', name: 'SWIN.LED', highlightWord: 'SWIN.LED' },
    ],
    reservations: [
      {
        id: 'res-1',
        companyName: 'Saya Line Corp',
        contactName: 'Ayoub Arrich',
        email: 'ayoubarrich1990@gmail.com',
        phone: '+212 6 61 48 24 97',
        sector: 'Pool Equipment',
        standSize: 36,
        standType: 'premium',
        description: 'Ligne prestigieuse de spas nordiques pour hôtels.',
        status: 'approved',
        createdAt: new Date('2026-05-18T10:11:00Z').toISOString(),
        assignedLocation: 'Zone Excellence - Stand N°01',
      },
      {
        id: 'res-2',
        companyName: 'AquaTech Maroc',
        contactName: 'Youssef El Mansouri',
        email: 'contact@aquatech.ma',
        phone: '+212 5 22 45 12 36',
        sector: 'Water Treatment',
        standSize: 18,
        standType: 'standard',
        description: 'Systèmes de filtration écologique par gravité.',
        status: 'pending',
        createdAt: new Date('2026-05-20T14:32:00Z').toISOString(),
      },
      {
        id: 'res-3',
        companyName: 'ThermaSpa Wellness',
        contactName: 'Sophie Lebrun',
        email: 's.lebrun@thermaspa.fr',
        phone: '+33 6 12 34 56 78',
        sector: 'Spa & Wellness',
        standSize: 54,
        standType: 'premium',
        description: 'Saunas panoramiques extérieurs à haute efficacité énergétique.',
        status: 'approved',
        createdAt: new Date('2026-05-15T09:00:00Z').toISOString(),
        assignedLocation: 'Zone Wellness - Stand N°12',
      },
    ],
    tickets: [
      {
        id: 'tkt-1',
        firstName: 'Karim',
        lastName: 'Bennani',
        company: 'Mosaïque & Piscine Sarl',
        jobTitle: 'Directeur Général',
        email: 'karim.bennani@mosaicpool.ma',
        phone: '+212 6 55 99 88 77',
        sectorInterest: 'Outdoor Living',
        createdAt: new Date('2026-05-19T11:24:00Z').toISOString(),
        ticketNumber: 'APS-2026-89410',
      },
      {
        id: 'tkt-2',
        firstName: 'Elena',
        lastName: 'Rostova',
        company: 'Atlas Resorts Luxury',
        jobTitle: 'Responsable Approvisionnement',
        email: 'e.rostova@atlasresorts.com',
        phone: '+212 6 10 20 30 40',
        sectorInterest: 'Hospitality Solutions',
        createdAt: new Date('2026-05-21T16:10:00Z').toISOString(),
        ticketNumber: 'APS-2026-10523',
      },
    ],
    messages: [
      {
        id: 'msg-1',
        name: 'Ahmed Alaoui',
        email: 'ahmed.alaoui@gmail.com',
        phone: '+212 6 12 34 56 78',
        subject: 'Demande de partenariat média de presse',
        message: 'Bonjour, nous souhaitons couvrir l’événement Africa Pool & Spa Expo 2026 pour notre magazine spécialisé hôtellerie. Quels sont les formulaires d’accréditation ?',
        createdAt: new Date('2026-05-19T15:44:00Z').toISOString(),
        read: false,
      },
    ],
  };
};

// Helper atomic file DB actions
const readDb = (): DatabaseSchema => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const db = getInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      return db;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading database file, returning default initial structure.', err);
    return getInitialDb();
  }
};

const writeDb = (data: DatabaseSchema): boolean => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to database file.', err);
    return false;
  }
};

// ================= API ENDPOINTS =================

// 1. EXHIBITORS API
app.get('/api/exhibitors', (req, res) => {
  const db = readDb();
  res.json(db.exhibitors);
});

app.post('/api/exhibitors', (req, res) => {
  const db = readDb();
  const { name, highlightWord, logoColor } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Le nom de l’exposant est obligatoire.' });
    return;
  }

  const newExhibitor: Exhibitor = {
    id: `ex-${Date.now()}`,
    name,
    highlightWord: highlightWord || name.split(' ')[0],
    logoColor: logoColor || '#c8922a',
  };

  db.exhibitors.push(newExhibitor);
  writeDb(db);
  res.status(201).json(newExhibitor);
});

app.delete('/api/exhibitors/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const initialLength = db.exhibitors.length;
  db.exhibitors = db.exhibitors.filter((item) => item.id !== id);

  if (db.exhibitors.length === initialLength) {
    res.status(404).json({ error: 'Exposant non trouvé.' });
    return;
  }

  writeDb(db);
  res.json({ success: true, message: 'Exposant supprimé avec succès.' });
});

// 2. STAND RESERVATIONS API
app.get('/api/reservations', (req, res) => {
  const db = readDb();
  res.json(db.reservations);
});

app.post('/api/reservations', (req, res) => {
  const db = readDb();
  const { companyName, contactName, email, phone, sector, standSize, standType, description } = req.body;

  if (!companyName || !contactName || !email || !phone || !sector || !standSize) {
    res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    return;
  }

  const newReservation: StandReservation = {
    id: `res-${Date.now()}`,
    companyName,
    contactName,
    email,
    phone,
    sector,
    standSize: Number(standSize),
    standType: standType || 'standard',
    description: description || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.reservations.unshift(newReservation);
  writeDb(db);
  res.status(201).json(newReservation);
});

app.patch('/api/reservations/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { status, assignedLocation, standSize, standType, sector } = req.body;

  const reservationIdx = db.reservations.findIndex((item) => item.id === id);
  if (reservationIdx === -1) {
    res.status(404).json({ error: 'Réservation non trouvée.' });
    return;
  }

  const current = db.reservations[reservationIdx];
  if (status !== undefined) current.status = status;
  if (assignedLocation !== undefined) current.assignedLocation = assignedLocation;
  if (standSize !== undefined) current.standSize = Number(standSize);
  if (standType !== undefined) current.standType = standType;
  if (sector !== undefined) current.sector = sector;

  writeDb(db);
  res.json(current);
});

app.delete('/api/reservations/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const initialLength = db.reservations.length;
  db.reservations = db.reservations.filter((item) => item.id !== id);

  if (db.reservations.length === initialLength) {
    res.status(404).json({ error: 'Réservation non trouvée.' });
    return;
  }

  writeDb(db);
  res.json({ success: true, message: 'Réservation supprimée.' });
});

// 3. TICKETS / VISITOR REGISTRATIONS API
app.get('/api/tickets', (req, res) => {
  const db = readDb();
  res.json(db.tickets);
});

app.post('/api/tickets', (req, res) => {
  const db = readDb();
  const { firstName, lastName, company, jobTitle, email, phone, sectorInterest } = req.body;

  if (!firstName || !lastName || !company || !email || !phone) {
    res.status(400).json({ error: 'Veuillez saisir toutes les informations du visiteur.' });
    return;
  }

  // Generate unique randomized Ticket number
  const uniqueNum = Math.floor(10000 + Math.random() * 90000);
  const ticketNumber = `APS-2026-${uniqueNum}`;

  const newTicket: VisitorTicket = {
    id: `tkt-${Date.now()}`,
    firstName,
    lastName,
    company,
    jobTitle: jobTitle || 'Professionnel',
    email,
    phone,
    sectorInterest: sectorInterest || 'Général',
    createdAt: new Date().toISOString(),
    ticketNumber,
  };

  db.tickets.unshift(newTicket);
  writeDb(db);
  res.status(201).json(newTicket);
});

// 4. CONTACT MESSAGES API
app.get('/api/messages', (req, res) => {
  const db = readDb();
  res.json(db.messages);
});

app.post('/api/messages', (req, res) => {
  const db = readDb();
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Nom, Email et Message sont requis.' });
    return;
  }

  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    subject: subject || 'Formulaire de contact',
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  db.messages.unshift(newMessage);
  writeDb(db);
  res.status(201).json(newMessage);
});

app.patch('/api/messages/:id/read', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const msg = db.messages.find((item) => item.id === id);
  if (!msg) {
    res.status(404).json({ error: 'Message non trouvé.' });
    return;
  }

  msg.read = true;
  writeDb(db);
  res.json(msg);
});

app.delete('/api/messages/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const initialLength = db.messages.length;
  db.messages = db.messages.filter((item) => item.id !== id);

  if (db.messages.length === initialLength) {
    res.status(404).json({ error: 'Message non trouvé.' });
    return;
  }

  writeDb(db);
  res.json({ success: true, message: 'Message supprimé.' });
});


// ================= VITE OR STATIC MIDDLEWARE MOUNTING =================

async function configureServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite middleware in development mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);
    console.log('⚡ Running Express with Vite HMR middleware (Development)');
  } else {
    // Serve build directory in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('📦 Serving compiled static bundle (Production)');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Africa Pool & Spa Expo 2026 server running at http://localhost:${PORT}`);
  });
}

configureServer().catch((err) => {
  console.error('Failed to configure and boot the Express + Vite server:', err);
});
