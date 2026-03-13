import Link from "next/link"
import { Pickaxe } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/50 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Pickaxe className="h-6 w-6 text-cyan-400 transition-transform group-hover:rotate-12" />
          <span className="text-xl font-bold tracking-tight text-cyan-50">
            Mining Atlas
          </span>
        </Link>
        <nav>
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
          >
            Rock Types
          </Link>
        </nav>
      </div>
    </header>
  )
}
