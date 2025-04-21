import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import LoginForm from "@/components/login-form"

export default async function Home() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Telegram Bot Admin Paneli</h1>
        <LoginForm />
      </div>
    </main>
  )
}
