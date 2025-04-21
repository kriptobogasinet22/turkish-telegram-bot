"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"

export default function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-bold">Telegram Bot Admin</h2>
          <nav className="hidden md:flex space-x-4">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md ${pathname === "/dashboard" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
            >
              İşlemler
            </Link>
            <Link
              href="/dashboard/rates"
              className={`px-3 py-2 rounded-md ${pathname === "/dashboard/rates" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
            >
              Dönüşüm Oranları
            </Link>
          </nav>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Çıkış Yap
        </Button>
      </div>
    </header>
  )
}
