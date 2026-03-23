"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { languages, type LanguageCode } from "@/lib/i18n"
import { useTranslation } from "react-i18next"

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const handleLanguageChange = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem("mining-atlas-language", langCode)
  }

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0]

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-24 md:w-18 border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span className="flex md:hidden" suppressHydrationWarning>{currentLanguage.flag}</span>
            <span className="uppercase" suppressHydrationWarning>{currentLanguage.code}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-slate-800 bg-slate-900">
        {languages.map((lang) => (
          <SelectItem
            key={lang.code}
            value={lang.code}
            className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
          >
            <span className="flex items-center gap-2">
              <span className="flex md:hidden">{lang.flag}</span>
              <span className="uppercase">{lang.code}</span>
              <span className="text-slate-400 hidden md:flex">- {lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
