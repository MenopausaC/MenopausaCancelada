"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import QuizMenopausaVariantes from "@/components/quiz-menopausa-variantes"
import AdminDashboard from "@/components/admin-dashboard"
import ForceMetrics from "@/components/force-metrics"

export default function Home() {
  const searchParams = useSearchParams()
  const [showDashboard, setShowDashboard] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há parâmetro de variante na URL
    const variante = searchParams.get("variante")
    const admin = searchParams.get("admin")
    const direct = searchParams.get("direct")

    // Se tem parâmetro de variante ou direct=true, mostrar quiz diretamente
    if (variante || direct === "true") {
      setShowDashboard(false)
    } else if (admin === "false") {
      // Se admin=false, mostrar quiz
      setShowDashboard(false)
    } else {
      // Por padrão, mostrar dashboard
      setShowDashboard(true)
    }

    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ForceMetrics />
      {showDashboard ? <AdminDashboard /> : <QuizMenopausaVariantes />}
    </>
  )
}
