import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../auth/apiClient';
import { useAgoraRoom } from '../hangouts/agora/useAgoraRoom';
import VideoTile from '../hangouts/agora/VideoTile';

const HangoutsRoomPage = () => {
  const { roomId } = useParams();
  const [joinToken, setJoinToken] = useState('');
  const [credentials, setCredentials] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    const joinRoom = async () => {
      if (!roomId) {
        return;
      }
      const response = await apiClient.post(`/hangouts/${roomId}/join`, {
        joinToken: joinToken || undefined
      });
      setRoom(response.data.room);
      setCredentials(response.data.agora);
    };

    void joinRoom();
  }, [joinToken, roomId]);

  const { localTracks, remoteUsers, leave } = useAgoraRoom(credentials);

  return (
    <div>
      <h1>Hangout</h1>
      <p style={{ color: 'red' }}>No grabar / no redistribuir contenido.</p>
      {room?.visibility === 'PRIVATE' && !credentials && (
        <div>
          <label>
            Join token
            <input value={joinToken} onChange={(event) => setJoinToken(event.target.value)} />
          </label>
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
