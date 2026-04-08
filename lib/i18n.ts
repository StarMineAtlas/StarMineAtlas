import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import en from "@/locales/en.json"
import fr from "@/locales/fr.json"

export const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
] as const

export type LanguageCode = (typeof languages)[number]["code"]

const resources = {
  en: { translation: en },
  fr: { translation: fr },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: "sma-language",
      caches: ["localStorage"],
    },
  })

export default i18n
