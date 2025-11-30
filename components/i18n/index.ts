// components/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ko from "./locales/ko.json";
import en from "./locales/en.json";

const LANGUAGE_KEY = "app_language";

// 저장된 언어 불러오기
const getStoredLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return lang || "ko";
  } catch {
    return "ko";
  }
};

// 언어 저장하기
export const setStoredLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);
  } catch (e) {
    console.error("언어 저장 실패:", e);
  }
};

// 초기화
getStoredLanguage().then((lang) => {
  i18n.use(initReactI18next).init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    lng: lang,
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false,
    },
  });
});

export default i18n;
