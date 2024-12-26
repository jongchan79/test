import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../public/locales/en/common.json';
import esTranslation from '../public/locales/es/common.json';

const initializeI18n = async () => {
  try {
    await i18n.use(initReactI18next).init({
      resources: {
        en: { translation: enTranslation },
        es: { translation: esTranslation },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });

    // console.log('i18n initialized successfully');
  } catch (error) {
    console.error('i18n initialization failed:', error);
    // 기본 언어로 설정: fallbackLng에 정의된 언어를 강제 설정
    i18n.changeLanguage('en');
  }
};

initializeI18n();

export default i18n;
