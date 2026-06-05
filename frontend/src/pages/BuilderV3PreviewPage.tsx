import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Monitor, Smartphone } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ShadButton } from '@/components/ui/primitives';
import {
  hydrateBuilderDocumentStore,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';
import { getStudioRoute } from '@/lib/landing-studio-routes';
import { fetchPagePreview } from '@/lib/page-preview';
import { PreviewDocument } from '@/features/builder-v3/canvas/PreviewDocument';
import { BuilderPreviewProvider } from '@/features/builder-v3/context/BuilderPreviewContext';
import { injectIframeStyles } from '@/features/builder-v3/canvas/inject-iframe-styles';
import { applyPageSeoToDocument } from '@/features/builder-v3/lib/apply-page-seo';

export default function BuilderV3PreviewPage() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [leadContext, setLeadContext] = useState<{
    campaignId: string;
    landingPageId: string;
    landingSlug: string;
  } | null>(null);
  const pageSettings = useBuilderDocumentStore((s) => s.pageSettings);

  const bootIframe = useCallback(async (iframe: HTMLIFrameElement) => {
    const doc = iframe.contentDocument;
    if (!doc) return;

    if (!doc.documentElement.querySelector('head')) {
      doc.open();
      doc.write(
        '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /><title>Aperçu</title></head><body></body></html>',
      );
      doc.close();
    }

    await injectIframeStyles(doc);
    setMountNode(doc.body);
  }, []);

  useEffect(() => {
    if (!pageVersionId) return;

    let cancelled = false;

    void hydrateBuilderDocumentStore(pageVersionId).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [pageVersionId]);

  useEffect(() => {
    if (!pageVersionId || !ready) return;

    let cancelled = false;

    void fetchPagePreview(pageVersionId)
      .then((response) => {
        if (cancelled) return;
        setLeadContext({
          campaignId: response.data.campaign.id,
          landingPageId: response.data.landingPage.id,
          landingSlug: response.data.landingPage.slug,
        });
      })
      .catch(() => {
        if (!cancelled) setLeadContext(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pageVersionId, ready]);

  useEffect(() => {
    if (!ready) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const run = () => void bootIframe(iframe);
    if (iframe.contentDocument?.readyState === 'complete') {
      run();
      return;
    }
    iframe.addEventListener('load', run);
    return () => iframe.removeEventListener('load', run);
  }, [bootIframe, ready]);

  useEffect(() => {
    applyPageSeoToDocument(document, pageSettings, {
      fallbackTitle: 'Aperçu campagne Auto Hall',
    });

    const iframeDoc = iframeRef.current?.contentDocument;
    if (iframeDoc) {
      applyPageSeoToDocument(iframeDoc, pageSettings, {
        fallbackTitle: 'Aperçu campagne Auto Hall',
      });
    }
  }, [pageSettings, mountNode, ready]);

  const previewProviderValue = useMemo(
    () => ({
      interactive: Boolean(leadContext),
      pageVersionId,
      campaignId: leadContext?.campaignId,
      landingPageId: leadContext?.landingPageId,
      landingSlug: leadContext?.landingSlug,
    }),
    [leadContext, pageVersionId],
  );

  if (!pageVersionId) {
    return <p className="p-6 text-sm text-neutral-400">Identifiant manquant.</p>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-400">
        Chargement de l&apos;aperçu depuis le cache local…
      </div>
    );
  }

  const previewTitle = pageSettings.metaTitle.trim() || 'Aperçu campagne Auto Hall';

  return (
    <BuilderPreviewProvider value={previewProviderValue}>
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-800 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={getStudioRoute(pageVersionId)}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-neutral-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour au studio
          </Link>
          <Link to="/campaigns" className="shrink-0 text-xs text-neutral-500 hover:text-neutral-300">
            Campagnes
          </Link>
          <p className="hidden truncate text-xs text-neutral-500 sm:block" title={previewTitle}>
            SEO : {previewTitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShadButton
            type="button"
            size="sm"
            variant={viewport === 'desktop' ? 'default' : 'secondary'}
            onClick={() => setViewport('desktop')}
          >
            <Monitor className="mr-1 h-3.5 w-3.5" aria-hidden />
            Desktop
          </ShadButton>
          <ShadButton
            type="button"
            size="sm"
            variant={viewport === 'mobile' ? 'default' : 'secondary'}
            onClick={() => setViewport('mobile')}
          >
            <Smartphone className="mr-1 h-3.5 w-3.5" aria-hidden />
            Mobile
          </ShadButton>
        </div>
      </header>

      <div className="flex flex-1 justify-center overflow-auto bg-neutral-900/80 p-6">
        <div
          className={
            viewport === 'mobile'
              ? 'w-[390px] shadow-2xl transition-all duration-300'
              : 'w-full max-w-[1152px] transition-all duration-300'
          }
        >
          <iframe
            ref={iframeRef}
            title="Aperçu landing"
            className="min-h-[720px] w-full rounded-lg border border-neutral-700 bg-white"
            sandbox="allow-same-origin allow-scripts"
            src="about:blank"
          />
          {mountNode ? createPortal(<PreviewDocument />, mountNode) : null}
        </div>
      </div>
    </div>
    </BuilderPreviewProvider>
  );
}
