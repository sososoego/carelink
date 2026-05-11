import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isNewUser: boolean;
  setUser: (user: User, isNew?: boolean) => void;
  logout: () => void;
  clearNewUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isNewUser: false,
  setUser: (user, isNew = false) => set({ user, token: user.token, isNewUser: isNew }),
  logout: () => set({ user: null, token: null, isNewUser: false }),
  clearNewUser: () => set({ isNewUser: false }),
}));
