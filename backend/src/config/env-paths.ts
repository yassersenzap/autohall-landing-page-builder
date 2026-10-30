import { join } from 'path';

/**
 * Chemins .env pour NestJS / Prisma CLI en développement local (cwd = backend/).
 *
 * Le .env racine est réservé à Docker Compose — il n'est pas chargé ici.
 * En conteneur, les variables viennent de docker-compose `environment`.
 */
export function getEnvFilePaths(): string[] {
  const cwd = process.cwd();
  return [join(cwd, '.env')];
}
