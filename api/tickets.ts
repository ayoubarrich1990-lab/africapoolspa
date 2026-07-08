import type { Request, Response } from 'express';
import { getTickets, addTicket } from './db.js';
import type { VisitorTicket } from '../src/types.js';

export default async function handler(req: Request, res: Response) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const list = await getTickets();
      return res.status(200).json(list);
    } catch (err: any) {
      return res.status(500).json({
        error: 'Erreur serveur lors de la récupération des badges.',
        details: err?.message || String(err),
      });
    }
  }

  if (method === 'POST') {
    try {
      const { firstName, lastName, company, jobTitle, email, phone, sectorInterest } = req.body;

      if (!firstName || !lastName || !company || !email || !phone) {
        return res.status(400).json({ error: 'Veuillez saisir toutes les informations du visiteur.' });
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

      const saved = await addTicket(newTicket);
      return res.status(201).json(saved);
    } catch (err: any) {
      return res.status(500).json({
        error: 'Erreur serveur lors de la création de la demande de badge.',
        details: err?.message || String(err),
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
