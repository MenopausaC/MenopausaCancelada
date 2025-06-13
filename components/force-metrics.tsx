"use client"

import { useEffect, useState } from "react"
import { getAnalytics } from "@/lib/analytics"

// Componente que força a sincronização de métricas
function ForceMetrics() {
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncCount, setSyncCount] = useState(0)

  // Função para verificar e sincronizar dados - CORRIGIDA
  const syncData = () => {
    try {
      console.log("🔄 ForceMetrics: Iniciando sincronização...")

      // Obter dados atuais do analytics
      const data = getAnalytics()
      console.log("📊 ForceMetrics: Dados do analytics:", data)

      // Verificar localStorage diretamente
      const localData = localStorage.getItem("menopausa_data")
      console.log("📂 ForceMetrics: localStorage menopausa_data:", localData)

      const backupLeads = localStorage.getItem("menopausa_backup_leads")
      console.log("📂 ForceMetrics: localStorage backup_leads:", backupLeads)

      // Se não há dados no localStorage principal mas há no backup, restaurar
      if (!localData && backupLeads) {
        try {
          const leads = JSON.parse(backupLeads)
          if (leads.length > 0) {
            const restoredData = {
              views: 1, // Pelo menos 1 view se há leads
              completions: leads.length,
              leads: leads,
            }

            localStorage.setItem("menopausa_data", JSON.stringify(restoredData))
            console.log("🔄 ForceMetrics: Dados restaurados do backup:", restoredData)
          }
        } catch (e) {
          console.error("❌ ForceMetrics: Erro ao restaurar backup:", e)
        }
      }

      // Disparar eventos de atualização
      window.dispatchEvent(
        new CustomEvent("analytics-update", {
          detail: data,
        }),
      )

      window.dispatchEvent(
        new CustomEvent("menopausa-metrics-update", {
          detail: data,
        }),
      )

      // Atualizar estado
      setLastSync(new Date())
      setSyncCount((prev) => prev + 1)

      console.log("✅ ForceMetrics: Sincronização concluída")
    } catch (e) {
      console.error("❌ ForceMetrics: Erro ao sincronizar:", e)
    }
  }

  // Sincronizar dados periodicamente
  useEffect(() => {
    console.log("🔄 ForceMetrics: Componente montado, iniciando sincronização")

    // Sincronizar imediatamente
    syncData()

    // Configurar intervalo para sincronização mais frequente
    const intervalId = setInterval(syncData, 5000) // A cada 5 segundos

    // Adicionar listeners para eventos do localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes("menopausa")) {
        console.log("📡 ForceMetrics: Mudança detectada no localStorage:", e.key)
        setTimeout(syncData, 100) // Pequeno delay para garantir que os dados foram salvos
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Não renderiza nada visualmente
  return null
}

export { ForceMetrics }
export default ForceMetrics
