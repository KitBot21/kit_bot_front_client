import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ko from "./locales/ko.json";
import en from "./locales/en.json";

const LANGUAGE_KEY = "app_language";

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: "ko",
  fallbackLng: "ko",
  interpolation: {
    escapeValue: false,
  },
});

AsyncStorage.getItem(LANGUAGE_KEY).then((lang) => {
  console.log("🌐 저장된 언어:", lang);
  console.log("🌐 현재 i18n 언어:", i18n.language);

  if (lang && lang !== i18n.language) {
    i18n.changeLanguage(lang);
  }
});

export const setStoredLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);
  } catch (e) {
    console.error("언어 저장 실패:", e);
  }
};

export default i18n;
