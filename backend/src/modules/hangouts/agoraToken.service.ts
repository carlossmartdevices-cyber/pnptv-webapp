import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import { env } from '../../env';

export const generateRtcToken = ({ channelName, uid }: { channelName: string; uid: string | number }) => {
  const expireTimeInSeconds = env.AGORA_TOKEN_TTL_SECONDS;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    env.AGORA_APP_ID,
    env.AGORA_APP_CERTIFICATE,
    channelName,
    Number(uid),
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );

  return {
    token,
    expiresAt: new Date((currentTimestamp + expireTimeInSeconds) * 1000).toISOString()
  };
};
