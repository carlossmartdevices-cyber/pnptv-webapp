import { useEffect, useMemo, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { apiClient } from '../../auth/apiClient';

export type AgoraJoinResponse = {
  room: {
    id: string;
    title: string;
    channelName: string;
  };
  agora: {
    appId: string;
    channelName: string;
    uid: string;
    rtcToken: string;
    expiresAt: string;
  };
};

export const useAgoraRoom = (roomId: string) => {
  const [client] = useState<IAgoraRTCClient>(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState(client.remoteUsers);
  const [isJoined, setIsJoined] = useState(false);
  const [roomTitle, setRoomTitle] = useState('');

  const join = useMemo(
    () => async (joinToken?: string) => {
      const response = await apiClient.post<AgoraJoinResponse>(`/hangouts/${roomId}/join`, { joinToken });
      const { agora, room } = response.data;
      setRoomTitle(room.title);
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        setRemoteUsers([...client.remoteUsers]);
      });
      client.on('user-unpublished', () => {
        setRemoteUsers([...client.remoteUsers]);
      });
      await client.join(agora.appId, agora.channelName, agora.rtcToken, Number(agora.uid));
      const [micTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalAudioTrack(micTrack);
      setLocalVideoTrack(cameraTrack);
      await client.publish([micTrack, cameraTrack]);
      setIsJoined(true);
    },
    [client, roomId]
  );

  const leave = useMemo(
    () => async () => {
      localAudioTrack?.stop();
      localAudioTrack?.close();
      localVideoTrack?.stop();
      localVideoTrack?.close();
      await client.leave();
      setIsJoined(false);
      setRemoteUsers([]);
    },
    [client, localAudioTrack, localVideoTrack]
  );

  useEffect(() => {
    return () => {
      void leave();
    };
  }, [leave]);

  return { join, leave, localAudioTrack, localVideoTrack, remoteUsers, isJoined, roomTitle };
};
