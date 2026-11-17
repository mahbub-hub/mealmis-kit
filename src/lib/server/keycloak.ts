import { env } from "$env/dynamic/private";
import { createRemoteJWKSet, jwtVerify } from 'jose';

const beginKey = '-----BEGIN PUBLIC KEY-----\n';
const endKey = '\n-----END PUBLIC KEY-----';

function pemPublicKeyFromEnv(): string {
    const body = (`${env.KC_PUBLIC_KEY}?? ''`).trim() 
    if(!body){
        throw new Error('KC_PUBLIC_KEY is missing')
    }   
    return `${beginKey}${body}${endKey}`
}

export type KeycloakTokenResponse = {
    access_token: string
    id_token: string
    refresh_token?: string
    expires_in?: number
    token_type?: string
}

export async function exchangeCodeForTokens(code: string): Promise<KeycloakTokenResponse> {
    const form = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: `${env.KC_CLIENT_ID}`,
        code,
        redirect_url: `${env.KC_REDIRECT_URL}`
    })

    const res = await fetch(`${env.KC_TOKEN_URL}`, {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        body: form
    })

    if(!res.ok){
        const text = res.text().catch(() => "")
        throw new Error(`Token exchange failed: ${res.status} ${text}`)
    }

    return (await res.json()) as KeycloakTokenResponse
}

export async function verifyAccessToken(accessToken: string): Promise<Record<string, unknown>> {
  // Mirrors:
  // options = { verify_signature: True, verify_aud: False, verify_exp: True } :contentReference[oaicite:8]{index=8}
  const key = pemPublicKeyFromEnv();

  const { payload } = await jwtVerify(accessToken, await importPublicKey(key), {
    audience: undefined // we intentionally do NOT enforce aud like verify_aud=False
    // exp is verified by default in jose unless you disable it
  });

  return payload as Record<string, unknown>;
}

async function importPublicKey(pem: string) {
  // jose can import PEM public key via subtle crypto using importSPKI
  const { importSPKI } = await import('jose');
  return importSPKI(pem, 'RS256');
}

export function buildLogoutUrl(idTokenHint: string): string {
  const url = new URL(`${env.KC_LOGOUT_URL}`);
  url.searchParams.set('id_token_hint', idTokenHint);
  url.searchParams.set('post_logout_redirect_uri', `${env.KC_REDIRECT_URL}`);
  return url.toString();
}