import { lazy, Suspense } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { StudioThemeProvider } from './context/StudioThemeContext';

import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

import ProtectedFullscreenRoute from './components/ProtectedFullscreenRoute';

import CampaignLandingPagesPage from './pages/CampaignLandingPagesPage';

import LandingPageVersionsPage from './pages/LandingPageVersionsPage';

import LandingStudioLegacyRedirect from './pages/LandingStudioLegacyRedirect';

import CampaignsPage from './pages/CampaignsPage';

import LeadDetailPage from './pages/LeadDetailPage';

import LeadsPage from './pages/LeadsPage';

import DashboardPage from './pages/DashboardPage';

import HomePage from './pages/HomePage';

import LoginPage from './pages/LoginPage';

import UsersAdminPage from './pages/admin/UsersAdminPage';




const BuilderV4Page = lazy(() => import('./pages/BuilderV4Page'));

const BuilderV4PreviewPage = lazy(() => import('./pages/BuilderV4PreviewPage'));



function StudioRouteFallback() {

  return <p className="p-6 text-sm text-muted-foreground">Chargement du studio…</p>;

}



export default function App() {

  return (

    <StudioThemeProvider>

      <BrowserRouter>

        <Routes>

          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/preview/:previewId"
            element={
              <Suspense fallback={<StudioRouteFallback />}>
                <BuilderV4PreviewPage />
              </Suspense>
            }
          />

          <Route
            path="/builder-v4"
            element={
              <Suspense fallback={<StudioRouteFallback />}>
                <BuilderV4Page />
              </Suspense>
            }
          />

          <Route path="/builder" element={<Navigate to="/builder-v4" replace />} />

          <Route element={<ProtectedFullscreenRoute />}>

            <Route

              path="/page-versions/:pageVersionId/studio"

              element={

                <Suspense fallback={<StudioRouteFallback />}>

                  <BuilderV4Page />

                </Suspense>

              }

            />

            <Route

              path="/page-versions/:pageVersionId/studio/preview"

              element={

                <Suspense fallback={<StudioRouteFallback />}>

                  <BuilderV4PreviewPage />

                </Suspense>

              }

            />

            {/* Legacy aliases — redirection vers routes officielles */}

            <Route path="/studio-v3" element={<Navigate to="/campaigns" replace />} />

            <Route

              path="/page-versions/:pageVersionId/blocks"

              element={<LandingStudioLegacyRedirect target="studio" />}

            />

            <Route

              path="/page-versions/:pageVersionId/studio-v2"

              element={<LandingStudioLegacyRedirect target="studio" />}

            />

            <Route

              path="/page-versions/:pageVersionId/studio-v2-preview"

              element={<LandingStudioLegacyRedirect target="preview" />}

            />

            <Route

              path="/page-versions/:pageVersionId/preview"

              element={<LandingStudioLegacyRedirect target="preview" />}

            />

          </Route>

          <Route element={<ProtectedRoute />}>

            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/campaigns" element={<CampaignsPage />} />

            <Route path="/leads" element={<LeadsPage />} />

            <Route path="/leads/:id" element={<LeadDetailPage />} />

            <Route

              path="/campaigns/:campaignId/landing-pages"

              element={<CampaignLandingPagesPage />}

            />

            <Route

              path="/landing-pages/:landingPageId/versions"

              element={<LandingPageVersionsPage />}

            />

          </Route>

          <Route element={<ProtectedAdminRoute />}>

            <Route path="/admin/users" element={<UsersAdminPage />} />


          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </BrowserRouter>

    </StudioThemeProvider>

  );

}
