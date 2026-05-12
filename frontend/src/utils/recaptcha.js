const scriptLoads = new Map();
const RECAPTCHA_ERROR_MESSAGE =
  'No se pudo completar la verificación anti-bot. Inténtalo de nuevo.';

function loadRecaptchaScript(siteKey) {
  if (!siteKey) {
    return Promise.reject(new Error(RECAPTCHA_ERROR_MESSAGE));
  }

  const scriptSrc = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;

  if (window.grecaptcha) {
    return Promise.resolve(window.grecaptcha);
  }

  if (scriptLoads.has(scriptSrc)) {
    return scriptLoads.get(scriptSrc);
  }

  const loadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.grecaptcha), { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.grecaptcha);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  scriptLoads.set(scriptSrc, loadPromise);
  return loadPromise;
}

export async function executeRecaptcha(action) {
  try {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const grecaptcha = await loadRecaptchaScript(siteKey);

    if (!grecaptcha) {
      throw new Error(RECAPTCHA_ERROR_MESSAGE);
    }

    return await new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(siteKey, { action })
          .then((token) => {
            if (!token) {
              reject(new Error(RECAPTCHA_ERROR_MESSAGE));
              return;
            }

            resolve(token);
          })
          .catch(() => reject(new Error(RECAPTCHA_ERROR_MESSAGE)));
      });
    });
  } catch {
    throw new Error(RECAPTCHA_ERROR_MESSAGE);
  }
}
