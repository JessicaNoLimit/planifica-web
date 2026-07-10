import { useState } from 'react';
import { requestPasswordReset } from '../api/auth.js';
import AuthBrandBackground from '../components/AuthBrandBackground.jsx';
import AuthBrandHero from '../components/AuthBrandHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { executeRecaptcha } from '../utils/recaptcha.js';

const RECAPTCHA_ERROR_MESSAGE =
  'No se pudo completar la verificación anti-bot. Inténtalo de nuevo.';

export default function AuthPage({ mode, onModeChange }) {
  const isRegister = mode === 'register';
  const isForgotPassword = mode === 'forgot-password';
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);

  function capitalizeNameStart(value) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function updateField(event) {
    const nextValue =
      event.target.name === 'nombre'
        ? capitalizeNameStart(event.target.value)
        : event.target.value;

    setForm((current) => ({ ...current, [event.target.name]: nextValue }));
    if (registrationSuccess) {
      setRegistrationSuccess('');
    }
  }

  function handleRecoveryEmailChange(event) {
    setRecoveryEmail(event.target.value);
    if (recoverySubmitted) {
      setRecoverySubmitted(false);
    }
  }

  function normalizeRecaptchaError(err) {
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

    try {
      const action = isRegister ? 'register' : 'login';
      const recaptchaToken = await executeRecaptcha(action);

      if (isRegister) {
        const data = await register({
          ...form,
          recaptchaToken,
          recaptchaAction: action
        });

        setRegistrationSuccess(
          data.message ||
            'Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada antes de iniciar sesión.'
        );
        setForm({
          nombre: '',
          email: '',
          password: ''
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
          recaptchaToken,
          recaptchaAction: action
        });
      }
    } catch (err) {
      setError(normalizeRecaptchaError(err));
    }
  }

  async function handleRecoverySubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const recaptchaToken = await executeRecaptcha('forgot_password');
      const data = await requestPasswordReset({
        email: recoveryEmail,
        recaptchaToken,
        recaptchaAction: 'forgot_password'
      });

      setRecoverySubmitted(true);
      setRecoveryEmail('');
      setError('');
      setRegistrationSuccess(data.message || '');
    } catch (err) {
      setError(normalizeRecaptchaError(err));
    }
  }

  const title = isForgotPassword
    ? 'Recupera tu acceso'
    : isRegister
      ? 'Crea tu espacio personal'
      : 'Tu escritorio personal de productividad';

  return (
    <main className="auth-shell">
      <AuthBrandBackground />
      <section className="auth-panel">
        <div className="auth-brand">
          <AuthBrandHero />
          <h1>{title}</h1>
        </div>

        {isForgotPassword ? (
          <>
            <form className="form" onSubmit={handleRecoverySubmit}>
              <label>
                Email
                <input
                  name="recoveryEmail"
                  type="email"
                  value={recoveryEmail}
                  onChange={handleRecoveryEmailChange}
                  placeholder="tu@email.com"
                  required
                />
              </label>

              <p className="auth-helper">
                Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {recoverySubmitted && (
                <p className="auth-notice" role="status">
                  Si el email existe, te enviaremos instrucciones para restablecer la contraseña.
                </p>
              )}

              {error && <p className="error">{error}</p>}

              <button className="primary-button" type="submit">
                Continuar
              </button>
            </form>

            <button className="link-button" type="button" onClick={() => onModeChange('login')}>
              Volver al acceso
            </button>
          </>
        ) : (
          <>
            {isRegister && registrationSuccess ? (
              <div className="auth-success-state" role="status">
                <h2>Cuenta creada correctamente</h2>
                <p className="muted">
                  Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada antes de
                  iniciar sesión.
                </p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    setRegistrationSuccess('');
                    setError('');
                    onModeChange('login');
                  }}
                >
                  Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <>
                <form className="form" onSubmit={handleSubmit}>
                  {isRegister && (
                    <label>
                      Nombre
                      <input name="nombre" value={form.nombre} onChange={updateField} required />
                    </label>
                  )}

                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      required
                    />
                  </label>

                  <label>
                    Password
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={updateField}
                      required
                    />
                  </label>

                  {!isRegister && (
                    <button
                      className="auth-text-link"
                      type="button"
                      onClick={() => onModeChange('forgot-password')}
                    >
                      ¿Has olvidado tu contraseña?
                    </button>
                  )}

                  {error && <p className="error">{error}</p>}

                  <button className="primary-button" type="submit">
                    {isRegister ? 'Crear cuenta' : 'Entrar'}
                  </button>
                </form>

                <button
                  className="link-button"
                  type="button"
                  onClick={() => {
                    setRegistrationSuccess('');
                    setError('');
                    onModeChange(isRegister ? 'login' : 'register');
                  }}
                >
                  {isRegister ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
                </button>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
