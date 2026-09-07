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

export interface SiteVisit {
  id: string;
  timestamp: string;
  visitorId: string;
  city: string;
  country: string;
  countryCode: string;
  ip?: string;
  device: 'Desktop' | 'Mobile' | 'Tablette';
  browser: string;
  referrer?: string;
  path?: string;
}

export interface CityVisitStat {
  city: string;
  country: string;
  countryCode: string;
  count: number;
  percentage: number;
  lastVisitAt: string;
}

export interface VisitorAnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  citiesCount: number;
  cities: CityVisitStat[];
  recentVisits: SiteVisit[];
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  dailyStats: { date: string; label: string; count: number }[];
}
