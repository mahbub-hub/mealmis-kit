import { prisma } from '$lib/prisma';
import { randomUUID } from 'node:crypto';

type Decoded = Record<string, unknown>;

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export async function getUser(decoded: Decoded) {
  const pinNo = asString(decoded['preferred_username']); // same field :contentReference[oaicite:10]{index=10}
  if (!pinNo) return null;
  return prisma.user.findUnique({ where: { username: pinNo } });
}

export async function updateUserIdToken(decoded: Decoded, _idToken: string) {
  const pinNo = asString(decoded['preferred_username']); // :contentReference[oaicite:11]{index=11}
  if (!pinNo) return;

  await prisma.user.update({
    where: { username: pinNo },
    data: { name: buildDisplayName(decoded, pinNo) }
  });
}

function buildDisplayName(decoded: Decoded, fallback: string) {
  const firstName = asString(decoded['given_name']);
  const lastName = asString(decoded['family_name']);
  return [firstName, lastName].filter(Boolean).join(' ') || fallback;
}

export async function createOrUpdateUser(decoded: Decoded, _idToken: string) {
  const pinNo = asString(decoded['preferred_username']); // :contentReference[oaicite:12]{index=12}
  if (!pinNo) return null;

  const email = asString(decoded['email']) || `${pinNo}@example.local`;
  const name = buildDisplayName(decoded, pinNo);

  // In Django, you optionally enrich email via BRAC net and then:
  // - if email exists, username becomes email prefix and you check existing user by email :contentReference[oaicite:15]{index=15}
  // Here: keep it simple—key by pinNo (recommended), optionally fill email/username if you fetch it.
  // You can plug BRAC net enrichment here if needed.

  return prisma.user.upsert({
    where: { username: pinNo },
    create: {
      name,
      username: pinNo, // or email prefix if you enrich
      email,
      password: randomUUID()
    },
    update: {
      name
    }
  });
}
