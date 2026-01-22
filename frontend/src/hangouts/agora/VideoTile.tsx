import { useEffect, useRef } from 'react';
import type { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

const VideoTile = ({ track, label }: { track: ICameraVideoTrack | IRemoteVideoTrack | undefined; label: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (track && containerRef.current) {
      track.play(containerRef.current);
    }
    return () => {
      track?.stop();
    };
  }, [track]);

  return (
    <div style={{ border: '1px solid #333', padding: '8px' }}>
      <div ref={containerRef} style={{ width: '240px', height: '180px', background: '#111' }} />
      <p>{label}</p>
    </div>
  );
};

export default VideoTile;
