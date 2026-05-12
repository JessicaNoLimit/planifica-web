import { useEffect, useMemo, useState } from 'react';
import AuthBrandBackground from '../components/AuthBrandBackground.jsx';
import AuthBrandHero from '../components/AuthBrandHero.jsx';
import { verifyEmail } from '../api/auth.js';

export default function VerifyEmailPage({ onGoToLogin }) {
  const token = useMemo(() => {
    const search = new URLSearchParams(window.location.search);
    return search.get('token') || '';
  }, []);

  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(
    token ? 'Verificando tu email...' : 'El enlace puede haber caducado o no ser válido.'
  );

  useEffect(() => {
    if (!token) return;

    let isActive = true;

    verifyEmail(token)
      .then((data) => {
        if (!isActive) return;
        setStatus('success');
        setMessage(data.message || 'Ya puedes iniciar sesión en Planifica.');
      })
      .catch((err) => {
        if (!isActive) return;
        setStatus('error');
        setMessage(err.message || 'El enlace puede haber caducado o no ser válido.');
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <main className="auth-shell">
      <AuthBrandBackground />
      <section className="auth-panel verify-email-panel">
        <div className="auth-brand">
          <AuthBrandHero />
          <h1>
            {status === 'loading' && 'Verificando tu email...'}
            {status === 'success' && 'Email verificado correctamente'}
            {status === 'error' && 'No hemos podido verificar tu email'}
          </h1>
        </div>

        <div className="auth-success-state" role="status">
          <p className="muted">
            {status === 'loading' && 'Estamos comprobando tu enlace de verificación.'}
            {status === 'success' && 'Ya puedes iniciar sesión en Planifica.'}
            {status === 'error' && message}
          </p>

          {status === 'success' && <p className="muted">{message}</p>}

          <button className="primary-button" onClick={onGoToLogin} type="button">
            Ir al inicio de sesión
          </button>
        </div>
      </section>
    </main>
  );
}
