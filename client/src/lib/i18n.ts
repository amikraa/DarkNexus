import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "login.title": "Nezuko Card Checker",
      "login.accessKey": "Access Key",
      "login.button": "Login",
      "dashboard.welcome": "Welcome to Nezuko Card Checker",
      "profile.proxy": "Proxy Settings",
      "profile.language": "Language",
      "gateway.title": "Card Checker",
      "gateway.input": "Enter cards (format: cc|mm|yy|cvv)",
      "gateway.start": "Start Checking",
      "gateway.stop": "Stop"
    }
  },
  es: {
    translation: {
      "login.title": "Nezuko Verificador de Tarjetas",
      "login.accessKey": "Clave de Acceso",
      "login.button": "Iniciar Sesión",
      "dashboard.welcome": "Bienvenido a Nezuko Verificador",
      "profile.proxy": "Configuración de Proxy",
      "profile.language": "Idioma",
      "gateway.title": "Verificador de Tarjetas",
      "gateway.input": "Ingrese tarjetas (formato: cc|mm|yy|cvv)",
      "gateway.start": "Comenzar",
      "gateway.stop": "Detener"
    }
  },
  hi: {
    translation: {
      "login.title": "नेज़ुको कार्ड चेकर",
      "login.accessKey": "एक्सेस की",
      "login.button": "लॉगिन",
      "dashboard.welcome": "नेज़ुको कार्ड चेकर में आपका स्वागत है",
      "profile.proxy": "प्रॉक्सी सेटिंग्स",
      "profile.language": "भाषा",
      "gateway.title": "कार्ड चेकर",
      "gateway.input": "कार्ड दर्ज करें (प्रारूप: cc|mm|yy|cvv)",
      "gateway.start": "शुरू करें",
      "gateway.stop": "रोकें"
    }
  }
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;
