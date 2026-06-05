import { Navigate, useParams } from 'react-router-dom';

type LandingStudioLegacyRedirectProps = {
  target: 'studio' | 'preview';
};

/** Redirections legacy — l’ancien builder blocs n’est plus accessible. */
export default function LandingStudioLegacyRedirect({
  target,
}: LandingStudioLegacyRedirectProps) {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();

  if (!pageVersionId) {
    return <Navigate to="/campaigns" replace />;
  }

  const path =
    target === 'preview'
      ? `/page-versions/${pageVersionId}/studio/preview`
      : `/page-versions/${pageVersionId}/studio`;

  return <Navigate to={path} replace />;
}
