import { redirect, type RequestHandler } from '@sveltejs/kit';
import { buildLogoutUrl } from '$lib/server/keycloak';

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionRaw = cookies.get('session');
  cookies.delete('session', { path: '/' });

  if (sessionRaw) {
    try {
      const { idToken } = JSON.parse(sessionRaw) as { idToken?: unknown };
      if (typeof idToken === 'string' && idToken) {
        throw redirect(302, buildLogoutUrl(idToken));
      }
    } catch {
      // Ignore malformed session cookies and continue with local logout.
    }
  }

  throw redirect(302, '/');
};
