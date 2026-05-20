import { join } from 'path';

/**
 * Chemins .env (depuis backend/) :
 * 1. racine du dépôt — fichier principal
 * 2. backend/.env — surcharges locales optionnelles
 *
 * ConfigModule Nest : la première entrée a la priorité sur les doublons.
 */
export function getEnvFilePaths(): string[] {
  const cwd = process.cwd();
  return [join(cwd, '..', '.env'), join(cwd, '.env')];
}
