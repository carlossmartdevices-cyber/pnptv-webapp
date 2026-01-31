import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export const HomePage = () => {
  const { sessionProfile } = useAuth();

  return (
    <div>
      <h1>Bienvenido a PNPtv</h1>
      {sessionProfile && <p>Hola, {sessionProfile.displayName}.</p>}
      <p>Elige lo que quieres abrir:</p>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginTop: '1rem',
        }}
      >
        <Link
          to="/videorama"
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem',
            textDecoration: 'none',
          }}
        >
          <h2>Videorama</h2>
          <p>Playlists, podcasts y contenido curado.</p>
        </Link>
        <Link
          to="/hangouts"
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem',
            textDecoration: 'none',
          }}
        >
          <h2>Hangouts</h2>
          <p>Salas de video en vivo con la comunidad.</p>
        </Link>
      </div>
    </div>
  );
};
