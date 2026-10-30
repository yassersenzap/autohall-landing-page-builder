type CryptoLike = {
  randomUUID?: () => string;
  getRandomValues?: (array: Uint8Array) => Uint8Array;
};

function randomUUIDFromGetRandomValues(cryptoObj: CryptoLike): string {
  const bytes = new Uint8Array(16);
  cryptoObj.getRandomValues!(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function randomUUIDFromMathFallback(): string {
  const segment = (length: number) =>
    Math.random()
      .toString(16)
      .slice(2, 2 + length)
      .padEnd(length, '0')
      .slice(0, length);
  return `${segment(8)}-${segment(4)}-4${segment(3)}-8${segment(3)}-${segment(12)}`;
}

/**
 * Browser-safe random ID for block IDs, puck IDs and temporary builder state.
 * Never throws — uses native randomUUID, getRandomValues, or a math fallback.
 */
export function createSafeRandomId(): string {
  try {
    const cryptoObj = globalThis.crypto as CryptoLike | undefined;

    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
      const id = cryptoObj.randomUUID();
      if (typeof id === 'string' && id.length > 0) {
        return id;
      }
    }

    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      return randomUUIDFromGetRandomValues(cryptoObj);
    }
  } catch {
    // Fall through to math fallback.
  }

  return randomUUIDFromMathFallback();
}

/** Used by the global polyfill when `crypto.randomUUID` is missing. */
export function createPolyfillRandomUUID(): string {
  try {
    const cryptoObj = globalThis.crypto as CryptoLike | undefined;
    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      return randomUUIDFromGetRandomValues(cryptoObj);
    }
  } catch {
    // Fall through to math fallback.
  }

  return randomUUIDFromMathFallback();
}
