import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../auth/apiClient';
import { useAuthStore } from '../auth/useAuth';
import { can } from '@shared/rbac';

type Room = {
  id: string;
  title: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: 'OPEN' | 'CLOSED';
  hostId: string;
};

const HangoutsListPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { role } = useAuthStore();

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await apiClient.get('/hangouts/public', { params: { status: 'OPEN' } });
      setRooms(response.data.rooms);
    };
    void fetchRooms();
  }, []);

  return (
    <div>
      <h1>Hangouts públicos</h1>
      {role && can(role, 'hangouts.create') && (
        <Link to="/hangouts/create">
          <button type="button">Crear hangout</button>
        </Link>
      )}
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <strong>{room.title}</strong> ({room.visibility})
            <Link to={`/hangouts/room/${room.id}`} style={{ marginLeft: '12px' }}>
              Join
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HangoutsListPage;
