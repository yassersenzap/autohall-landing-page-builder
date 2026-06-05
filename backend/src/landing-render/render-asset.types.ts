export type RenderAssetEntry = {
  /** URL absolue pour la preview HTML (route publique, pas de JWT). */
  previewUrl: string;
  /** Chemin relatif dans le ZIP / cPanel, ex. assets/images/{storedName}. */
  exportPath: string;
  storagePath: string;
  storedName: string;
  mimeType: string;
  /** Chemin absolu sur disque — utilisé uniquement à l'export ZIP, pas injecté dans le HTML. */
  absolutePath: string;
};

export type RenderAssetMap = Record<string, RenderAssetEntry>;

export type LandingRenderContext = {
  mode: 'preview' | 'export';
  assetMap: RenderAssetMap;
};
