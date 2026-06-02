import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const available = ['en','ta','si','de','fr','ru','zh','ja','it','es'];

const languageResources = import.meta.glob('./locales/*/translation.json', { query: '?raw', import: 'default' });

const loadLanguage = async (lng) => {
  try {
    const path = `./locales/${lng}/translation.json`;
    const loader = languageResources[path];
    if (!loader) {
      throw new Error(`No locale file found for ${lng}`);
    }
    const loaded = await loader();
    let data = loaded;

    if (typeof loaded === 'object' && loaded !== null && 'default' in loaded) {
      data = loaded.default;
    }

    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    i18n.addResourceBundle(lng, 'translation', data, true, true);
    return data;
  } catch (err) {
    console.warn('Failed to load', lng, err);
    return null;
  }
};

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('i18nextLng') || 'en',
  fallbackLng: 'en',
  resources: {},
  interpolation: { escapeValue: false },
  react: { useSuspense: true }
});

// Preload the initial language bundle
const initial = localStorage.getItem('i18nextLng') || 'en';
loadLanguage(initial);

// Expose helper to change language lazily
export const changeLanguage = async (lng) => {
  if (!available.includes(lng)) lng = 'en';
  if (!i18n.hasResourceBundle(lng, 'translation')) {
    await loadLanguage(lng);
  }
  i18n.changeLanguage(lng);
  localStorage.setItem('i18nextLng', lng);
};

export default i18n;
