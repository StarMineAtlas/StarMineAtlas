"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Pickaxe, Menu, X } from "lucide-react"
import { ChevronDown } from "lucide-react"
import { useTranslation } from "react-i18next"
import { LanguageSelector } from "./LanguageSelector"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu"

export function Header() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Suppression de l'état openDropdown, retour au comportement par défaut

  const navLinks = [
    { href: "/", label: "header.rockTypes" },
    { href: "/market-price", label: "header.marketPrice" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/50 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Pickaxe className="h-6 w-6 text-cyan-400 transition-transform group-hover:rotate-12" />
          <span className="text-xl font-bold tracking-tight text-cyan-50">
            {t("header.siteName")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-6">
            {navLinks && navLinks.length > 0 && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-cyan-400 ${pathname === link.href ? "text-cyan-400" : "text-slate-400"
                  }`}
                suppressHydrationWarning
              >
                {t(link.label)}
              </Link>
            ))}
            {/* Dropdown Data */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center text-sm font-medium transition-colors hover:text-cyan-400 text-slate-400 px-2 py-1 rounded-md"
                    tabIndex={0}
                  >
                    {t("header.data")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/data/quality-distribution" className={pathname === "/data/quality-distribution" ? "text-cyan-400" : "text-slate-400"}>
                      {t("header.qualityDistribution")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/data/refinery-bonuses-table" className={pathname === "/data/refinery-bonuses-table" ? "text-cyan-400" : "text-slate-400"}>
                      {t("header.refineryBonusesTable")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/data/market-prices-table" className={pathname === "/data/market-prices-table" ? "text-cyan-400" : "text-slate-400"}>
                      {t("header.marketPricesTable")}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
          <LanguageSelector />
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-cyan-900/50 bg-slate-950/95 backdrop-blur-md md:hidden">
          <nav className="flex flex-col px-4 py-4">
            {navLinks && navLinks.length > 0 && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-slate-800 hover:text-cyan-400 ${pathname === link.href ? "text-cyan-400" : "text-slate-400"
                  }`}
                suppressHydrationWarning
              >
                {t(link.label)}
              </Link>
            ))}
            {/* Dropdown Data for mobile */}
            <div className="mt-2">
              <span className="text-base font-medium text-slate-400 mb-1">{t("header.data")}</span>
              <Link href="/quality-distribution" onClick={() => setMobileMenuOpen(false)} className={`rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-slate-800 hover:text-cyan-400 ${pathname === "/quality-distribution" ? "text-cyan-400" : "text-slate-400"}`}>{t("header.qualityDistribution")}</Link>
              <Link href="/refinery-bonuses-table" onClick={() => setMobileMenuOpen(false)} className={`rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-slate-800 hover:text-cyan-400 ${pathname === "/refinery-bonuses-table" ? "text-cyan-400" : "text-slate-400"}`}>{t("header.refineryBonusesTable")}</Link>
              <Link href="/market-prices-table" onClick={() => setMobileMenuOpen(false)} className={`rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-slate-800 hover:text-cyan-400 ${pathname === "/market-prices-table" ? "text-cyan-400" : "text-slate-400"}`}>{t("header.marketPricesTable")}</Link>
            </div>
          </nav>
          <div className="border-t border-cyan-900/50 px-4 py-4">
            <LanguageSelector />
          </div>
        </div>
      )}
    </header>
  )
}
