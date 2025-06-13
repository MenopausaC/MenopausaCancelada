import SupabaseStatus from "@/components/supabase-status"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TesteSupabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Teste de Conexão Supabase</h1>

        <SupabaseStatus />

        <div className="mt-6 space-y-4">
          <Link href="/dashboard-supabase" className="block">
            <Button className="w-full">Ver Dashboard Supabase</Button>
          </Link>

          <Link href="/teste-make" className="block">
            <Button variant="outline" className="w-full">
              Testar Webhook Make
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
