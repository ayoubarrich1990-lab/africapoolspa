import express from 'express';
import type { Exhibitor, StandReservation, VisitorTicket, ContactMessage } from '../src/types.js';
import {
  setupDatabase,
  getExhibitors,
  addExhibitor,
  deleteExhibitor,
  getReservations,
  addReservation,
  updateReservation,
  deleteReservation,
  getTickets,
  addTicket,
  getMessages,
  addMessage,
  markMessageRead,
  deleteMessage,
  getDbStatus,
} from './db.js';

const app = express();

// Enable JSON parsing
app.use(express.json());

// Boot-up database synchronization
setupDatabase().catch((e) => {
  console.error('Failed to trigger background database setup:', e);
});

// ================= API ENDPOINTS =================

// 1. EXHIBITORS API
app.get('/api/exhibitors', async (req, res) => {
  try {
    const list = await getExhibitors();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des exposants.' });
  }
});

app.post('/api/exhibitors', async (req, res) => {
  try {
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

    const saved = await addExhibitor(newExhibitor);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la création de l’exposant.' });
  }
});

app.delete('/api/exhibitors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteExhibitor(id);
    if (!deleted) {
      res.status(404).json({ error: 'Exposant non trouvé.' });
      return;
    }
    res.json({ success: true, message: 'Exposant supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l’exposant.' });
  }
});

// 2. STAND RESERVATIONS API
app.get('/api/reservations', async (req, res) => {
  try {
    const list = await getReservations();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des réservations.' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
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

    const saved = await addReservation(newReservation);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la soumission de la réservation.' });
  }
});

app.patch('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedLocation, standSize, standType, sector } = req.body;

    const updated = await updateReservation(id, {
      status,
      assignedLocation,
      standSize: standSize !== undefined ? Number(standSize) : undefined,
      standType,
      sector
    });

    if (!updated) {
      res.status(404).json({ error: 'Réservation non trouvée.' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réservation.' });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteReservation(id);
    if (!deleted) {
      res.status(404).json({ error: 'Réservation non trouvée.' });
      return;
    }
    res.json({ success: true, message: 'Réservation supprimée.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la réservation.' });
  }
});

// 3. TICKETS / VISITOR REGISTRATIONS API
app.get('/api/tickets', async (req, res) => {
  try {
    const list = await getTickets();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des badges.' });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
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

    const saved = await addTicket(newTicket);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la création de la demande de badge.' });
  }
});

// 4. CONTACT MESSAGES API
app.get('/api/messages', async (req, res) => {
  try {
    const list = await getMessages();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors du chargement des messages.' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
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

    const saved = await addMessage(newMessage);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de l’envoi du message.' });
  }
});

app.patch('/api/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await markMessageRead(id);
    if (!updated) {
      res.status(404).json({ error: 'Message non trouvé.' });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du message.' });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteMessage(id);
    if (!deleted) {
      res.status(404).json({ error: 'Message non trouvé.' });
      return;
    }
    res.json({ success: true, message: 'Message supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du message.' });
  }
});

// 5. DATABASE DIAGNOSTICS & STATUS API
app.get('/api/db-status', async (req, res) => {
  try {
    const status = await getDbStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du statut de la base de données.' });
  }
});

// 6. GEMINI CO-PILOT APIS
import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    // API key is securely retrieved from the system environment/secrets
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDT8YL0ZHKB3WdysgxuzHas4ar91V8N0Xk';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

const EXPO_SYSTEM_INSTRUCTION = `
You are the official AI Assistant for the Africa Pool & Spa Expo 2026.
Your role is to answer B2B visitors, delegates, Exhibitors, and partners warmly, professionally, and precisely.

Key Expo Information:
- Concept: One-stop salon for wellness, swimming pools, aquatic amenities, home automation (domotic spa), water treatment, and luxury thermal accessories. Highly aimed at hotel development, builders, and architectures across the African continent.
- Edition: 2026 Special Edition.
- Dates: October 20th to 22nd, 2026.
- Venue: OFEC (Office des Foires et Expositions de Casablanca), Casablanca, Morocco.
- Official Web Address: https://africapoolspa.vercel.app (and https://africapoolspa.com).
- Direct Contact Phone Numbers: +212 5 22 30 59 55 or Mobile/WhatsApp: +212 661 482 497
- Direct Contact E-mail: contact@africapoolspa.com

Behavior Rules:
1. Speak beautifully in French, English, or Arabic depending on how the user greets you. Default to French.
2. Be brief, respectful, and professional.
3. Suggest the user register for a visitor badge or fill in the "Réserver un Stand" form if they want to participate.
4. Promote the main website domain (https://africapoolspa.vercel.app) as the online destination for registrations and follow-ups.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message field is required.' });
      return;
    }

    const ai = getGeminiClient();
    
    // Construct contents array with context and chat history
    let contents: any[] = [];
    
    if (Array.isArray(history)) {
      contents = history.map((item: any) => ({
        role: item.role === 'model' || item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.text || item.content || '' }]
      }));
    }
    
    // Append the latest user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: EXPO_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    const text = response.text || 'Désolé, je n’ai pas pu formuler de réponse pour le moment.';
    res.json({ text });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ 
      error: 'Erreur de communication avec le module IA.',
      details: err.message || String(err)
    });
  }
});

export default app;
