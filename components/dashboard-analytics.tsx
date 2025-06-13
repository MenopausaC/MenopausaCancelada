"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Plus, Eye, CheckCircle, BarChart3 } from "lucide-react"
import { createTestLead, clearData } from "@/lib/analytics"

export default function DashboardAnalytics() {
  const [data, setData] = useState({ views: 0, completions: 0, leads: [] })
  const [loading, setLoading] = useState(false)

  const loadData = () => {
    setLoading(true)
    console.log("📊 Carregando dados...")

    try {
      // Carregar diretamente do localStorage para garantir dados atualizados
      const dataString = localStorage.getItem("menopausa_data")
      if (dataString) {
        const analytics = JSON.parse(dataString)
        setData(analytics)
        console.log("✅ Dados carregados:", analytics)
      } else {
        console.log("⚠️ Nenhum dado encontrado no localStorage")
        setData({ views: 0, completions: 0, leads: [] })
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Carregar dados iniciais
    loadData()

    // Escutar atualizações
    const handleUpdate = (e: any) => {
      console.log("📡 Dados atualizados:", e.detail)
      setData(e.detail)
    }

    window.addEventListener("analytics-update", handleUpdate)

    // Atualizar a cada 3 segundos
    const interval = setInterval(loadData, 3000)

    return () => {
      window.removeEventListener("analytics-update", handleUpdate)
      clearInterval(interval)
    }
  }, [])

  const handleCreateTest = () => {
    createTestLead()
    setTimeout(loadData, 500) // Recarregar após criar teste
  }

  const handleClear = () => {
    clearData()
    setTimeout(loadData, 500) // Recarregar após limpar
  }

  const conversionRate = data.views > 0 ? ((data.completions / data.views) * 100).toFixed(1) : "0"

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Dashboard Analytics</h1>
            <p className="text-gray-600">Sistema SIMPLES que FUNCIONA!</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={loadData} disabled={loading} className="bg-purple-600">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <Button onClick={handleCreateTest} className="bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Teste
            </Button>

            <Button onClick={handleClear} variant="destructive">
              Limpar
            </Button>
          </div>
        </div>

        {/* Status GRANDE */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📊 STATUS ATUAL</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-900">{data.views}</div>
              <div className="text-blue-700">VIEWS</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-900">{data.completions}</div>
              <div className="text-green-700">LEADS</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-900">{conversionRate}%</div>
              <div className="text-purple-700">CONVERSÃO</div>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Visualizações</p>
                  <h3 className="text-4xl font-bold text-purple-900">{data.views}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Leads</p>
                  <h3 className="text-4xl font-bold text-green-900">{data.completions}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
                  <h3 className="text-4xl font-bold text-blue-900">{conversionRate}%</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Registrados ({data.leads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {data.leads.length > 0 ? (
              <div className="space-y-4">
                {data.leads.map((lead: any) => (
                  <div key={lead.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{lead.nome}</h3>
                        <p className="text-gray-600">
                          {lead.email} | {lead.telefone}
                        </p>
                        <p className="text-sm text-gray-500">Idade: {lead.idade}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-purple-100 text-purple-800">{lead.categoria}</Badge>
                        <p className="text-xs text-gray-500 mt-1">{new Date(lead.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum lead ainda</h3>
                <p className="text-gray-500 mb-4">Clique em "Criar Teste" para testar o sistema</p>
                <Button onClick={handleCreateTest} className="bg-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Lead de Teste
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
