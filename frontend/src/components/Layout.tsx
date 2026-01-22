import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, logout, sessionProfile } = useAuth();

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/hangouts">Hangouts</Link>
          <Link to="/videorama">Videorama</Link>
        </nav>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {sessionProfile && <span>{sessionProfile.displayName}</span>}
          {accessToken ? <button onClick={logout}>Salir</button> : <Link to="/login">Login</Link>}
        </div>
      </header>
      <main style={{ padding: '1rem' }}>{children}</main>
    </div>
  );
};
