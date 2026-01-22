import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@shared/rbac';

export type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
  photo_url?: string;
};

export type SessionProfile = {
  displayName: string;
  avatarSeed: string;
  createdAt: string;
};

type AuthState = {
  accessToken: string | null;
  expiresAt: string | null;
  role: Role | null;
  telegramUser: TelegramUser | null;
  termsAccepted: boolean;
  sessionProfile: SessionProfile | null;
  loading: boolean;
  setSession: (payload: {
    accessToken: string;
    expiresAt: string;
    role: Role;
    telegramUser: TelegramUser;
    termsAccepted: boolean;
  }) => void;
  setTermsAccepted: () => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

const createSessionProfile = (telegramUser: TelegramUser): SessionProfile => {
  const displayName =
    telegramUser.username ||
    telegramUser.first_name ||
    `Papi #${String(telegramUser.id).slice(-4)}`;
  return {
    displayName,
    avatarSeed: String(telegramUser.id),
    createdAt: new Date().toISOString()
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      expiresAt: null,
      role: null,
      telegramUser: null,
      termsAccepted: false,
      sessionProfile: null,
      loading: false,
      setSession: (payload) =>
        set(() => ({
          accessToken: payload.accessToken,
          expiresAt: payload.expiresAt,
          role: payload.role,
          telegramUser: payload.telegramUser,
          termsAccepted: payload.termsAccepted,
          sessionProfile: createSessionProfile(payload.telegramUser)
        })),
      setTermsAccepted: () => set(() => ({ termsAccepted: true })),
      setLoading: (loading) => set(() => ({ loading })),
      logout: () =>
        set(() => ({
          accessToken: null,
          expiresAt: null,
          role: null,
          telegramUser: null,
          termsAccepted: false,
          sessionProfile: null
        }))
    }),
    {
      name: 'pnptv-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        role: state.role,
        telegramUser: state.telegramUser,
        termsAccepted: state.termsAccepted
      })
    }
  )
);

export const useAuth = () => useAuthStore((state) => state);
