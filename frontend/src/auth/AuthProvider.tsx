import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { apiClient } from './apiClient';
import type { Role } from '@shared/rbac';

export type TelegramPayload = {
  id: string;
  username?: string;
  first_name?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export type SessionProfile = {
  displayName: string;
  avatarSeed: string;
  createdAt: string;
};

export type AuthState = {
  accessToken: string | null;
  expiresAt: string | null;
  role: Role | null;
  telegramUser: TelegramPayload | null;
  termsAccepted: boolean;
  sessionProfile: SessionProfile | null;
};

type AuthContextValue = AuthState & {
  loginWithTelegram: (payload: TelegramPayload) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const buildSessionProfile = (payload: TelegramPayload): SessionProfile => {
  const displayName = payload.username || payload.first_name || `Papi #${payload.id.slice(-4)}`;
  return {
    displayName,
    avatarSeed: payload.id,
    createdAt: new Date().toISOString(),
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<AuthState>({
    accessToken: localStorage.getItem('pnptv.accessToken'),
    expiresAt: localStorage.getItem('pnptv.expiresAt'),
    role: null,
    telegramUser: null,
    termsAccepted: false,
    sessionProfile: null,
  });

  const loginWithTelegram = useCallback(async (payload: TelegramPayload) => {
    const response = await apiClient.post('/auth/telegram', payload);
    const { accessToken, expiresAt, role, telegramUser, termsAccepted } = response.data;
    localStorage.setItem('pnptv.accessToken', accessToken);
    localStorage.setItem('pnptv.expiresAt', expiresAt);
    setState({
      accessToken,
      expiresAt,
      role,
      telegramUser,
      termsAccepted,
      sessionProfile: buildSessionProfile(payload),
    });
  }, []);

  const refreshMe = useCallback(async () => {
    if (!state.accessToken) return;
    const response = await apiClient.get('/auth/me');
    const { role, telegramUser, termsAccepted } = response.data;
    setState((prev) => ({
      ...prev,
      role,
      telegramUser,
      termsAccepted,
      sessionProfile: prev.sessionProfile ?? (telegramUser ? buildSessionProfile(telegramUser) : null),
    }));
  }, [state.accessToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('pnptv.accessToken');
    localStorage.removeItem('pnptv.expiresAt');
    setState({
      accessToken: null,
      expiresAt: null,
      role: null,
      telegramUser: null,
      termsAccepted: false,
      sessionProfile: null,
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      loginWithTelegram,
      logout,
      refreshMe,
    }),
    [state, loginWithTelegram, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
