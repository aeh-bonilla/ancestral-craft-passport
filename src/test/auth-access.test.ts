import { describe, expect, it, vi } from 'vitest';
import { protectedDestination } from '@/lib/auth';
const getUser = vi.hoisted(() => vi.fn());
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getUser } } }));
import { Route } from '@/routes/_authenticated/route';

describe('Google account access', () => {
  const guard = Route.options.beforeLoad;
  it.each(['/panel', '/registrar'])('rejects signed-out access to %s', async (pathname) => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    if (typeof guard !== 'function') throw new Error('Missing auth guard');
    await expect(guard({ location: { pathname } } as Parameters<typeof guard>[0])).rejects.toMatchObject({ options: { to: '/auth', search: { next: pathname } } });
  });
  it('allows a validated registered account', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'registered-user' } }, error: null });
    if (typeof guard !== 'function') throw new Error('Missing auth guard');
    await expect(guard({ location: { pathname: '/panel' } } as Parameters<typeof guard>[0])).resolves.toEqual({ user: { id: 'registered-user' } });
  });
  it('preserves the requested work registration destination', () => {
    expect(protectedDestination('/registrar')).toBe('/registrar');
  });
  it('does not accept an external sign-in destination', () => {
    expect(protectedDestination('https://example.com')).toBe('/panel');
  });
});