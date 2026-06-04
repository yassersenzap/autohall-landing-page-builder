import { describe, expect, it } from 'vitest';

/** Messages d’erreur média — logique extraite pour tests stables. */
function formatAssetsError(status: number | null, network: boolean): string {
  if (network) {
    return 'Serveur inaccessible. Démarrez le backend (port 3000) et vérifiez VITE_API_BASE_URL.';
  }
  if (status === 401) {
    return 'Session expirée. Reconnectez-vous pour accéder aux médias.';
  }
  return 'Impossible de charger les médias. Réessayez ou contactez le support SI.';
}

describe('media error messages', () => {
  it('suggests backend when network fails', () => {
    expect(formatAssetsError(null, true)).toContain('backend');
  });

  it('mentions session when unauthorized', () => {
    expect(formatAssetsError(401, false)).toContain('Reconnectez-vous');
  });
});
