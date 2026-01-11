"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-foreground">
          TherapyAI
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm transition-colors",
              pathname === "/" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Upload
          </Link>
          <Link
            href="/sessions"
            className={cn(
              "text-sm transition-colors",
              pathname.startsWith("/sessions")
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Sessions
          </Link>
        </div>
      </div>
    </nav>
  )
}
