import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../auth/apiClient';
import { useAuthStore } from '../auth/useAuth';

declare global {
  interface Window {
    TelegramLoginWidget?: unknown;
    handleTelegramAuth?: (user: TelegramAuthPayload) => void;
  }
}

type TelegramAuthPayload = {
  id: number;
  username?: string;
  first_name?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const LoginPage = () => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  useEffect(() => {
    window.handleTelegramAuth = async (user: TelegramAuthPayload) => {
      const response = await apiClient.post('/auth/telegram', user);
      setSession(response.data);
      navigate('/hangouts');
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', import.meta.env.VITE_TELEGRAM_BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'handleTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    widgetRef.current?.appendChild(script);

    return () => {
      widgetRef.current?.removeChild(script);
    };
  }, [navigate, setSession]);

  return (
    <div>
      <h1>Login con Telegram</h1>
      <p>Autentícate con Telegram para continuar.</p>
      <div ref={widgetRef} />
    </div>
  );
};

export default LoginPage;
