import React from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider } from '../auth/AuthProvider';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/hangouts']}>{children}</MemoryRouter>
);

describe('ProtectedRoute', () => {
  it('redirige a /terms cuando termsAccepted=false', () => {
    localStorage.setItem('pnptv.accessToken', 'token');
    localStorage.setItem('pnptv.expiresAt', new Date().toISOString());

    render(
      <Wrapper>
        <AuthProvider>
          <ProtectedRoute>
            <div>Secret</div>
          </ProtectedRoute>
        </AuthProvider>
      </Wrapper>
    );

    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });
});
