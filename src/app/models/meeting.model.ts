export interface User {
  id: number;
  name: string;
  ownership_ratio: number;
  role_id: number;
  is_active: boolean;
}

export interface Resolution {
  id: number;
  text: string;
  votes?: any[];
  results?: {
    yes: number;
    no: number;
    abstain: number;
  };
}

export interface AgendaItem {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'ACTIVE' | 'CLOSED';
  resolutions: Resolution[];
}
export interface Owner {
  id: string;
  name: string;
  share: number;
}

export interface Apartment {
  id: string;
  address: string;     // pl. "Budapest Minta utca 28."
  floor?: string;      // pl. "2.lph. 3.em"
  flatNumber?: string; // pl. "8."
  hrsz: string;
  totalShare: number;
  owners: Owner[];
}

export interface Vote {
  ownerId: string;
  ownerName: string;
  apartmentAddress: string;
  share: number;
  choice: 'IGEN' | 'NEM' | 'TARTÓZKODIK';
}

export interface AppState {
  totalShareBase: number; // pl. 10000
  presentShare: number; // Jelenlévők összesített hányada
  apartments: Apartment[];
  agendaItems: AgendaItem[];
  currentUser: Owner | null;
  currentApartment: Apartment | null;
}
