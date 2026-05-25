import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
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

// Integrate Supabase Client support
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: any = null;
let useSupabase = false;
let supabaseTablesExist = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    useSupabase = true;
    console.log("🟢 Supabase Client initiated successfully using service role / admin key.");
  } catch (err) {
    console.error("❌ Failed to initiate Supabase client:", err);
    useSupabase = false;
  }
}

export async function checkSupabaseTables(): Promise<boolean> {
  if (!useSupabase || !supabase) {
    supabaseTablesExist = false;
    return false;
  }
  try {
    const { error } = await supabase.from('exhibitors').select('id').limit(1);
    if (error) {
      console.warn("⚠️ Supabase exhibitors table not found/configured:", error.message);
      supabaseTablesExist = false;
      return false;
    }
    supabaseTablesExist = true;
    return true;
  } catch (e) {
    console.warn("⚠️ Exception during Supabase table check:", e);
    supabaseTablesExist = false;
    return false;
  }
}

// Prioritize fully qualified pool/non-pool connections over the localized container/kubernetes DATABASE_URL
const dbUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
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

// Only connect Prisma if Supabase credentials are NOT provided (or fallback is chosen)
if (!useSupabase && dbUrl && !isPlaceholder) {
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
    console.log("🟢 Vercel Postgres connection configured with Prisma.");
  } catch (err) {
    console.error("❌ Failed to initiate Prisma client:", err);
    usePrisma = false;
  }
} else if (useSupabase) {
  console.log("🟢 running live in Supabase API connector mode. Prisma is kept as sub-fallback.");
  usePrisma = false;
} else {
  console.log("ℹ️ POSTGRES_PRISMA_URL placeholder or missing. Running in local JSON Database Fallback mode.");
  usePrisma = false;
}

// Seed the base PostgreSQL tables automatically if they are fully empty
export async function setupDatabase(): Promise<boolean> {
  // Seamlessly support automatic seeding if Supabase is connected
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        console.log("🛠️ checking and provisioning default data inside Supabase tables...");
        
        // 1. EXHIBITORS SEED IN SUPABASE
        const { count: exhibitorCount, error: countExhibErr } = await supabase
          .from('exhibitors')
          .select('*', { count: 'exact', head: true });
          
        if (!countExhibErr && (exhibitorCount === null || exhibitorCount === 0)) {
          console.log("🌱 Supabase is empty for Exhibitors. Seeding default tables...");
          const initial = getInitialDb();
          await supabase.from('exhibitors').insert(
            initial.exhibitors.map(ex => ({
              id: ex.id,
              name: ex.name,
              highlight_word: ex.highlightWord || null,
              logo_color: ex.logoColor || null,
            }))
          );
        }

        // 2. RESERVATIONS SEED IN SUPABASE
        const { count: reservationCount, error: countResErr } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true });
          
        if (!countResErr && (reservationCount === null || reservationCount === 0)) {
          console.log("🌱 Supabase is empty for Reservations. Seeding default tables...");
          const initial = getInitialDb();
          await supabase.from('reservations').insert(
            initial.reservations.map(res => ({
              id: res.id,
              company_name: res.companyName,
              contact_name: res.contactName,
              email: res.email,
              phone: res.phone,
              sector: res.sector,
              stand_size: res.standSize,
              stand_type: res.standType,
              description: res.description || null,
              status: res.status,
              created_at: res.createdAt,
              assigned_location: res.assignedLocation || null,
            }))
          );
        }

        // 3. TICKETS SEED IN SUPABASE
        const { count: ticketCount, error: countTktErr } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true });
          
        if (!countTktErr && (ticketCount === null || ticketCount === 0)) {
          console.log("🌱 Supabase is empty for Visitor Tickets. Seeding default tables...");
          const initial = getInitialDb();
          await supabase.from('tickets').insert(
            initial.tickets.map(tkt => ({
              id: tkt.id,
              first_name: tkt.firstName,
              last_name: tkt.lastName,
              company: tkt.company,
              job_title: tkt.jobTitle,
              email: tkt.email,
              phone: tkt.phone,
              sector_interest: tkt.sectorInterest,
              created_at: tkt.createdAt,
              ticket_number: tkt.ticketNumber,
            }))
          );
        }

        // 4. MESSAGES SEED IN SUPABASE
        const { count: messageCount, error: countMsgErr } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });
          
        if (!countMsgErr && (messageCount === null || messageCount === 0)) {
          console.log("🌱 Supabase is empty for Messages. Seeding default tables...");
          const initial = getInitialDb();
          await supabase.from('messages').insert(
            initial.messages.map(msg => ({
              id: msg.id,
              name: msg.name,
              email: msg.email,
              phone: msg.phone || null,
              subject: msg.subject || null,
              message: msg.message,
              created_at: msg.createdAt,
              read: msg.read,
            }))
          );
        }

        console.log("✨ Supabase tables successfully seeded and verified.");
        return true;
      } catch (err) {
        console.error("❌ Exception during Supabase seeding:", err);
      }
    }
  }

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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { data, error } = await supabase
          .from('exhibitors')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            name: item.name,
            highlightWord: item.highlight_word || undefined,
            logoColor: item.logo_color || undefined,
          }));
        }
        console.warn("⚠️ Supabase error in getExhibitors:", error ? error.message : "No data");
      } catch (err) {
        console.error("❌ Exception in getExhibitors via Supabase:", err);
      }
    }
  }
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
      }));
    } catch (err) {
      handlePrismaError(err, 'getExhibitors');
    }
  }
  return readJsonDb().exhibitors;
}

export async function addExhibitor(exhibitor: Exhibitor): Promise<Exhibitor> {
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { error } = await supabase
          .from('exhibitors')
          .insert({
            id: exhibitor.id,
            name: exhibitor.name,
            highlight_word: exhibitor.highlightWord || null,
            logo_color: exhibitor.logoColor || null,
          });
        if (!error) return exhibitor;
        console.warn("⚠️ Supabase error in addExhibitor:", error.message);
      } catch (err) {
        console.error("❌ Exception in addExhibitor via Supabase:", err);
      }
    }
  }
  if (usePrisma && prisma) {
    try {
      const saved = await prisma.exhibitor.create({
        data: {
          id: exhibitor.id,
          name: exhibitor.name,
          highlightWord: exhibitor.highlightWord || null,
          logoColor: exhibitor.logoColor || null,
        },
      });
      return {
        id: saved.id,
        name: saved.name,
        highlightWord: saved.highlightWord || undefined,
        logoColor: saved.logoColor || undefined,
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { error } = await supabase
          .from('exhibitors')
          .delete()
          .eq('id', id);
        if (!error) return true;
        console.warn("⚠️ Supabase error in deleteExhibitor:", error.message);
      } catch (err) {
        console.error("❌ Exception in deleteExhibitor via Supabase:", err);
      }
    }
  }
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            companyName: item.company_name,
            contactName: item.contact_name,
            email: item.email,
            phone: item.phone,
            sector: item.sector,
            standSize: item.stand_size,
            standType: item.stand_type as 'standard' | 'premium',
            description: item.description || undefined,
            status: item.status as 'pending' | 'approved' | 'rejected',
            createdAt: item.created_at,
            assignedLocation: item.assigned_location || undefined,
          }));
        }
        console.warn("⚠️ Supabase error in getReservations:", error ? error.message : "No data");
      } catch (err) {
        console.error("❌ Exception in getReservations via Supabase:", err);
      }
    }
  }
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { error } = await supabase
          .from('reservations')
          .insert({
            id: reservation.id,
            company_name: reservation.companyName,
            contact_name: reservation.contactName,
            email: reservation.email,
            phone: reservation.phone,
            sector: reservation.sector,
            stand_size: reservation.standSize,
            stand_type: reservation.standType,
            description: reservation.description || null,
            status: reservation.status,
            created_at: reservation.createdAt,
            assigned_location: reservation.assignedLocation || null,
          });
        if (!error) return reservation;
        console.warn("⚠️ Supabase error in addReservation:", error.message);
      } catch (err) {
        console.error("❌ Exception in addReservation via Supabase:", err);
      }
    }
  }
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        // Map camelCase keys to snake_case for Supabase
        const data: any = {};
        if (updates.companyName !== undefined) data.company_name = updates.companyName;
        if (updates.contactName !== undefined) data.contact_name = updates.contactName;
        if (updates.email !== undefined) data.email = updates.email;
        if (updates.phone !== undefined) data.phone = updates.phone;
        if (updates.sector !== undefined) data.sector = updates.sector;
        if (updates.standSize !== undefined) data.stand_size = Number(updates.standSize);
        if (updates.standType !== undefined) data.stand_type = updates.standType;
        if (updates.description !== undefined) data.description = updates.description || null;
        if (updates.status !== undefined) data.status = updates.status;
        if (updates.assignedLocation !== undefined) data.assigned_location = updates.assignedLocation || null;

        const { data: updatedRows, error } = await supabase
          .from('reservations')
          .update(data)
          .eq('id', id)
          .select('*');

        if (!error && updatedRows && updatedRows.length > 0) {
          const saved = updatedRows[0];
          return {
            id: saved.id,
            companyName: saved.company_name,
            contactName: saved.contact_name,
            email: saved.email,
            phone: saved.phone,
            sector: saved.sector,
            standSize: saved.stand_size,
            standType: saved.stand_type as 'standard' | 'premium',
            description: saved.description || undefined,
            status: saved.status as 'pending' | 'approved' | 'rejected',
            createdAt: saved.created_at,
            assignedLocation: saved.assigned_location || undefined,
          };
        }
        console.warn("⚠️ Supabase error in updateReservation:", error ? error.message : "Empty response");
      } catch (err) {
        console.error("❌ Exception in updateReservation via Supabase:", err);
      }
    }
  }
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { error } = await supabase
          .from('reservations')
          .delete()
          .eq('id', id);
        if (!error) return true;
        console.warn("⚠️ Supabase error in deleteReservation:", error.message);
      } catch (err) {
        console.error("❌ Exception in deleteReservation via Supabase:", err);
      }
    }
  }
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            firstName: item.first_name,
            lastName: item.last_name,
            company: item.company,
            jobTitle: item.job_title,
            email: item.email,
            phone: item.phone,
            sectorInterest: item.sector_interest,
            createdAt: item.created_at,
            ticketNumber: item.ticket_number,
          }));
        }
        console.warn("⚠️ Supabase error in getTickets:", error ? error.message : "No data");
      } catch (err) {
        console.error("❌ Exception in getTickets via Supabase:", err);
      }
    }
  }
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { error } = await supabase
          .from('tickets')
          .insert({
            id: ticket.id,
            first_name: ticket.firstName,
            last_name: ticket.lastName,
            company: ticket.company,
            job_title: ticket.jobTitle,
            email: ticket.email,
            phone: ticket.phone,
            sector_interest: ticket.sectorInterest,
            created_at: ticket.createdAt,
            ticket_number: ticket.ticketNumber,
          });
        if (!error) return ticket;
        console.warn("⚠️ Supabase error in addTicket:", error.message);
      } catch (err) {
        console.error("❌ Exception in addTicket via Supabase:", err);
      }
    }
  }
  if (usePrisma && prisma) {
    try {
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
    } catch (err) {
      handlePrismaError(err, 'addTicket');
    }
  }
  const db = readJsonDb();
  db.tickets.unshift(ticket);
  writeJsonDb(db);
  return ticket;
}


// ===== 4. CONTACT MESSAGES =====
export async function getMessages(): Promise<ContactMessage[]> {
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone || undefined,
            subject: item.subject || undefined,
            message: item.message,
            createdAt: item.created_at,
            read: item.read,
          }));
        }
        console.warn("⚠️ Supabase error in getMessages:", error ? error.message : "No data");
      } catch (err) {
        console.error("❌ Exception in getMessages via Supabase:", err);
      }
    }
  }
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { error } = await supabase
          .from('messages')
          .insert({
            id: message.id,
            name: message.name,
            email: message.email,
            phone: message.phone || null,
            subject: message.subject || null,
            message: message.message,
            created_at: message.createdAt,
            read: message.read,
          });
        if (!error) return message;
        console.warn("⚠️ Supabase error in addMessage:", error.message);
      } catch (err) {
        console.error("❌ Exception in addMessage via Supabase:", err);
      }
    }
  }
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { data: updatedRows, error } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('id', id)
          .select('*');
        if (!error && updatedRows && updatedRows.length > 0) {
          const saved = updatedRows[0];
          return {
            id: saved.id,
            name: saved.name,
            email: saved.email,
            phone: saved.phone || undefined,
            subject: saved.subject || undefined,
            message: saved.message,
            createdAt: saved.created_at,
            read: saved.read,
          };
        }
        console.warn("⚠️ Supabase error in markMessageRead:", error ? error.message : "Empty response");
      } catch (err) {
        console.error("❌ Exception in markMessageRead via Supabase:", err);
      }
    }
  }
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
  if (useSupabase && supabase) {
    await checkSupabaseTables();
    if (supabaseTablesExist) {
      try {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', id);
        if (!error) return true;
        console.warn("⚠️ Supabase error in deleteMessage:", error.message);
      } catch (err) {
        console.error("❌ Exception in deleteMessage via Supabase:", err);
      }
    }
  }
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
  
  if (useSupabase && supabase) {
    providerType = 'Supabase client REST API';
    isPlaceholderEnv = false;
    maskedUrl = 'https://kftjutwnxfwjruhsuvrw.supabase.co [REST API]';
    try {
      const { data, error } = await supabase.from('exhibitors').select('id').limit(1);
      if (error) {
        actuallyConnected = true; // Connection was successfully made, key is valid!
        supabaseTablesExist = false;
        connectionError = `PGRST205: Tables non trouvées dans Supabase. ${error.message}.`;
      } else {
        actuallyConnected = true;
        supabaseTablesExist = true;
      }
    } catch (err: any) {
      actuallyConnected = false;
      supabaseTablesExist = false;
      connectionError = err.message || String(err);
    }
  } else {
    // Standard Prisma check
    const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '';
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
  }

  return {
    usePrisma: usePrisma || (useSupabase && supabaseTablesExist),
    actuallyConnected,
    isPlaceholder: isPlaceholderEnv,
    providerType,
    maskedUrl,
    connectionError,
    supabaseTablesExist
  };
}
