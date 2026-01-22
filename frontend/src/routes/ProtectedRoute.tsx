import React from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '@shared/rbac';
import { useAuth } from '../auth/AuthProvider';
import { NotAuthorized } from '../components/NotAuthorized';

export const ProtectedRoute = ({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: Role[];
}) => {
  const { accessToken, termsAccepted, role } = useAuth();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (!termsAccepted) {
    return <Navigate to="/terms" replace />;
  }

  if (requireRole && role && !requireRole.includes(role)) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
};
