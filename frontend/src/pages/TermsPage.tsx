import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../auth/apiClient';
import { useAuthStore } from '../auth/useAuth';

const TERMS_URL = 'https://pnptv.app/terms';

const TermsPage = () => {
  const [accepted, setAccepted] = useState(false);
  const { setTermsAccepted } = useAuthStore();
  const navigate = useNavigate();

  const handleAccept = async () => {
    await apiClient.post('/auth/accept-terms');
    setTermsAccepted();
    navigate('/hangouts');
  };

  return (
    <div>
      <h1>Reglas básicas de uso – PNPtv</h1>
      <p>
        Lee los términos completos en{' '}
        <a href={TERMS_URL} target="_blank" rel="noreferrer">
          {TERMS_URL}
        </a>
      </p>

      <section>
        <h2>Hangouts (Video Calls)</h2>
        <ul>
          <li>Las salas son espacios sociales entre adultos verificados.</li>
          <li>No se permite grabar pantalla, audio ni redistribuir contenido.</li>
          <li>Cada usuario es responsable de su comportamiento y de lo que comparte.</li>
          <li>El host de cada sala es responsable de su sala.</li>
          <li>PNPtv y PNP Latino TV no se hacen responsables por acciones de terceros.</li>
          <li>Abusos pueden resultar en expulsión o bloqueo de acceso.</li>
        </ul>
      </section>

      <section>
        <h2>Videorama (Playlists & Podcasts)</h2>
        <ul>
          <li>Listas/podcasts pueden ser creados por usuarios PRIME.</li>
          <li>Cada creador es responsable del contenido que publica.</li>
          <li>El contenido es solo para adultos.</li>
          <li>ADMIN puede editar o eliminar contenido cuando sea necesario.</li>
        </ul>
      </section>

      <section>
        <h2>Responsabilidad (Liability Release)</h2>
        <ul>
          <li>PNPtv y PNP Latino TV son plataformas tecnológicas.</li>
          <li>No somos responsables por acciones, palabras, contenido o conductas de los usuarios.</li>
          <li>Cada usuario participa bajo su propia responsabilidad.</li>
          <li>El uso de la plataforma implica aceptación total de estas condiciones.</li>
        </ul>
      </section>

      <label style={{ display: 'block', marginTop: '16px' }}>
        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        Acepto los términos y condiciones.
      </label>

      <button type="button" disabled={!accepted} onClick={handleAccept} style={{ marginTop: '12px' }}>
        Aceptar y continuar
      </button>
    </div>
  );
};

export default TermsPage;
