import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { env } from '../../env';
export const buildAgoraToken = (channelName, uid) => {
    const ttl = Number(env.AGORA_TOKEN_TTL_SECONDS);
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + ttl;
    const token = RtcTokenBuilder.buildTokenWithUid(env.AGORA_APP_ID, env.AGORA_APP_CERTIFICATE, channelName, Number(uid), RtcRole.PUBLISHER, expirationTimeInSeconds);
    return {
        token,
        expiresAt: new Date(expirationTimeInSeconds * 1000).toISOString(),
    };
};
