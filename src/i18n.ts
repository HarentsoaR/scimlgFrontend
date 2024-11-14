// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          title: "Malagasy Science",
          description: "Please login to your account",
          email: "Email",
          password: "Password",
          login: "Login",
          errorMessage: "Login failed. Please check your credentials.",
          signupPrompt: "Don't have an account?",
          signupLink: "Sign up",
          google: "Continue with Google",
          facebook: "Continue with Facebook",
        },
      },
      mg: {
        translation: {
          title: "Siansa Malagasy",
          description: "Azafady midira ao amin'ny kaontinao",
          email: "Email",
          password: "Tenimiafina",
          login: "Hiditra",
          errorMessage: "Tsy nahomby ny fidirana. Jereo azafady ny mombamomba anao.",
          signupPrompt: "Tsy manana kaonty?",
          signupLink: "Mamorona kaonty",
          google: "Mandehana amin'ny Google",
          facebook: "Mandehana amin'ny Facebook",
        },
      },
    },
    lng: "en", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
  });

export default i18n;
