import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import apiClient from '../auth/apiClient';
import { useAgoraRoom } from '../hangouts/agora/useAgoraRoom';
import VideoTile from '../hangouts/agora/VideoTile';

const HangoutsRoomPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const initialToken = useMemo(() => searchParams.get('joinToken') ?? '', [searchParams]);
  const [joinToken, setJoinToken] = useState(initialToken);
  const [credentials, setCredentials] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const joinRoom = async () => {
    if (!roomId) {
      return;
    }
    setError(null);
    try {
      const response = await apiClient.post(`/hangouts/${roomId}/join`, {
        joinToken: joinToken || undefined
      });
      setRoom(response.data.room);
      setCredentials(response.data.agora);
    } catch (err) {
      setError('No fue posible unirse a la sala. Verifica el join token si es privada.');
    }
  };

  useEffect(() => {
    if (initialToken || joinToken === '') {
      void joinRoom();
    }
  }, [initialToken, joinToken, roomId]);

  const { localTracks, remoteUsers, leave } = useAgoraRoom(credentials);

  return (
    <div>
      <h1>Hangout</h1>
      <p style={{ color: 'red' }}>No grabar / no redistribuir contenido.</p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!credentials && (
        <div>
          <label>
            Join token
            <input value={joinToken} onChange={(event) => setJoinToken(event.target.value)} />
          </label>
          <button type="button" onClick={joinRoom} style={{ marginLeft: '8px' }}>
            Unirse
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {localTracks.videoTrack && <VideoTile track={localTracks.videoTrack} label="Tú" />}
        {remoteUsers.map((user) => (
          <VideoTile key={user.uid} track={user.videoTrack} label={`Invitado ${user.uid}`} />
        ))}
      </div>
      <button type="button" onClick={leave}>
        Salir
      </button>
    </div>
  );
};

export default HangoutsRoomPage;
