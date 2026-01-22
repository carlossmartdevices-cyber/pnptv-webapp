import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../auth/apiClient';
import type { Role } from '@shared/rbac';
import { useAuth } from '../auth/AuthProvider';

export type Collection = {
  id: string;
  type: 'PLAYLIST' | 'PODCAST';
  title: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIME';
  ownerId: string;
};

export const VideoramaPage = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const { role } = useAuth();

  useEffect(() => {
    const load = async () => {
      const response = await apiClient.get('/videorama/collections');
      setCollections(response.data.collections);
    };
    void load();
  }, []);

  return (
    <div>
      <h1>Videorama</h1>
      {role && (role === 'PRIME' || role === 'ADMIN') && <Link to="/videorama/create">Crear colección</Link>}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {collections.map((collection) => (
          <div key={collection.id} style={{ border: '1px solid #ddd', padding: '1rem' }}>
            <h3>{collection.title}</h3>
            <p>{collection.description}</p>
            <p>Visibilidad: {collection.visibility}</p>
            <Link to={`/videorama/edit/${collection.id}`}>Editar</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
