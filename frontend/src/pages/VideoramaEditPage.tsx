import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../auth/apiClient';

export const VideoramaEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIME'>('PUBLIC');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const response = await apiClient.get(`/videorama/collections/${id}`);
      const collection = response.data.collection;
      setTitle(collection.title);
      setDescription(collection.description);
      setVisibility(collection.visibility);
    };
    void load();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await apiClient.put(`/videorama/collections/${id}`, {
      title,
      description,
      visibility,
    });
    navigate('/videorama');
  };

  return (
    <div>
      <h1>Editar colección</h1>
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
          Visibilidad
          <select value={visibility} onChange={(event) => setVisibility(event.target.value as 'PUBLIC' | 'PRIME')}>
            <option value="PUBLIC">Public</option>
            <option value="PRIME">Prime</option>
          </select>
        </label>
        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
};
