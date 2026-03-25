"use client"

import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-endpoints"
import { ChevronDown, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { LanguageSelector } from "./LanguageSelector"

const getConfig = async () => {
  if (typeof window === "undefined") return null;
  const config = localStorage.getItem("star-mine-atlas-config");
  // need to update config after this time (in minutes)
  const needToUpdateAfter = 30;
  let parsedConfig = null;
  if (config) {
    parsedConfig = JSON.parse(config);
  }
  if (!config || !parsedConfig?.lastUpdate || (Date.now() - parsedConfig.lastUpdate) > needToUpdateAfter * 60 * 1000) {
    fetch(API_BASE_URL + API_ENDPOINTS.config)
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((item: { name: string; value: string }) => ({ [item.name]: item.value })).reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {});
        const newConfig = { ...parsedConfig, ...formattedData, lastUpdate: Date.now() };
        localStorage.setItem("star-mine-atlas-config", JSON.stringify(newConfig));
      })
      .catch((err) => {
        console.error("Error fetching config:", err);
      });
  }
}

export function Header() {
  const navLinks = [
    { href: "/", label: "header.findMinerals" },
  ]

  const calculatorsLinks = [
    { href: "/calculators/work-order", label: "header.calculators.workOrder" },
    { href: "/calculators/mining-profit", label: "header.calculators.miningProfit" },
    { href: "/calculators/loadout", label: "header.calculators.loadout" },
  ]

  const dataLinks = [
    { href: "/data/refinery", label: "header.data.refinery" },
    { href: "/data/market-prices", label: "header.data.marketPrices" },
    { href: "/data/mining-lasers", label: "header.data.miningLasers" },
    { href: "/data/modules-gadgets", label: "header.data.modulesGadgets" },
  ]

  const { t } = useTranslation()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [showData, setShowData] = useState(false);

  const [dataLinksState, setDataLinksState] = useState(dataLinks);

  useEffect(() => {
    getConfig().then(() => {
      const configStr = localStorage.getItem("star-mine-atlas-config");
      if (configStr) {
        const config: { showData: string } = JSON.parse(configStr);
        const showDataValue = config.showData.toLowerCase() === "true";
        setShowData(showDataValue);
        if (showDataValue) {
          dataLinks.unshift(
            { href: "/data/quality-distribution", label: "header.qualityDistribution" },
          )
        }
        setDataLinksState([...dataLinks])
      }
    });
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/50 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/sma-logo.png"
            alt={t("header.siteName")}
            className="h-[40px] w-auto my-auto transition-transform group-hover:scale-110"
          />
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
            {/* Dropdown Calculators */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center text-sm font-medium transition-colors hover:text-cyan-400 text-slate-400 px-2 py-1 rounded-md"
                    tabIndex={0}
                    suppressHydrationWarning
                  >
                    {t("header.calculators.title")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border border-cyan-900/50 shadow-lg rounded-md min-w-[200px]">
                  {calculatorsLinks.map((link) => (
                    <DropdownMenuItem
                      asChild
                      key={link.href}
                      className="hover:bg-cyan-900/30 focus:bg-cyan-900/40 rounded transition-colors p-0"
                    >
                      <Link
                        href={link.href}
                        className={pathname === link.href ? "text-cyan-400" : "text-slate-300"}
                        suppressHydrationWarning
                      >
                        <span className="hover:text-white w-full p-2">{t(link.label)}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Dropdown Data */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center text-sm font-medium transition-colors hover:text-cyan-400 text-slate-400 px-2 py-1 rounded-md"
                    tabIndex={0}
                    suppressHydrationWarning
                  >
                    {t("header.data.title")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border border-cyan-900/50 shadow-lg rounded-md min-w-[200px]">
                  {dataLinksState.map((link) => (
                    <DropdownMenuItem
                      asChild
                      key={link.href}
                      className="hover:bg-cyan-900/30 focus:bg-cyan-900/40 rounded transition-colors p-0"
                    >
                      <Link
                        href={link.href}
                        className={pathname === link.href ? "text-cyan-400" : "text-slate-300"}
                        suppressHydrationWarning
                      >
                        <span className="hover:text-white w-full p-2">{t(link.label)}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
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
            {/* Dropdowns for mobile */}
            <div className="mb-2 flex flex-col">
              <span className="text-base font-medium text-slate-500 border-b border-slate-700 pb-2 mb-1 mt-4">{t("header.calculators.title")}</span>
              {
                calculatorsLinks.map((link) => (
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
                ))
              }
              <span className="text-base font-medium text-slate-500 border-b border-slate-700 pb-2 mb-1 mt-4">{t("header.data.title")}</span>
              {
                dataLinksState.map((link) => (
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
                ))
              }
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
