import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../auth/apiClient';
import { useAuthStore } from '../auth/useAuth';
import { can } from '@shared/rbac';

const VideoramaPage = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const { role, telegramUser } = useAuthStore();

  useEffect(() => {
    const fetchCollections = async () => {
      const response = await apiClient.get('/videorama/collections');
      setCollections(response.data.collections);
    };
    void fetchCollections();
  }, []);

  return (
    <div>
      <h1>Videorama</h1>
      {role && can(role, 'videorama.create') && (
        <Link to="/videorama/create">
          <button type="button">Crear colección</button>
        </Link>
      )}
      <div style={{ display: 'grid', gap: '16px' }}>
        {collections.map((collection) => (
          <div key={collection.id} style={{ border: '1px solid #ddd', padding: '12px' }}>
            <h3>{collection.title}</h3>
            <p>{collection.description}</p>
            <p>Visibilidad: {collection.visibility}</p>
            {role &&
              (can(role, 'videorama.editAny') ||
                can(role, 'videorama.editOwn', { ownerId: collection.ownerId, actorId: telegramUser?.id })) && (
                <Link to={`/videorama/edit/${collection.id}`}>Editar</Link>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoramaPage;
