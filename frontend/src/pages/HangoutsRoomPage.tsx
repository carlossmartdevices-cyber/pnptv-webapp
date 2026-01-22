import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAgoraRoom } from '../hangouts/agora/useAgoraRoom';
import { VideoTile } from '../hangouts/agora/VideoTile';

export const HangoutsRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const initialToken = useMemo(() => searchParams.get('joinToken') ?? '', [searchParams]);
  const [joinToken, setJoinToken] = useState(initialToken);
  const [error, setError] = useState<string | null>(null);
  const { join, leave, localVideoTrack, remoteUsers, isJoined, roomTitle } = useAgoraRoom(roomId!);

  const handleJoin = async () => {
    try {
      setError(null);
      await join(joinToken || undefined);
    } catch (err) {
      setError('No fue posible unirse a la sala. Verifica el join token si es privada.');
    }
  };

  useEffect(() => {
    if (initialToken) {
      void handleJoin();
    }
  }, [initialToken]);

  return (
    <div>
      <h1>Hangout: {roomTitle || roomId}</h1>
      <p style={{ color: 'red' }}>No grabar ni redistribuir contenido. Participas bajo tu responsabilidad.</p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!isJoined && (
        <div>
          <input
            placeholder="Join token (si es privada)"
            value={joinToken}
            onChange={(event) => setJoinToken(event.target.value)}
          />
          <button onClick={handleJoin}>Entrar</button>
        </div>
      )}
      {isJoined && (
        <button onClick={leave} style={{ marginBottom: '1rem' }}>
          Salir
        </button>
      )}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <VideoTile track={localVideoTrack} label="Yo" />
        {remoteUsers.map((user) => (
          <VideoTile key={user.uid} track={user.videoTrack ?? null} label={`Usuario ${user.uid}`} />
        ))}
      </div>
    </div>
  );
};
