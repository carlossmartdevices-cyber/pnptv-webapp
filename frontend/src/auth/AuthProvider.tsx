import { useEffect } from 'react';
import apiClient from './apiClient';
import { useAuthStore } from './useAuth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, setSession, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const hydrate = async () => {
      if (!accessToken) {
        return;
      }
      setLoading(true);
      try {
        const response = await apiClient.get('/auth/me');
        setSession({
          accessToken,
          expiresAt: response.data.expiresAt,
          role: response.data.role,
          telegramUser: response.data.telegramUser,
          termsAccepted: response.data.termsAccepted
        });
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    void hydrate();
  }, [accessToken, logout, setLoading, setSession]);

  return <>{children}</>;
};
