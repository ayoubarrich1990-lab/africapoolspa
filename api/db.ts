import fs from 'fs';
import path from 'path';
import { createPool } from '@vercel/postgres';
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

// Default initial database for JSON fallback
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

// JSON Read/Write helpers
const readJsonDb = (): DatabaseSchema => {
  try {
    if (!fs.existsSync(JSON_DB_FILE)) {
      // Seed from existing database fallback
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

// Dynamic Postgres database client creation (prevents crashes if missing)
let postgresEnabled = false;
let pool: ReturnType<typeof createPool> | null = null;

if (process.env.POSTGRES_URL) {
  try {
    pool = createPool({
      connectionString: process.env.POSTGRES_URL,
    });
    postgresEnabled = true;
    console.log("🟢 Vercel Postgres connection configured.");
  } catch (err) {
    console.error("❌ Failed to initiate Vercel Postgres client pool:", err);
  }
} else {
  console.log("ℹ️ POSTGRES_URL not provided. Running in dynamic offline JSON File Fallback mode.");
}

// Setup & Provision Postgres Tables
export async function setupDatabase() {
  if (!postgresEnabled || !pool) return false;
  try {
    const client = await pool.connect();
    try {
      console.log("🛠️ Connected to Vercel Postgres. Provisioning tables if needed...");
      
      // 1. Create Exhibitors table
      await client.query(`
        CREATE TABLE IF NOT EXISTS exhibitors (
          id VARCHAR(150) PRIMARY KEY,
          name TEXT NOT NULL,
          highlight_word TEXT,
          logo_color TEXT
        )
      `);

      // 2. Create Reservations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reservations (
          id VARCHAR(150) PRIMARY KEY,
          company_name TEXT NOT NULL,
          contact_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          sector TEXT NOT NULL,
          stand_size INTEGER NOT NULL,
          stand_type TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL,
          created_at VARCHAR(100) NOT NULL,
          assigned_location TEXT
        )
      `);

      // 3. Create Visitor Tickets table
      await client.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id VARCHAR(150) PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          company TEXT NOT NULL,
          job_title TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          sector_interest TEXT NOT NULL,
          created_at VARCHAR(100) NOT NULL,
          ticket_number TEXT NOT NULL
        )
      `);

      // 4. Create Messages table
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id VARCHAR(150) PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          subject TEXT,
          message TEXT NOT NULL,
          created_at VARCHAR(100) NOT NULL,
          read BOOLEAN DEFAULT FALSE
        )
      `);

      // Seed exhibitors table if empty
      const exhibitorCheck = await client.query('SELECT COUNT(*) FROM exhibitors');
      if (parseInt(exhibitorCheck.rows[0].count, 10) === 0) {
        console.log("🌱 Seeding initial exhibitors in the Postgres database...");
        const initial = getInitialDb();
        for (const ex of initial.exhibitors) {
          await client.query(
            'INSERT INTO exhibitors (id, name, highlight_word, logo_color) VALUES ($1, $2, $3, $4)',
            [ex.id, ex.name, ex.highlightWord || null, ex.logoColor || null]
          );
        }
      }

      // Seed reservations if empty
      const reservationCheck = await client.query('SELECT COUNT(*) FROM reservations');
      if (parseInt(reservationCheck.rows[0].count, 10) === 0) {
        console.log("🌱 Seeding initial reservations in the Postgres database...");
        const initial = getInitialDb();
        for (const res of initial.reservations) {
          await client.query(
            `INSERT INTO reservations (
              id, company_name, contact_name, email, phone, sector, 
              stand_size, stand_type, description, status, created_at, assigned_location
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              res.id, res.companyName, res.contactName, res.email, res.phone, res.sector,
              res.standSize, res.standType, res.description || null, res.status, res.createdAt, res.assignedLocation || null
            ]
          );
        }
      }

      // Seed tickets if empty
      const ticketCheck = await client.query('SELECT COUNT(*) FROM tickets');
      if (parseInt(ticketCheck.rows[0].count, 10) === 0) {
        console.log("🌱 Seeding initial visitor tickets in the Postgres database...");
        const initial = getInitialDb();
        for (const tkt of initial.tickets) {
          await client.query(
            `INSERT INTO tickets (
              id, first_name, last_name, company, job_title, email, phone, sector_interest, created_at, ticket_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              tkt.id, tkt.firstName, tkt.lastName, tkt.company, tkt.jobTitle, tkt.email, tkt.phone, tkt.sectorInterest, tkt.createdAt, tkt.ticketNumber
            ]
          );
        }
      }

      // Seed messages if empty
      const msgCheck = await client.query('SELECT COUNT(*) FROM messages');
      if (parseInt(msgCheck.rows[0].count, 10) === 0) {
        console.log("🌱 Seeding initial messages in the Postgres database...");
        const initial = getInitialDb();
        for (const msg of initial.messages) {
          await client.query(
            `INSERT INTO messages (
              id, name, email, phone, subject, message, created_at, read
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              msg.id, msg.name, msg.email, msg.phone || null, msg.subject || null, msg.message, msg.createdAt, msg.read
            ]
          );
        }
      }

      console.log("✨ database initialized and synced successfully.");
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ Postgres dynamic database setup failed, defaulting to JSON mode.", err);
    postgresEnabled = false;
    return false;
  }
}

// ---------------- DATABASE ACTIONS ----------------

// ===== 1. EXHIBITORS =====
export async function getExhibitors(): Promise<Exhibitor[]> {
  if (postgresEnabled && pool) {
    try {
      const res = await pool.query('SELECT * FROM exhibitors ORDER BY name ASC');
      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        highlightWord: row.highlight_word || undefined,
        logoColor: row.logo_color || undefined
      }));
    } catch (err) {
      console.error("Failed to query exhibitors from PostgreSQL. Falling back to JSON.", err);
    }
  }
  return readJsonDb().exhibitors;
}

export async function addExhibitor(exhibitor: Exhibitor): Promise<Exhibitor> {
  if (postgresEnabled && pool) {
    try {
      await pool.query(
        'INSERT INTO exhibitors (id, name, highlight_word, logo_color) VALUES ($1, $2, $3, $4)',
        [exhibitor.id, exhibitor.name, exhibitor.highlightWord || null, exhibitor.logoColor || null]
      );
      return exhibitor;
    } catch (err) {
      console.error("Failed to save exhibitor to PostgreSQL. Saving to JSON.", err);
    }
  }
  const db = readJsonDb();
  db.exhibitors.push(exhibitor);
  writeJsonDb(db);
  return exhibitor;
}

export async function deleteExhibitor(id: string): Promise<boolean> {
  if (postgresEnabled && pool) {
    try {
      const res = await pool.query('DELETE FROM exhibitors WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error("Failed to delete exhibitor in PostgreSQL. Doing in JSON.", err);
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
  if (postgresEnabled && pool) {
    try {
      const res = await pool.query('SELECT * FROM reservations ORDER BY created_at DESC');
      return res.rows.map(row => ({
        id: row.id,
        companyName: row.company_name,
        contactName: row.contact_name,
        email: row.email,
        phone: row.phone,
        sector: row.sector,
        standSize: row.stand_size,
        standType: row.stand_type,
        description: row.description || undefined,
        status: row.status,
        createdAt: row.created_at,
        assignedLocation: row.assigned_location || undefined
      }));
    } catch (err) {
      console.error("Failed to query reservations from PostgreSQL. Falling back to JSON.", err);
    }
  }
  return readJsonDb().reservations;
}

export async function addReservation(reservation: StandReservation): Promise<StandReservation> {
  if (postgresEnabled && pool) {
    try {
      await pool.query(
        `INSERT INTO reservations (
          id, company_name, contact_name, email, phone, sector, 
          stand_size, stand_type, description, status, created_at, assigned_location
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          reservation.id, reservation.companyName, reservation.contactName, reservation.email, reservation.phone, reservation.sector,
          reservation.standSize, reservation.standType, reservation.description || null, reservation.status, reservation.createdAt, reservation.assignedLocation || null
        ]
      );
      return reservation;
    } catch (err) {
      console.error("Failed to save reservation to PostgreSQL. Saving to JSON.", err);
    }
  }
  const db = readJsonDb();
  db.reservations.unshift(reservation);
  writeJsonDb(db);
  return reservation;
}

export async function updateReservation(id: string, updates: Partial<StandReservation>): Promise<StandReservation | null> {
  if (postgresEnabled && pool) {
    try {
      const current = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
      if (current.rowCount === 0) return null;
      
      const row = current.rows[0];
      const merged = {
        company_name: updates.companyName !== undefined ? updates.companyName : row.company_name,
        contact_name: updates.contactName !== undefined ? updates.contactName : row.contact_name,
        email: updates.email !== undefined ? updates.email : row.email,
        phone: updates.phone !== undefined ? updates.phone : row.phone,
        sector: updates.sector !== undefined ? updates.sector : row.sector,
        stand_size: updates.standSize !== undefined ? updates.standSize : row.stand_size,
        stand_type: updates.standType !== undefined ? updates.standType : row.stand_type,
        description: updates.description !== undefined ? updates.description : row.description,
        status: updates.status !== undefined ? updates.status : row.status,
        assigned_location: updates.assignedLocation !== undefined ? updates.assignedLocation : row.assigned_location
      };

      await pool.query(
        `UPDATE reservations SET 
          company_name = $1, contact_name = $2, email = $3, phone = $4, sector = $5,
          stand_size = $6, stand_type = $7, description = $8, status = $9, assigned_location = $10
         WHERE id = $11`,
         [
           merged.company_name, merged.contact_name, merged.email, merged.phone, merged.sector,
           merged.stand_size, merged.stand_type, merged.description || null, merged.status, merged.assigned_location || null,
           id
         ]
      );

      return {
        id,
        companyName: merged.company_name,
        contactName: merged.contact_name,
        email: merged.email,
        phone: merged.phone,
        sector: merged.sector,
        standSize: merged.stand_size,
        standType: merged.stand_type,
        description: merged.description || undefined,
        status: merged.status,
        createdAt: row.created_at,
        assignedLocation: merged.assigned_location || undefined
      };
    } catch (err) {
      console.error("Failed to update reservation in PostgreSQL. Modifying JSON.", err);
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
  if (postgresEnabled && pool) {
    try {
      const res = await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error("Failed to delete reservation in PostgreSQL.", err);
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
  if (postgresEnabled && pool) {
    try {
      const res = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
      return res.rows.map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        company: row.company,
        jobTitle: row.job_title,
        email: row.email,
        phone: row.phone,
        sectorInterest: row.sector_interest,
        createdAt: row.created_at,
        ticketNumber: row.ticket_number
      }));
    } catch (err) {
      console.error("Failed to query tickets from PostgreSQL. Falling back to JSON.", err);
    }
  }
  return readJsonDb().tickets;
}

export async function addTicket(ticket: VisitorTicket): Promise<VisitorTicket> {
  if (postgresEnabled && pool) {
    try {
      await pool.query(
        `INSERT INTO tickets (
          id, first_name, last_name, company, job_title, email, phone, sector_interest, created_at, ticket_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          ticket.id, ticket.firstName, ticket.lastName, ticket.company, ticket.jobTitle, ticket.email, ticket.phone, ticket.sectorInterest, ticket.createdAt, ticket.ticketNumber
        ]
      );
      return ticket;
    } catch (err) {
      console.error("Failed to save ticket to PostgreSQL. Saving to JSON.", err);
    }
  }
  const db = readJsonDb();
  db.tickets.unshift(ticket);
  writeJsonDb(db);
  return ticket;
}


// ===== 4. CONTACT MESSAGES =====
export async function getMessages(): Promise<ContactMessage[]> {
  if (postgresEnabled && pool) {
    try {
      const res = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || undefined,
        subject: row.subject || undefined,
        message: row.message,
        createdAt: row.created_at,
        read: row.read
      }));
    } catch (err) {
      console.error("Failed to query messages from PostgreSQL. Falling back to JSON.", err);
    }
  }
  return readJsonDb().messages;
}

export async function addMessage(message: ContactMessage): Promise<ContactMessage> {
  if (postgresEnabled && pool) {
    try {
      await pool.query(
        `INSERT INTO messages (
          id, name, email, phone, subject, message, created_at, read
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          message.id, message.name, message.email, message.phone || null, message.subject || null, message.message, message.createdAt, message.read
        ]
      );
      return message;
    } catch (err) {
      console.error("Failed to save message to PostgreSQL. Saving to JSON.", err);
    }
  }
  const db = readJsonDb();
  db.messages.unshift(message);
  writeJsonDb(db);
  return message;
}

export async function markMessageRead(id: string): Promise<ContactMessage | null> {
  if (postgresEnabled && pool) {
    try {
      const res = await pool.query('UPDATE messages SET read = TRUE WHERE id = $1 RETURNING *', [id]);
      if (res.rowCount === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || undefined,
        subject: row.subject || undefined,
        message: row.message,
        createdAt: row.created_at,
        read: row.read
      };
    } catch (err) {
      console.error("Failed to update message in PostgreSQL.", err);
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
  if (postgresEnabled && pool) {
    try {
      const res = await pool.query('DELETE FROM messages WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error("Failed to delete message in PostgreSQL.", err);
    }
  }
  const db = readJsonDb();
  const initialLength = db.messages.length;
  db.messages = db.messages.filter(x => x.id !== id);
  writeJsonDb(db);
  return db.messages.length < initialLength;
}
