import { createPolyfillRandomUUID } from '@/lib/create-safe-random-id';

/**
 * Installs `crypto.randomUUID` when the runtime does not provide it
 * (e.g. non-secure HTTP contexts). Safe to call multiple times.
 */
export function installCryptoRandomUuidPolyfill(): void {
  try {
    const existing = globalThis.crypto as CryptoLike | undefined;

    if (existing && typeof existing.randomUUID === 'function') {
      return;
    }

    const cryptoObj: CryptoLike =
      existing ??
      ({
        getRandomValues: undefined,
      } satisfies CryptoLike);

    if (!existing) {
      Object.defineProperty(globalThis, 'crypto', {
        value: cryptoObj,
        configurable: true,
        writable: true,
      });
    }

    if (typeof cryptoObj.randomUUID === 'function') {
      return;
    }

    Object.defineProperty(cryptoObj, 'randomUUID', {
      value: createPolyfillRandomUUID,
      configurable: true,
      writable: true,
    });
  } catch {
    // Never crash bootstrap — helper fallbacks remain available.
  }
}

type CryptoLike = {
  randomUUID?: () => string;
  getRandomValues?: (array: Uint8Array) => Uint8Array;
};

installCryptoRandomUuidPolyfill();
