import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import CampaignLandingPagesPage from './pages/CampaignLandingPagesPage';
import LandingPageVersionsPage from './pages/LandingPageVersionsPage';
import PagePreviewPage from './pages/PagePreviewPage';
import PageVersionBlocksPage from './pages/PageVersionBlocksPage';
import CampaignsPage from './pages/CampaignsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import LeadsPage from './pages/LeadsPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
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
          <Route
            path="/page-versions/:pageVersionId/blocks"
            element={<PageVersionBlocksPage />}
          />
          <Route
            path="/page-versions/:pageVersionId/preview"
            element={<PagePreviewPage />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
