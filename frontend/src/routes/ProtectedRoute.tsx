import { Navigate, useLocation } from 'react-router-dom';
import type { Action } from '@shared/rbac';
import { can } from '@shared/rbac';
import { useAuthStore } from '../auth/useAuth';
import NotAuthorized from '../components/NotAuthorized';

const ProtectedRoute = ({
  children,
  requiredAction
}: {
  children: JSX.Element;
  requiredAction?: Action;
}) => {
  const location = useLocation();
  const { accessToken, role, termsAccepted } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!termsAccepted) {
    return <Navigate to="/terms" state={{ from: location }} replace />;
  }

  if (requiredAction && role && !can(role, requiredAction)) {
    return <NotAuthorized />;
  }

  return children;
};

export default ProtectedRoute;
