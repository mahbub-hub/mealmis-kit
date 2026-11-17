import type { Handle } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionRaw = event.cookies.get('session');
  event.locals.user = null;

  if (sessionRaw) {
    try {
      const { userId } = JSON.parse(sessionRaw) as { userId?: unknown };
      const id = Number(userId);
      if (!Number.isInteger(id)) throw new Error('Invalid session user id');

      event.locals.user = await prisma.user.findUnique({ where: { id } });
    } catch {
      event.locals.user = null;
    }
  }

  return resolve(event);
};

declare global {
  namespace App {
    interface Locals {
      user: Awaited<ReturnType<typeof prisma.user.findUnique>> | null;
    }
  }
}
