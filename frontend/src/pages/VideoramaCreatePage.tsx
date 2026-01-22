import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../auth/apiClient';

export const VideoramaCreatePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'PLAYLIST' | 'PODCAST'>('PLAYLIST');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIME'>('PUBLIC');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await apiClient.post('/videorama/collections', {
      title,
      description,
      type,
      visibility,
      items: [],
    });
    navigate('/videorama');
  };

  return (
    <div>
      <h1>Nueva colección</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Título
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          Descripción
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label>
          Tipo
          <select value={type} onChange={(event) => setType(event.target.value as 'PLAYLIST' | 'PODCAST')}>
            <option value="PLAYLIST">Playlist</option>
            <option value="PODCAST">Podcast</option>
          </select>
        </label>
        <label>
          Visibilidad
          <select value={visibility} onChange={(event) => setVisibility(event.target.value as 'PUBLIC' | 'PRIME')}>
            <option value="PUBLIC">Public</option>
            <option value="PRIME">Prime</option>
          </select>
        </label>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};
