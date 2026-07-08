import { useMemo, useState } from 'react';
import { requestPasswordReset, resetPassword } from '../api/auth.js';
import AuthBrandBackground from '../components/AuthBrandBackground.jsx';
import AuthBrandHero from '../components/AuthBrandHero.jsx';
import { executeRecaptcha } from '../utils/recaptcha.js';

const RECAPTCHA_ERROR_MESSAGE =
  'No se pudo completar la verificacion anti-bot. Intentalo de nuevo.';

export default function ResetPasswordPage({ onGoToLogin }) {
  const token = useMemo(() => {
    const search = new URLSearchParams(window.location.search);
    return search.get('token') || '';
  }, []);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [invalidToken, setInvalidToken] = useState(!token);

  function clearMessages() {
    if (error) setError('');
    if (recoverySuccess) setRecoverySuccess('');
  }

  function handlePasswordChange(event) {
    clearMessages();
    setPassword(event.target.value);
  }

  function handleConfirmPasswordChange(event) {
    clearMessages();
    setConfirmPassword(event.target.value);
  }

  function handleRecoveryEmailChange(event) {
    clearMessages();
    setRecoveryEmail(event.target.value);
  }

  function normalizeError(err) {
    if (
      err?.message === 'Missing VITE_RECAPTCHA_SITE_KEY' ||
      err?.message === 'reCAPTCHA unavailable'
    ) {
      return RECAPTCHA_ERROR_MESSAGE;
    }

    return err?.message || RECAPTCHA_ERROR_MESSAGE;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setRecoverySuccess('');

    if (!token) {
      setInvalidToken(true);
      setError('El enlace no es valido o ha caducado.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    try {
      const data = await resetPassword(token, password);
      setSuccess(data.message || 'Contrasena actualizada correctamente.');
      setPassword('');
      setConfirmPassword('');
      setInvalidToken(false);
    } catch (err) {
      const message = err.message || 'El enlace no es valido o ha caducado.';
      setError(message);
      if (message.toLowerCase().includes('enlace') || message.toLowerCase().includes('token')) {
        setInvalidToken(true);
      }
    }
  }

  async function handleRequestNewLink(event) {
    event.preventDefault();
    setError('');
    setRecoverySuccess('');

    try {
      const recaptchaToken = await executeRecaptcha('forgot_password');
      const data = await requestPasswordReset({
        email: recoveryEmail,
        recaptchaToken,
        recaptchaAction: 'forgot_password'
      });
      setRecoverySuccess(
        data.message ||
          'Si el email existe, te enviaremos un nuevo enlace para restablecer tu contrasena.'
      );
      setRecoveryEmail('');
    } catch (err) {
      setError(normalizeError(err));
    }
  }

  return (
    <main className="auth-shell">
      <AuthBrandBackground />
      <section className="auth-panel verify-email-panel">
        <div className="auth-brand">
          <AuthBrandHero />
          <h1>
            {success
              ? 'Contrasena actualizada correctamente'
              : invalidToken
                ? 'No hemos podido restablecer tu contrasena'
                : 'Restablece tu contrasena'}
          </h1>
        </div>

        {success ? (
          <div className="auth-success-state" role="status">
            <h2>Contrasena actualizada correctamente</h2>
            <p className="muted">Ya puedes iniciar sesion en Planifica.</p>
            <button className="primary-button" onClick={onGoToLogin} type="button">
              Ir al inicio de sesion
            </button>
          </div>
        ) : invalidToken ? (
          <>
            <div className="auth-success-state">
              <p className="muted">
                El enlace puede haber caducado o ya haber sido utilizado. Puedes solicitar uno
                nuevo.
              </p>
            </div>

            <form className="form" onSubmit={handleRequestNewLink}>
              <label>
                Email
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={handleRecoveryEmailChange}
                  placeholder="tu@email.com"
                  required
                />
              </label>

              <p className="auth-helper">
                El formulario requiere verificacion anti-bot antes de enviar la solicitud.
              </p>

              {recoverySuccess && (
                <p className="auth-notice" role="status">
                  Si el email existe, te enviaremos un nuevo enlace para restablecer tu contrasena.
                </p>
              )}

              {error && <p className="error">{error}</p>}

              <button className="primary-button" type="submit">
                Solicitar nuevo enlace
              </button>
            </form>

            <button className="link-button" onClick={onGoToLogin} type="button">
              Ir al inicio de sesion
            </button>
          </>
        ) : (
          <>
            <form className="form" onSubmit={handleSubmit}>
              <label>
                Nueva contrasena
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </label>

              <label>
                Confirmar contrasena
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
              </label>

              {error && <p className="error">{error}</p>}

              <button className="primary-button" type="submit">
                Guardar nueva contrasena
              </button>
            </form>

            <button className="link-button" onClick={onGoToLogin} type="button">
              Ir al inicio de sesion
            </button>
          </>
        )}
      </section>
    </main>
  );
}
