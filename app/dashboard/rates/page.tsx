import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import DashboardHeader from "@/components/dashboard-header"
import RatesTable from "@/components/rates-table"

export default async function Rates() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dönüşüm Oranları</h1>
        <RatesTable />
      </main>
    </div>
  )
}
