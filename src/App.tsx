// ZeroProfit — route table (React Router v7, library mode).

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MarketingLayout } from './routes/marketing/MarketingLayout';
import { HomePage } from './routes/marketing/HomePage';
import { AboutPage } from './routes/marketing/AboutPage';
import { HowItWorksPage } from './routes/marketing/HowItWorksPage';
import { ImpactPage } from './routes/marketing/ImpactPage';
import { MethodologyPage } from './routes/marketing/MethodologyPage';
import { FreePage } from './routes/marketing/FreePage';
import { WaitlistPage } from './routes/marketing/WaitlistPage';
import { NewsPage } from './routes/marketing/NewsPage';
import { LegalPage } from './routes/marketing/LegalPage';
import { OrgPublicPage } from './routes/marketing/OrgPublicPage';
import { LoginPage } from './routes/app/LoginPage';
import { RegisterPage } from './routes/app/RegisterPage';
import { AppShell } from './components/layout/AppShell';
import { OnboardingPage } from './routes/app/OnboardingPage';
import { DashboardPage } from './routes/app/DashboardPage';
import { ScorePage } from './routes/app/ScorePage';
import { TeamPage } from './routes/app/TeamPage';
import { ServicesPage } from './routes/app/ServicesPage';
import { DeployPage } from './routes/app/DeployPage';
import { WidgetsPage } from './routes/app/WidgetsPage';
import { VerificationPage } from './routes/app/VerificationPage';
import { OrgSettingsPage } from './routes/app/OrgSettingsPage';
import { MePage } from './routes/app/MePage';
import { ForbiddenPage, NotFoundPage, SuspendedPage } from './routes/app/StatusPages';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing + auth (standalone brand; OpenRockets only in footer) */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/free" element={<FreePage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/org/:slug" element={<OrgPublicPage />} />
        <Route path="/legal/:slug" element={<LegalPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Platform (authenticated app shell) */}
      <Route element={<AppShell />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/org/score" element={<ScorePage />} />
        <Route path="/org/services" element={<ServicesPage />} />
        <Route path="/org/team" element={<TeamPage />} />
        <Route path="/org/deploy" element={<DeployPage />} />
        <Route path="/org/widgets" element={<WidgetsPage />} />
        <Route path="/org/verification" element={<VerificationPage />} />
        <Route path="/org/settings" element={<OrgSettingsPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/suspended" element={<SuspendedPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<MarketingLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
