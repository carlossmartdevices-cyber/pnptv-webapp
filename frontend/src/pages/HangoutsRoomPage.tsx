import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAgoraRoom } from '../hangouts/agora/useAgoraRoom';
import { VideoTile } from '../hangouts/agora/VideoTile';

export const HangoutsRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [joinToken, setJoinToken] = useState('');
  const { join, leave, localVideoTrack, remoteUsers, isJoined, roomTitle } = useAgoraRoom(roomId!);

  const handleJoin = async () => {
    await join(joinToken || undefined);
  };

  return (
    <div>
      <h1>Hangout: {roomTitle || roomId}</h1>
      <p>No grabar ni redistribuir contenido. Participas bajo tu responsabilidad.</p>
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
