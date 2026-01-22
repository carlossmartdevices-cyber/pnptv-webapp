import React, { useEffect, useRef } from 'react';
import type { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

type Track = ICameraVideoTrack | IRemoteVideoTrack;

export const VideoTile = ({ track, label }: { track: Track | null; label: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track || !containerRef.current) return;
    track.play(containerRef.current);
    return () => {
      track.stop();
    };
  }, [track]);

  return (
    <div style={{ border: '1px solid #444', padding: '0.5rem' }}>
      <div ref={containerRef} style={{ width: '320px', height: '240px', background: '#000' }} />
      <div>{label}</div>
    </div>
  );
};
