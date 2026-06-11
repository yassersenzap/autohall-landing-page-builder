/** Primary image field keys per block type — used by Assets panel apply. */
export function getBlockPrimaryImageFieldKeys(
  blockType: string,
): { assetKey: string; urlKey: string } | null {
  const map: Record<string, { assetKey: string; urlKey: string }> = {
    hero_vehicle_offer: { assetKey: 'heroImage', urlKey: 'heroImageUrl' },
    campaign_lead_hero: { assetKey: 'primaryImage', urlKey: 'primaryImageUrl' },
    media_only: { assetKey: 'imageAssetId', urlKey: 'imageUrl' },
    promo_autohall: { assetKey: 'imageAssetId', urlKey: 'imageUrl' },
    hero_campaign: { assetKey: 'imageAssetId', urlKey: 'imageUrl' },
    hero_form_campaign: { assetKey: 'imageAssetId', urlKey: 'imageUrl' },
  };
  return map[blockType] ?? null;
}
