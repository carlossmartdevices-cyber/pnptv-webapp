import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../auth/apiClient';
import type { Role } from '@shared/rbac';
import { useAuth } from '../auth/AuthProvider';

export type Room = {
  id: string;
  title: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: 'OPEN' | 'CLOSED';
};

export const HangoutsListPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { role } = useAuth();

  useEffect(() => {
    const load = async () => {
      const response = await apiClient.get('/hangouts/public?status=OPEN');
      setRooms(response.data.rooms);
    };
    void load();
  }, []);

  return (
    <div>
      <h1>Hangouts abiertos</h1>
      {role && (role === 'PRIME' || role === 'ADMIN') && <Link to="/hangouts/create">Crear sala</Link>}
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <strong>{room.title}</strong> ({room.visibility})
            <Link to={`/hangouts/room/${room.id}`} style={{ marginLeft: '1rem' }}>
              Join
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
