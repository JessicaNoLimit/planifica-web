import { useEffect, useState } from 'react';
import Footer from './components/Footer.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function goToLogin() {
    window.history.replaceState({}, '', '/');
    setCurrentPath('/');
    setAuthMode('login');
  }

  if (loading) {
    return (
      <>
        <main className="screen-center">Cargando escritorio...</main>
        <Footer />
      </>
    );
  }

  if (currentPath === '/verify-email') {
    return (
      <>
        <VerifyEmailPage onGoToLogin={goToLogin} />
        <Footer />
      </>
    );
  }

  if (currentPath === '/reset-password') {
    return (
      <>
        <ResetPasswordPage onGoToLogin={goToLogin} />
        <Footer />
      </>
    );
  }

  return user ? (
    <>
      <DashboardPage />
      <Footer />
    </>
  ) : (
    <>
      <AuthPage mode={authMode} onModeChange={setAuthMode} />
      <Footer />
    </>
  );
}
