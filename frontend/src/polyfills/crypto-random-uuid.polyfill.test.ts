import { afterEach, describe, expect, it, vi } from 'vitest';

const originalCrypto = globalThis.crypto;

afterEach(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: originalCrypto,
    configurable: true,
    writable: true,
  });
  vi.resetModules();
});

describe('crypto-random-uuid polyfill', () => {
  it('does not overwrite native randomUUID', async () => {
    const nativeRandomUUID = vi.fn(() => 'native-uuid');
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        ...originalCrypto,
        randomUUID: nativeRandomUUID,
      },
      configurable: true,
      writable: true,
    });

    const { installCryptoRandomUuidPolyfill } = await import('./crypto-random-uuid.polyfill');
    installCryptoRandomUuidPolyfill();

    expect(globalThis.crypto.randomUUID).toBe(nativeRandomUUID);
    expect(globalThis.crypto.randomUUID()).toBe('native-uuid');
  });

  it('adds randomUUID when missing', async () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: (array: Uint8Array) => {
          array.fill(3);
          return array;
        },
      },
      configurable: true,
      writable: true,
    });

    vi.resetModules();
    const { installCryptoRandomUuidPolyfill } = await import('./crypto-random-uuid.polyfill');
    installCryptoRandomUuidPolyfill();

    expect(typeof globalThis.crypto.randomUUID).toBe('function');
    const id = globalThis.crypto.randomUUID();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});
