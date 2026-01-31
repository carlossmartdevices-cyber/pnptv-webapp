import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, string | number>) => void;
  }
}

export const LoginPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { loginWithTelegram, accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      navigate('/home');
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      await loginWithTelegram({
        id: String(user.id),
        username: user.username ? String(user.username) : undefined,
        first_name: user.first_name ? String(user.first_name) : undefined,
        photo_url: user.photo_url ? String(user.photo_url) : undefined,
        auth_date: Number(user.auth_date),
        hash: String(user.hash),
      });
      navigate('/home');
    };

    if (!containerRef.current) return;
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'pnplatinotv_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    containerRef.current.appendChild(script);

    return () => {
      containerRef.current?.removeChild(script);
    };
  }, [loginWithTelegram, navigate]);

  return (
    <div>
      <h1>PNPtv Login</h1>
      <p>Login with your Telegram account to continue.</p>
      <div ref={containerRef} />
    </div>
  );
};
