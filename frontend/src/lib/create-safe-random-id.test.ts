import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSafeRandomId } from './create-safe-random-id';

const originalCrypto = globalThis.crypto;

afterEach(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: originalCrypto,
    configurable: true,
    writable: true,
  });
  vi.restoreAllMocks();
});

describe('createSafeRandomId', () => {
  it('returns a non-empty string', () => {
    const id = createSafeRandomId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('does not throw when randomUUID is missing', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: (array: Uint8Array) => {
          array.fill(7);
          return array;
        },
      },
      configurable: true,
      writable: true,
    });

    expect(() => createSafeRandomId()).not.toThrow();
    expect(createSafeRandomId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('falls back when crypto is missing', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => createSafeRandomId()).not.toThrow();
    const id = createSafeRandomId();
    expect(id.length).toBeGreaterThan(0);
  });

  it('uses randomUUID when available without calling native directly in tests', () => {
    const randomUUID = vi.fn(() => 'test-uuid-from-mock');
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID, getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto) },
      configurable: true,
      writable: true,
    });

    expect(createSafeRandomId()).toBe('test-uuid-from-mock');
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });
});
