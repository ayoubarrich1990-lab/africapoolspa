import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const DB_FILE = path.join(process.cwd(), 'expo-database.json');

  const readDb = () => {
    if (!fs.existsSync(DB_FILE)) {
      return { tickets: [] };
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  };

  const writeDb = (db) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  };

  if (req.method === 'GET') {
    const db = readDb();
    return res.status(200).json(db.tickets || []);
  }

  if (req.method === 'POST') {
    const db = readDb();
    const { firstName, lastName, company, email, phone } = req.body;

    if (!firstName || !lastName || !company || !email || !phone) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const ticketNumber = `APS-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTicket = {
      id: `tkt-${Date.now()}`,
      firstName,
      lastName,
      company,
      email,
      phone,
      createdAt: new Date().toISOString(),
      ticketNumber
    };

    db.tickets = db.tickets || [];
    db.tickets.unshift(newTicket);

    writeDb(db);

    return res.status(201).json(newTicket);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}