import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../auth/apiClient';

export const HangoutsCreatePage = () => {
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await apiClient.post('/hangouts', { title, visibility });
    setJoinLink(response.data.joinLink ?? null);
    navigate(`/hangouts/room/${response.data.room.id}`);
  };

  return (
    <div>
      <h1>Crear sala</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Título
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          Visibilidad
          <select value={visibility} onChange={(event) => setVisibility(event.target.value as 'PUBLIC' | 'PRIVATE')}>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </label>
        <button type="submit">Crear</button>
      </form>
      {joinLink && (
        <p>
          Link privado: <code>{joinLink}</code>
        </p>
      )}
    </div>
  );
};
