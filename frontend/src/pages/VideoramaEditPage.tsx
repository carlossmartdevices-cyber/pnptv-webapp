import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../auth/apiClient';

const VideoramaEditPage = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollection = async () => {
      const response = await apiClient.get('/videorama/collections');
      const match = response.data.collections.find((item: any) => item.id === id);
      setCollection(match);
    };
    void fetchCollection();
  }, [id]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await apiClient.put(`/videorama/collections/${id}`, collection);
    navigate('/videorama');
  };

  if (!collection) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1>Editar colección</h1>
      <form onSubmit={handleSave}>
        <label>
          Título
          <input value={collection.title} onChange={(event) => setCollection({ ...collection, title: event.target.value })} />
        </label>
        <label>
          Descripción
          <textarea
            value={collection.description}
            onChange={(event) => setCollection({ ...collection, description: event.target.value })}
          />
        </label>
        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
};

export default VideoramaEditPage;
