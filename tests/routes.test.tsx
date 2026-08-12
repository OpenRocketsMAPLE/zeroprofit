// Practical route smoke tests (jsdom + testing-library).

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../src/App';
import { ToastProvider } from '../src/components/ui/Toast';
import { resetDemo, signIn, createOrg } from '../src/store/store';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('marketing routes', () => {
  it('renders the mission-led hero on the homepage', () => {
    renderAt('/');
    expect(screen.getByText(/NETWORK FOR TEEN NONPROFITS/)).toBeInTheDocument();
    expect(screen.getAllByText(/Claim your ZPO/).length).toBeGreaterThan(0);
  });

  it('renders the leaderboard with sample orgs', () => {
    renderAt('/impact');
    expect(screen.getByText(/Leaderboard of real impact/)).toBeInTheDocument();
    expect(screen.getByText('Future Coders Collective')).toBeInTheDocument();
    expect(screen.getByText(/Sample demo data/)).toBeInTheDocument();
  });

  it('renders a sample organization label page with an IFS', () => {
    renderAt('/org/future-coders');
    expect(screen.getByText('Future Coders Collective')).toBeInTheDocument();
    expect(screen.getByText(/Impact Factor Score/)).toBeInTheDocument();
  });

  it('renders the methodology page with weights', () => {
    renderAt('/methodology');
    expect(screen.getByText(/How the Impact Factor Score works/)).toBeInTheDocument();
    expect(screen.getByText(/Anti-gaming/)).toBeInTheDocument();
  });

  it('renders a 404 for unknown paths', () => {
    renderAt('/definitely-not-a-page');
    expect(screen.getByText(/Page not found/)).toBeInTheDocument();
  });
});

describe('platform guards', () => {
  it('redirects the dashboard to sign-in when no account exists', () => {
    resetDemo();
    renderAt('/dashboard');
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('onboarding redirects to the dashboard when an org already exists', () => {
    resetDemo();
    signIn({ name: 'Demo Owner', email: 'owner@demo.org', country: 'US', dob: '2006-01-01', consentTier: 'general' });
    createOrg({ name: 'Demo Club', slug: 'demo-club', tagline: 't', description: 'd', category: 'education', foundedYear: 2024 });
    renderAt('/onboarding');
    expect(screen.getByText('Impact Factor Score')).toBeInTheDocument(); // dashboard headline
  });

  it('shows the preview label on onboarding for a new account', () => {
    resetDemo();
    signIn({ name: 'Demo Owner', email: 'owner@demo.org', country: 'US', dob: '2006-01-01', consentTier: 'general' });
    renderAt('/onboarding');
    expect(screen.getByRole('heading', { name: 'Create your organization' })).toBeInTheDocument();
    expect(screen.getAllByText(/Preview — not published/).length).toBeGreaterThan(0);
  });
});
