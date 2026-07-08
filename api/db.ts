import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import type { Exhibitor, StandReservation, VisitorTicket, ContactMessage } from '../src/types.js';

// Identify environment
const isVercel = process.env.VERCEL === '1' || !!process.env.NOW_REGION;

// Define JSON DB fallback path
const JSON_DB_FILE = isVercel
  ? path.join('/tmp', 'expo-database.json')
  : path.join(process.cwd(), 'expo-database.json');

interface DatabaseSchema {
  exhibitors: Exhibitor[];
  reservations: StandReservation[];
  tickets: VisitorTicket[];
  messages: ContactMessage[];
}

// Default initial database for JSON fallback and DB seeding
const getInitialDb = (): DatabaseSchema => {
  return {
    exhibitors: [
      { id: 'ex-1', name: 'ATLANTA POMPE', highlightWord: 'Saya', logoColor: '#38bdf8', logoUrl: '/src/assets/images/regenerated_image_1781003477006.png' },
      { id: 'ex-2', name: 'Frio Équipement', highlightWord: 'Frio', logoColor: '#60a5fa', logoUrl: '/src/assets/images/regenerated_image_1781000604311.jpg' },
      { id: 'ex-3', name: 'SAYA LINE', highlightWord: 'SPA', logoColor: '#0ea5e9', logoUrl: '/src/assets/images/regenerated_image_1781003247380.png' },
      { id: 'ex-4', name: 'PALEDO', highlightWord: 'PALEDO', logoColor: '#0284c7', logoUrl: '/src/assets/images/regenerated_image_1781001514526.png' },
      { id: 'ex-5', name: 'CCEI', highlightWord: 'CCEI', logoColor: '#10b981', logoUrl: '/src/assets/images/regenerated_image_1781001515196.webp' },
      { id: 'ex-6', name: 'NWG', highlightWord: 'NWG', logoColor: '#14b8a6', logoUrl: '/src/assets/images/regenerated_image_1781001515827.png' },
      { id: 'ex-7', name: 'POOLSPA', highlightWord: 'First', logoColor: '#0ea5e9', logoUrl: '/src/assets/images/regenerated_image_1781003246792.webp' },
      { id: 'ex-8', name: 'First Water', highlightWord: 'First', logoColor: '#2563eb', logoUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=200&auto=format&fit=crop' },
      { id: 'ex-9', name: 'SWIN.LED', highlightWord: 'SWIN.LED', logoColor: '#a855f7', logoUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=200&auto=format&fit=crop' },
      { id: 'ex-10', name: 'VERSÔ Signature', highlightWord: 'VERSÔ', logoColor: '#0ea5e9', logoUrl: '/src/assets/images/regenerated_image_1781001516746.png' },
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

// JSON Read/Write helpers for local developer environment fallback
const readJsonDb = (): DatabaseSchema => {
  try {
    if (!fs.existsSync(JSON_DB_FILE)) {
      const sourcePath = path.join(process.cwd(), 'expo-database.json');
      if (fs.existsSync(sourcePath)) {
        const content = fs.readFileSync(sourcePath, 'utf-8');
        fs.writeFileSync(JSON_DB_FILE, content, 'utf-8');
        return JSON.parse(content) as DatabaseSchema;
      }
      const defaultDb = getInitialDb();
      fs.writeFileSync(JSON_DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const data = fs.readFileSync(JSON_DB_FILE, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (err) {
    console.warn("JSON fallback read error:", err);
    return getInitialDb();
  }
};

const writeJsonDb = (db: DatabaseSchema) => {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error("JSON fallback write error:", err);
  }
};

// Initiate Prisma database client singleton cleanly
let prisma: PrismaClient | null = null;
let usePrisma = false;

// Prioritize fully qualified pool/non-pool connections over the localized container/kubernetes DATABASE_URL
const rawDbUrl = (process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.af_DATABASE_URL || '').trim();

// Auto-expand raw API Key / token into a fully qualified PostgreSQL URI if they just passed the plain token
let dbUrl = rawDbUrl;
if (rawDbUrl && !rawDbUrl.startsWith('postgres://') && !rawDbUrl.startsWith('postgresql://') && !rawDbUrl.startsWith('prisma://')) {
  // If it's a token like sk_... or AQ...., we wrap it in the connection URI on db.prisma.io
  dbUrl = `postgres://46828d3027a0a5c8cf06b33b26d6874e3e19dbbbbcc820483da9ec659b5f56f8:${rawDbUrl}@db.prisma.io:5432/postgres?sslmode=require`;
}

const isPlaceholder = !dbUrl || dbUrl.includes('xxx') || dbUrl.includes('placeholder');

// Helper to gracefully detect Prisma connection/init errors and failover to local JSON database
function handlePrismaError(err: any, operationName: string) {
  console.error(`❌ Prisma operation failed in ${operationName}:`, err);
  if (err && (
    String(err).includes('PrismaClient') ||
    String(err).includes('Can\'t reach database') ||
    String(err).includes('Initialization') ||
    String(err).includes('Invalid database URL') ||
    String(err).includes('P1001') ||
    String(err).includes('P1012') ||
    String(err).includes('P2002') ||
    String(err).includes('socket')
  )) {
    console.warn(`⚠️ Connection or initialization alert detected during Prisma ${operationName}. Swapped to JSON Local Fallback mode (usePrisma = false).`);
    usePrisma = false;
  }
}

if (dbUrl && !isPlaceholder) {
  try {
    // Force set environment variables required by schema.prisma so Prisma doesn't throw at initialization
    process.env.POSTGRES_PRISMA_URL = dbUrl;
    process.env.DATABASE_URL = dbUrl;

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
    usePrisma = true;
    console.log("🟢 PostgreSQL connection configured with Prisma.");
  } catch (err) {
    console.error("❌ Failed to initiate Prisma client:", err);
    usePrisma = false;
  }
} else {
  console.log("ℹ️ POSTGRES_PRISMA_URL placeholder or missing. Running in local JSON Database Fallback mode.");
  usePrisma = false;
}

// Seed the base PostgreSQL tables automatically if they are fully empty
export async function setupDatabase(): Promise<boolean> {
  if (!usePrisma || !prisma) return false;
  try {
    console.log("🛠️ Checking and provisioning default data inside PostgreSQL database using Prisma...");

    // 1. EXHIBITORS SEED
    const exhibitorCount = await prisma.exhibitor.count();
    if (exhibitorCount === 0) {
      console.log("🌱 Database is empty for Exhibitors. Seeding default tables...");
      const initial = getInitialDb();
      for (const ex of initial.exhibitors) {
        await prisma.exhibitor.create({
          data: {
            id: ex.id,
            name: ex.name,
            highlightWord: ex.highlightWord || null,
            logoColor: ex.logoColor || null,
            logoUrl: ex.logoUrl || null,
          },
        });
      }
    }

    // 2. RESERVATIONS SEED
    const reservationCount = await prisma.reservation.count();
    if (reservationCount === 0) {
      console.log("🌱 Database is empty for Reservations. Seeding default tables...");
      const initial = getInitialDb();
      for (const res of initial.reservations) {
        await prisma.reservation.create({
          data: {
            id: res.id,
            companyName: res.companyName,
            contactName: res.contactName,
            email: res.email,
            phone: res.phone,
            sector: res.sector,
            standSize: res.standSize,
            standType: res.standType,
            description: res.description || null,
            status: res.status,
            createdAt: res.createdAt,
            assignedLocation: res.assignedLocation || null,
          },
        });
      }
    }

    // 3. TICKETS SEED
    const ticketCount = await prisma.ticket.count();
    if (ticketCount === 0) {
      console.log("🌱 Database is empty for Visitor Tickets. Seeding default tables...");
      const initial = getInitialDb();
      for (const tkt of initial.tickets) {
        await prisma.ticket.create({
          data: {
            id: tkt.id,
            firstName: tkt.firstName,
            lastName: tkt.lastName,
            company: tkt.company,
            jobTitle: tkt.jobTitle,
            email: tkt.email,
            phone: tkt.phone,
            sectorInterest: tkt.sectorInterest,
            createdAt: tkt.createdAt,
            ticketNumber: tkt.ticketNumber,
          },
        });
      }
    }

    // 4. MESSAGES SEED
    const messageCount = await prisma.message.count();
    if (messageCount === 0) {
      console.log("🌱 Database is empty for Messages. Seeding default tables...");
      const initial = getInitialDb();
      for (const msg of initial.messages) {
        await prisma.message.create({
          data: {
            id: msg.id,
            name: msg.name,
            email: msg.email,
            phone: msg.phone || null,
            subject: msg.subject || null,
            message: msg.message,
            createdAt: msg.createdAt,
            read: msg.read,
          },
        });
      }
    }

    // 5. ENSURE EX-8 AND EX-10 COMPATIBILITY AND AUTO-UPDATE
    if (usePrisma && prisma) {
      try {
        // Ensure ex-1 has the newly regenerated logo Url in backend
        const ex1 = await prisma.exhibitor.findUnique({ where: { id: 'ex-1' } });
        if (ex1 && ex1.logoUrl !== '/src/assets/images/regenerated_image_1781003477006.png') {
          await prisma.exhibitor.update({
            where: { id: 'ex-1' },
            data: {
              logoUrl: '/src/assets/images/regenerated_image_1781003477006.png'
            }
          });
          console.log("🔄 Updated ex-1 (Saya Line) logoUrl in Postgres database.");
        }
        // Ensure ex-3 has the newly regenerated logo Url in backend
        const ex3 = await prisma.exhibitor.findUnique({ where: { id: 'ex-3' } });
        if (ex3 && ex3.logoUrl !== '/src/assets/images/regenerated_image_1781003247380.png') {
          await prisma.exhibitor.update({
            where: { id: 'ex-3' },
            data: {
              logoUrl: '/src/assets/images/regenerated_image_1781003247380.png'
            }
          });
          console.log("🔄 Updated ex-3 (PoolSPA) logoUrl in Postgres database.");
        }

        // Ensure ex-7 has the newly regenerated logo Url and name in backend
        const ex7 = await prisma.exhibitor.findUnique({ where: { id: 'ex-7' } });
        if (ex7 && (ex7.logoUrl !== '/src/assets/images/regenerated_image_1781003246792.webp' || ex7.name !== 'First Water' || ex7.highlightWord !== 'First')) {
          await prisma.exhibitor.update({
            where: { id: 'ex-7' },
            data: {
              name: 'First Water',
              highlightWord: 'First',
              logoUrl: '/src/assets/images/regenerated_image_1781003246792.webp'
            }
          });
          console.log("🔄 Updated ex-7 (First Water) logo and name in Postgres database.");
        }

        // Restore ex-8 to First Water
        const ex8 = await prisma.exhibitor.findUnique({ where: { id: 'ex-8' } });
        if (ex8 && ex8.name !== 'First Water') {
          await prisma.exhibitor.update({
            where: { id: 'ex-8' },
            data: {
              name: 'First Water',
              highlightWord: 'First',
              logoUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=200&auto=format&fit=crop',
            },
          });
          console.log("🔄 Restored ex-8 to 'First Water' inside PostgreSQL database.");
        }

        // Add or ensure ex-10 for VERSÔ Signature
        const ex10 = await prisma.exhibitor.findUnique({ where: { id: 'ex-10' } });
        if (!ex10) {
          await prisma.exhibitor.create({
            data: {
              id: 'ex-10',
              name: 'VERSÔ Signature',
              highlightWord: 'VERSÔ',
              logoColor: '#0ea5e9',
              logoUrl: '/src/assets/images/regenerated_image_1781001516746.png',
            },
          });
          console.log("✨ Added ex-10 'VERSÔ Signature' to PostgreSQL database.");
        } else if (ex10.name !== 'VERSÔ Signature') {
          await prisma.exhibitor.update({
            where: { id: 'ex-10' },
            data: {
              name: 'VERSÔ Signature',
              highlightWord: 'VERSÔ',
              logoColor: '#0ea5e9',
              logoUrl: '/src/assets/images/regenerated_image_1781001516746.png',
            },
          });
        }
      } catch (dbErr) {
        console.warn("Could not auto-verify/update exhibitors in Postgres:", dbErr);
      }
    }

    console.log("✨ database fully preloaded and synchronized using Prisma v5.");
    return true;
  } catch (err) {
    handlePrismaError(err, 'setupDatabase');
    return false;
  }
}

// ---------------- DATABASE CRUD OPERATIONS ----------------

// ===== 1. EXHIBITORS =====
export async function getExhibitors(): Promise<Exhibitor[]> {
  if (usePrisma && prisma) {
    try {
      const list = await prisma.exhibitor.findMany({
        orderBy: { name: 'asc' },
      });
      return list.map(item => ({
        id: item.id,
        name: item.name,
        highlightWord: item.highlightWord || undefined,
        logoColor: item.logoColor || undefined,
        logoUrl: item.logoUrl || undefined,
      }));
    } catch (err) {
      handlePrismaError(err, 'getExhibitors');
    }
  }
  return readJsonDb().exhibitors;
}

export async function addExhibitor(exhibitor: Exhibitor): Promise<Exhibitor> {
  if (usePrisma && prisma) {
    try {
      const saved = await prisma.exhibitor.create({
        data: {
          id: exhibitor.id,
          name: exhibitor.name,
          highlightWord: exhibitor.highlightWord || null,
          logoColor: exhibitor.logoColor || null,
          logoUrl: exhibitor.logoUrl || null,
        },
      });
      return {
        id: saved.id,
        name: saved.name,
        highlightWord: saved.highlightWord || undefined,
        logoColor: saved.logoColor || undefined,
        logoUrl: saved.logoUrl || undefined,
      };
    } catch (err) {
      handlePrismaError(err, 'addExhibitor');
    }
  }
  const db = readJsonDb();
  db.exhibitors.push(exhibitor);
  writeJsonDb(db);
  return exhibitor;
}

export async function deleteExhibitor(id: string): Promise<boolean> {
  if (usePrisma && prisma) {
    try {
      const deleted = await prisma.exhibitor.delete({
        where: { id },
      });
      return !!deleted;
    } catch (err) {
      handlePrismaError(err, 'deleteExhibitor');
    }
  }
  const db = readJsonDb();
  const initialLength = db.exhibitors.length;
  db.exhibitors = db.exhibitors.filter(x => x.id !== id);
  writeJsonDb(db);
  return db.exhibitors.length < initialLength;
}


// ===== 2. STAND RESERVATIONS =====
export async function getReservations(): Promise<StandReservation[]> {
  if (usePrisma && prisma) {
    try {
      const list = await prisma.reservation.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return list.map(item => ({
        id: item.id,
        companyName: item.companyName,
        contactName: item.contactName,
        email: item.email,
        phone: item.phone,
        sector: item.sector,
        standSize: item.standSize,
        standType: item.standType as 'standard' | 'premium',
        description: item.description || undefined,
        status: item.status as 'pending' | 'approved' | 'rejected',
        createdAt: item.createdAt,
        assignedLocation: item.assignedLocation || undefined,
      }));
    } catch (err) {
      handlePrismaError(err, 'getReservations');
    }
  }
  return readJsonDb().reservations;
}

export async function addReservation(reservation: StandReservation): Promise<StandReservation> {
  if (usePrisma && prisma) {
    try {
      const saved = await prisma.reservation.create({
        data: {
          id: reservation.id,
          companyName: reservation.companyName,
          contactName: reservation.contactName,
          email: reservation.email,
          phone: reservation.phone,
          sector: reservation.sector,
          standSize: reservation.standSize,
          standType: reservation.standType,
          description: reservation.description || null,
          status: reservation.status,
          createdAt: reservation.createdAt,
          assignedLocation: reservation.assignedLocation || null,
        },
      });
      return {
        id: saved.id,
        companyName: saved.companyName,
        contactName: saved.contactName,
        email: saved.email,
        phone: saved.phone,
        sector: saved.sector,
        standSize: saved.standSize,
        standType: saved.standType as 'standard' | 'premium',
        description: saved.description || undefined,
        status: saved.status as 'pending' | 'approved' | 'rejected',
        createdAt: saved.createdAt,
        assignedLocation: saved.assignedLocation || undefined,
      };
    } catch (err) {
      handlePrismaError(err, 'addReservation');
    }
  }
  const db = readJsonDb();
  db.reservations.unshift(reservation);
  writeJsonDb(db);
  return reservation;
}

export async function updateReservation(id: string, updates: Partial<StandReservation>): Promise<StandReservation | null> {
  if (usePrisma && prisma) {
    try {
      // Create updates object dynamically with only valid Prisma fields
      const data: any = {};
      if (updates.companyName !== undefined) data.companyName = updates.companyName;
      if (updates.contactName !== undefined) data.contactName = updates.contactName;
      if (updates.email !== undefined) data.email = updates.email;
      if (updates.phone !== undefined) data.phone = updates.phone;
      if (updates.sector !== undefined) data.sector = updates.sector;
      if (updates.standSize !== undefined) data.standSize = Number(updates.standSize);
      if (updates.standType !== undefined) data.standType = updates.standType;
      if (updates.description !== undefined) data.description = updates.description || null;
      if (updates.status !== undefined) data.status = updates.status;
      if (updates.assignedLocation !== undefined) data.assignedLocation = updates.assignedLocation || null;

      const saved = await prisma.reservation.update({
        where: { id },
        data,
      });

      return {
        id: saved.id,
        companyName: saved.companyName,
        contactName: saved.contactName,
        email: saved.email,
        phone: saved.phone,
        sector: saved.sector,
        standSize: saved.standSize,
        standType: saved.standType as 'standard' | 'premium',
        description: saved.description || undefined,
        status: saved.status as 'pending' | 'approved' | 'rejected',
        createdAt: saved.createdAt,
        assignedLocation: saved.assignedLocation || undefined,
      };
    } catch (err) {
      handlePrismaError(err, 'updateReservation');
    }
  }
  const db = readJsonDb();
  const idx = db.reservations.findIndex(x => x.id === id);
  if (idx === -1) return null;
  const item = db.reservations[idx];
  const updatedItem = { ...item, ...updates };
  db.reservations[idx] = updatedItem;
  writeJsonDb(db);
  return updatedItem;
}

export async function deleteReservation(id: string): Promise<boolean> {
  if (usePrisma && prisma) {
    try {
      const deleted = await prisma.reservation.delete({
        where: { id },
      });
      return !!deleted;
    } catch (err) {
      handlePrismaError(err, 'deleteReservation');
    }
  }
  const db = readJsonDb();
  const initialLength = db.reservations.length;
  db.reservations = db.reservations.filter(x => x.id !== id);
  writeJsonDb(db);
  return db.reservations.length < initialLength;
}


// ===== 3. VISITOR TICKETS =====
export async function getTickets(): Promise<VisitorTicket[]> {
  if (usePrisma && prisma) {
    try {
      const list = await prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return list.map(item => ({
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        company: item.company,
        jobTitle: item.jobTitle,
        email: item.email,
        phone: item.phone,
        sectorInterest: item.sectorInterest,
        createdAt: item.createdAt,
        ticketNumber: item.ticketNumber,
      }));
    } catch (err) {
      handlePrismaError(err, 'getTickets');
    }
  }
  return readJsonDb().tickets;
}

export async function addTicket(ticket: VisitorTicket): Promise<VisitorTicket> {
  console.log(`[db.ts:addTicket] Starting operation for ticket ID: ${ticket.id}. usePrisma = ${usePrisma}, prisma client is ${prisma ? 'defined' : 'null'}`);
  
  if (usePrisma && prisma) {
    try {
      console.log(`[db.ts:addTicket] Attempting to insert ticket into Postgres using Prisma. TicketNumber: ${ticket.ticketNumber}`);
      const saved = await prisma.ticket.create({
        data: {
          id: ticket.id,
          firstName: ticket.firstName,
          lastName: ticket.lastName,
          company: ticket.company,
          jobTitle: ticket.jobTitle,
          email: ticket.email,
          phone: ticket.phone,
          sectorInterest: ticket.sectorInterest,
          createdAt: ticket.createdAt,
          ticketNumber: ticket.ticketNumber,
        },
      });
      console.log(`[db.ts:addTicket] Successfully inserted ticket in Postgres database. ID: ${saved.id}`);
      return {
        id: saved.id,
        firstName: saved.firstName,
        lastName: saved.lastName,
        company: saved.company,
        jobTitle: saved.jobTitle,
        email: saved.email,
        phone: saved.phone,
        sectorInterest: saved.sectorInterest,
        createdAt: saved.createdAt,
        ticketNumber: saved.ticketNumber,
      };
    } catch (err: any) {
      console.error("[db.ts:addTicket] Prisma database insertion failed with error:", err);
      handlePrismaError(err, 'addTicket');
      console.log("[db.ts:addTicket] Proceeding to JSON Local Fallback flow because Prisma insertion failed.");
    }
  } else {
    console.log("[db.ts:addTicket] Skipping Prisma insertion (Prisma is disabled or unconfigured). Going directly to JSON Fallback.");
  }

  try {
    console.log(`[db.ts:addTicket] JSON FALLBACK: Accessing JSON database file at path: ${JSON_DB_FILE}`);
    const db = readJsonDb();
    console.log(`[db.ts:addTicket] JSON FALLBACK: Database read successfully. Current ticket count: ${db.tickets?.length || 0}`);
    
    db.tickets.unshift(ticket);
    
    console.log(`[db.ts:addTicket] JSON FALLBACK: Attempting to write updated DB to disk...`);
    writeJsonDb(db);
    console.log(`[db.ts:addTicket] JSON FALLBACK: Ticket successfully written and returned.`);
    return ticket;
  } catch (err: any) {
    console.error("[db.ts:addTicket] Fatal failure during JSON fallback database write operation:", err);
    throw err;
  }
}


// ===== 4. CONTACT MESSAGES =====
export async function getMessages(): Promise<ContactMessage[]> {
  if (usePrisma && prisma) {
    try {
      const list = await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return list.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone || undefined,
        subject: item.subject || undefined,
        message: item.message,
        createdAt: item.createdAt,
        read: item.read,
      }));
    } catch (err) {
      handlePrismaError(err, 'getMessages');
    }
  }
  return readJsonDb().messages;
}

export async function addMessage(message: ContactMessage): Promise<ContactMessage> {
  if (usePrisma && prisma) {
    try {
      const saved = await prisma.message.create({
        data: {
          id: message.id,
          name: message.name,
          email: message.email,
          phone: message.phone || null,
          subject: message.subject || null,
          message: message.message,
          createdAt: message.createdAt,
          read: message.read,
        },
      });
      return {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        phone: saved.phone || undefined,
        subject: saved.subject || undefined,
        message: saved.message,
        createdAt: saved.createdAt,
        read: saved.read,
      };
    } catch (err) {
      handlePrismaError(err, 'addMessage');
    }
  }
  const db = readJsonDb();
  db.messages.unshift(message);
  writeJsonDb(db);
  return message;
}

export async function markMessageRead(id: string): Promise<ContactMessage | null> {
  if (usePrisma && prisma) {
    try {
      const saved = await prisma.message.update({
        where: { id },
        data: { read: true },
      });
      return {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        phone: saved.phone || undefined,
        subject: saved.subject || undefined,
        message: saved.message,
        createdAt: saved.createdAt,
        read: saved.read,
      };
    } catch (err) {
      handlePrismaError(err, 'markMessageRead');
    }
  }
  const db = readJsonDb();
  const msg = db.messages.find(x => x.id === id);
  if (!msg) return null;
  msg.read = true;
  writeJsonDb(db);
  return msg;
}

export async function deleteMessage(id: string): Promise<boolean> {
  if (usePrisma && prisma) {
    try {
      const deleted = await prisma.message.delete({
        where: { id },
      });
      return !!deleted;
    } catch (err) {
      handlePrismaError(err, 'deleteMessage');
    }
  }
  const db = readJsonDb();
  const initialLength = db.messages.length;
  db.messages = db.messages.filter(x => x.id !== id);
  writeJsonDb(db);
  return db.messages.length < initialLength;
}

export async function getDbStatus() {
  let actuallyConnected = false;
  let connectionError: string | null = null;
  let providerType = 'Fallback (Fichiers JSON locaux)';
  let isPlaceholderEnv = true;
  let maskedUrl = '';
  
  // Standard Prisma check
  const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || process.env.af_DATABASE_URL || '';
  isPlaceholderEnv = !connectionString || connectionString.includes('xxx') || connectionString.includes('placeholder');
  
  if (usePrisma && prisma) {
    try {
      await prisma.exhibitor.count();
      actuallyConnected = true;
    } catch (err: any) {
      actuallyConnected = false;
      connectionError = err.message || String(err);
    }
  }

  if (connectionString) {
    if (connectionString.includes('supabase') || connectionString.includes('pooler.supabase')) {
      providerType = 'Supabase PostgreSQL';
    } else if (connectionString.includes('neon') || connectionString.includes('neon.tech')) {
      providerType = 'Neon PostgreSQL';
    } else if (connectionString.includes('postgres') || connectionString.includes('postgresql')) {
      providerType = 'Base de données PostgreSQL';
    }
  }

  if (connectionString) {
    try {
      const parts = connectionString.split('@');
      if (parts.length > 1) {
        const firstPart = parts[0];
        const secondPart = parts[1];
        const userPass = firstPart.split('://');
        if (userPass.length > 1) {
          const credentials = userPass[1].split(':');
          const username = credentials[0];
          maskedUrl = `${userPass[0]}://${username}:******@${secondPart}`;
        } else {
          maskedUrl = `postgresql://******@${secondPart}`;
        }
      } else {
        maskedUrl = connectionString.substring(0, 15) + '...';
      }
    } catch (e) {
      maskedUrl = 'URL de connexion masquée';
    }
  }

  return {
    usePrisma,
    actuallyConnected,
    isPlaceholder: isPlaceholderEnv,
    providerType,
    maskedUrl,
    connectionError
  };
}
