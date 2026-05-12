import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isNewUser: boolean;
  setUser: (user: User, isNew?: boolean) => void;
  logout: () => void;
  clearNewUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isNewUser: false,
      setUser: (user, isNew = false) => set({ user, token: user.token, isNewUser: isNew }),
      logout: () => set({ user: null, token: null, isNewUser: false }),
      clearNewUser: () => set({ isNewUser: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
