export type UserRole = 'family' | 'caregiver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface Caregiver {
  id: string;
  name: string;
  experience: number;
  certifications: string[];
  regions: string[];
  available_days: string[];
  hourly_rate: number;
  bio: string;
  rating: string;
  gender?: string;
  birth_date?: string;
}

export interface MatchRequest {
  id: string;
  familyId: string;
  caregiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface SearchFilter {
  region?: string;
  startDate?: string;
  endDate?: string;
  minExperience?: number;
  maxHourlyRate?: number;
}
