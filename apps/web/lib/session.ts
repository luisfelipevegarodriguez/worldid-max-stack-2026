import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { jwtSecret } from './config';

export type HumanClaims = JWTPayload & { sub: string; is_human: true; level: string };

export async function issueHumanJwt(nullifier: string, level = 'orb'): Promise<string | null> {
  const secret = jwtSecret();
  if (!secret) return null;
  return new SignJWT({ sub: nullifier, is_human: true, level })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(secret));
}

export async function readHumanJwt(token: string): Promise<HumanClaims | null> {
  const secret = jwtSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.is_human !== true || typeof payload.sub !== 'string') return null;
    return payload as HumanClaims;
  } catch {
    return null;
  }
}
