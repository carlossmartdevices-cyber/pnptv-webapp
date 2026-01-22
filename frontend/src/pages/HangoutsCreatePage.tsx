import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../auth/apiClient';

const HangoutsCreatePage = () => {
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await apiClient.post('/hangouts', { title, visibility });
    const roomId = response.data.room.id;
    navigate(`/hangouts/room/${roomId}`);
  };

  return (
    <div>
      <h1>Crear hangout</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Título
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          Visibilidad
          <select value={visibility} onChange={(event) => setVisibility(event.target.value as 'PUBLIC' | 'PRIVATE')}>
            <option value="PUBLIC">Pública</option>
            <option value="PRIVATE">Privada</option>
          </select>
        </label>
        <button type="submit">Crear</button>
      </form>
    </div>
  );
};

export default HangoutsCreatePage;
