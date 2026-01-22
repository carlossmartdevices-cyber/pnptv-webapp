import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../auth/useAuth';

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'token',
      role: 'FREE',
      termsAccepted: false
    });
  });

  it('redirige a /terms cuando termsAccepted=false', () => {
    render(
      <MemoryRouter initialEntries={['/hangouts']}>
        <Routes>
          <Route
            path="/hangouts"
            element={
              <ProtectedRoute>
                <div>Contenido</div>
              </ProtectedRoute>
            }
          />
          <Route path="/terms" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/terms');
  });
});
