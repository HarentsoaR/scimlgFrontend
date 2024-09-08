import i18next from 'i18next';
import { initReactI18next } from 'react-i18next'; // Import the initReactI18next
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18next
  .use(Backend) // Add the backend
  .use(LanguageDetector)
  .use(initReactI18next) // Initialize react-i18next
  .init({
    fallbackLng: 'en',
    detection: {
      order: ['querystring', 'cookie'],
      lookupQueryParameter: 'lang',
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Adjust the path to your JSON files
    },
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  })
  .then(() => {
    console.log('i18next initialized');
  })
  .catch(err => console.error('Initialization error:', err));

export default i18next;
