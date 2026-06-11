import type { AutohallSymfonyIncludeKey } from './export-contracts.types';

/**
 * Maps whitelisted builder include keys to Symfony Twig partial paths.
 *
 * SI Digital: adjust these constants to match the real Auto Hall Symfony
 * template tree. Do NOT expose arbitrary paths in the builder — change this
 * file only during controlled deployments.
 */
export const SYMFONY_TESTDRIVE_INCLUDE_PATHS: Record<
  AutohallSymfonyIncludeKey,
  string
> = {
  testdrive_campaign:
    'form/testdrive/_campaign_form.html.twig',
  testdrive_model:
    'form/testdrive/_model_form.html.twig',
  testdrive_promo:
    'form/testdrive/_promo_form.html.twig',
};

export function resolveSymfonyIncludePath(
  includeKey: AutohallSymfonyIncludeKey,
): string {
  return SYMFONY_TESTDRIVE_INCLUDE_PATHS[includeKey];
}
