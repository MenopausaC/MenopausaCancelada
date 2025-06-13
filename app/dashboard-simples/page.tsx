"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Importar o componente dinamicamente para evitar SSR
const SimpleDashboard = dynamic(() => import("@/components/simple-dashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando dashboard...</p>
      </div>
    </div>
  ),
})

const ForceMetrics = dynamic(() => import("@/components/force-metrics"), {
  ssr: false,
})

export default function DashboardSimplesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      }
    >
      <ForceMetrics />
      <SimpleDashboard />
    </Suspense>
  )
}
