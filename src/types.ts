export interface Exhibitor {
  id: string;
  name: string;
  highlightWord?: string; // Optional coloring like "Saya Line" or "Frio Équipement"
  logoColor?: string; // Hex color for logo icon
  logoUrl?: string; // Optional custom image URL
}

export interface StandReservation {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  sector: string;
  standSize: number; // e.g. 9, 18, 36, 54
  standType: 'standard' | 'premium';
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  assignedLocation?: string; // e.g. "Zone A - Stand N°24"
}

export interface VisitorTicket {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  email: string;
  phone: string;
  sectorInterest: string;
  createdAt: string;
  ticketNumber: string; // generated code e.g. "APS-2026-XXXXX"
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  read: boolean;
}
