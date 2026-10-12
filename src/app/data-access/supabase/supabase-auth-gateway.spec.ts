import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import { SupabaseAuthGateway, toE164IranMobile } from './supabase-auth-gateway';

interface FakeQuery {
  update: (values: Record<string, string>) => FakeQuery;
  eq: (column: string, value: string) => FakeQuery;
  select: (columns: string) => FakeQuery;
  single: () => Promise<{ data: unknown; error: { message: string } | null }>;
  maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
}

interface FakeClient {
  auth: {
    signInWithOtp: (args: { phone: string }) => Promise<unknown>;
    verifyOtp: (args: { phone: string; token: string }) => Promise<unknown>;
    getUser: () => Promise<unknown>;
    getSession: () => Promise<unknown>;
    signOut: () => Promise<unknown>;
  };
  from: (table: string) => FakeQuery;
  calls: { table: string; updated: Record<string, string> | null };
}

function setup(overrides: Partial<FakeClient['auth']> = {}, row: unknown = null): {
  gateway: SupabaseAuthGateway;
  fake: FakeClient;
} {
  const query: FakeQuery = {
    update: (values) => {
      fake.calls.updated = values;
      return query;
    },
    eq: () => query,
    select: () => query,
    single: () =>
      Promise.resolve({ data: row, error: row ? null : { message: 'missing' } }),
    maybeSingle: () => Promise.resolve({ data: row, error: null }),
  };
  const fake: FakeClient = {
    auth: {
      signInWithOtp: () => Promise.resolve({ data: {}, error: null }),
      verifyOtp: () =>
        Promise.resolve({ data: { user: { id: 'u1' } }, error: null }),
      getUser: () => Promise.resolve({ data: { user: { id: 'u1' } }, error: null }),
      getSession: () =>
        Promise.resolve({ data: { session: { user: { id: 'u1' } } }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      ...overrides,
    },
    from: (table) => {
      fake.calls.table = table;
      return query;
    },
    calls: { table: '', updated: null },
  };
  TestBed.configureTestingModule({
    providers: [
      SupabaseAuthGateway,
      { provide: SUPABASE_CLIENT, useValue: fake as unknown as SupabaseClient },
    ],
  });
  return { gateway: TestBed.inject(SupabaseAuthGateway), fake };
}

const ROW = { id: 'u1', mobile: '09227521450', first_name: 'فائزه', last_name: 'رحمتی' };

describe('toE164IranMobile', () => {
  it('maps iranian mobiles to E.164', () => {
    expect(toE164IranMobile('09227521450')).toBe('+989227521450');
    expect(toE164IranMobile('+989227521450')).toBe('+989227521450');
    expect(() => toE164IranMobile('123')).toThrow('شماره موبایل معتبر نیست');
  });
});

describe('SupabaseAuthGateway', () => {
  it('requests an otp for the normalized number', async () => {
    const { gateway, fake } = setup();
    let phone = '';
    fake.auth.signInWithOtp = (args) => {
      phone = args.phone;
      return Promise.resolve({ data: {}, error: null });
    };
    await firstValueFrom(gateway.requestOtp('09227521450'));
    expect(phone).toBe('+989227521450');
  });

  it('rejects invalid mobiles without calling the api', async () => {
    const { gateway } = setup();
    await expect(firstValueFrom(gateway.requestOtp('123'))).rejects.toThrow(
      'شماره موبایل معتبر نیست',
    );
  });

  it('marks users with empty names as new', async () => {
    const { gateway } = setup(
      {},
      { id: 'u9', mobile: '09120000000', first_name: '', last_name: '' },
    );
    await expect(
      firstValueFrom(gateway.verifyOtp('09120000000', '1234')),
    ).resolves.toEqual({ isNewUser: true });
  });

  it('marks completed profiles as existing users', async () => {
    const { gateway } = setup({}, ROW);
    await expect(
      firstValueFrom(gateway.verifyOtp('09227521450', '1234')),
    ).resolves.toEqual({ isNewUser: false });
  });

  it('surfaces verify failures', async () => {
    const { gateway } = setup({
      verifyOtp: () => Promise.resolve({ data: { user: null }, error: { message: 'bad' } }),
    });
    await expect(firstValueFrom(gateway.verifyOtp('09227521450', '0000'))).rejects.toThrow(
      'bad',
    );
  });

  it('completes the profile and reads the session', async () => {
    const { gateway, fake } = setup({}, ROW);
    const user = await firstValueFrom(gateway.completeProfile('فائزه', 'رحمتی'));
    expect(user).toEqual({
      id: 'u1',
      firstName: 'فائزه',
      lastName: 'رحمتی',
      mobile: '09227521450',
    });
    expect(fake.calls.table).toBe('profiles');
    const session = await firstValueFrom(gateway.currentSession());
    expect(session?.user.mobile).toBe('09227521450');
  });

  it('returns null without a session and signs out', async () => {
    const { gateway } = setup({
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    });
    await expect(firstValueFrom(gateway.currentSession())).resolves.toBeNull();
    await expect(firstValueFrom(gateway.logout())).resolves.toBeUndefined();
  });
});
