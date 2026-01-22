import { useCallback, useEffect, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

export type AgoraCredentials = {
  appId: string;
  channelName: string;
  uid: string | number;
  rtcToken: string;
};

export const useAgoraRoom = (credentials: AgoraCredentials | null) => {
  const [client] = useState<IAgoraRTCClient>(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localTracks, setLocalTracks] = useState<{
    audioTrack?: IMicrophoneAudioTrack;
    videoTrack?: ICameraVideoTrack;
  }>({});
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const join = useCallback(async () => {
    if (!credentials) {
      return;
    }
    await client.join(credentials.appId, credentials.channelName, credentials.rtcToken, credentials.uid);
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    const videoTrack = await AgoraRTC.createCameraVideoTrack();
    await client.publish([audioTrack, videoTrack]);
    setLocalTracks({ audioTrack, videoTrack });
  }, [client, credentials]);

  const leave = useCallback(async () => {
    localTracks.audioTrack?.stop();
    localTracks.audioTrack?.close();
    localTracks.videoTrack?.stop();
    localTracks.videoTrack?.close();
    await client.leave();
    setLocalTracks({});
    setRemoteUsers([]);
  }, [client, localTracks]);

  useEffect(() => {
    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        setRemoteUsers((prev) => [...prev.filter((u) => u.uid !== user.uid), user]);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
    };
  }, [client]);

  useEffect(() => {
    if (credentials) {
      void join();
    }
    return () => {
      void leave();
    };
  }, [credentials, join, leave]);

  return {
    localTracks,
    remoteUsers,
    leave
  };
};
