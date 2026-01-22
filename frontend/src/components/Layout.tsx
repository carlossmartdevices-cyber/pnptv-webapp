import { Link } from 'react-router-dom';
import { useAuthStore } from '../auth/useAuth';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { role, sessionProfile, logout } = useAuthStore();

  return (
    <div>
      <header style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
        <nav style={{ display: 'flex', gap: '12px' }}>
          <Link to="/hangouts">Hangouts</Link>
          <Link to="/videorama">Videorama</Link>
          <Link to="/terms">T&C</Link>
        </nav>
        <div style={{ marginTop: '8px' }}>
          {sessionProfile ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span>{sessionProfile.displayName}</span>
              <span>Rol: {role}</span>
              <button onClick={logout}>Salir</button>
            </div>
          ) : (
            <span>No autenticado</span>
          )}
        </div>
      </header>
      <main style={{ padding: '24px' }}>{children}</main>
    </div>
  );
};

export default Layout;
