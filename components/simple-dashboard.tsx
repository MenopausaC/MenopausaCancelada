"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Plus, Eye, CheckCircle, BarChart3, Trash2 } from "lucide-react"

export default function SimpleDashboard() {
  const [data, setData] = useState({ views: 0, completions: 0, leads: [] })
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  // Garantir que o componente só renderize no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  const loadData = () => {
    // Só executar se estiver no cliente
    if (!mounted || typeof window === "undefined") {
      return
    }

    setLoading(true)
    setError("")
    console.log("📊 Carregando dados do localStorage...")

    try {
      // Verificar se localStorage está disponível
      if (!window.localStorage) {
        throw new Error("localStorage não disponível")
      }

      // 1. Carregar dados principais
      const mainData = localStorage.getItem("menopausa_data")
      let analytics = { views: 0, completions: 0, leads: [] }

      if (mainData) {
        try {
          analytics = JSON.parse(mainData)
          console.log("✅ Dados principais carregados:", analytics)
        } catch (e) {
          console.error("❌ Erro ao parsear dados principais:", e)
        }
      }

      // 2. Carregar dados de backup se principais estiverem vazios
      if (analytics.leads.length === 0) {
        const backupData = localStorage.getItem("menopausa_data_backup")
        if (backupData) {
          try {
            const backup = JSON.parse(backupData)
            if (backup.leads && backup.leads.length > 0) {
              analytics = backup
              console.log("✅ Dados de backup carregados:", analytics)
            }
          } catch (e) {
            console.error("❌ Erro ao parsear backup:", e)
          }
        }
      }

      // 3. Carregar leads de backup se ainda estiver vazio
      if (analytics.leads.length === 0) {
        const backupLeads = localStorage.getItem("menopausa_backup_leads")
        if (backupLeads) {
          try {
            const leads = JSON.parse(backupLeads)
            if (leads.length > 0) {
              analytics.leads = leads
              analytics.completions = leads.length
              console.log("✅ Leads de backup carregados:", leads.length)
            }
          } catch (e) {
            console.error("❌ Erro ao parsear leads de backup:", e)
          }
        }
      }

      // 4. Carregar dados de emergência
      if (analytics.leads.length === 0) {
        const emergencyLeads = localStorage.getItem("emergency_leads")
        if (emergencyLeads) {
          try {
            const leads = JSON.parse(emergencyLeads)
            if (leads.length > 0) {
              analytics.leads = leads
              analytics.completions = leads.length
              console.log("✅ Leads de emergência carregados:", leads.length)
            }
          } catch (e) {
            console.error("❌ Erro ao parsear leads de emergência:", e)
          }
        }
      }

      // 5. Carregar dados do tracking system
      const trackingEvents = localStorage.getItem("quiz_tracking_events")
      if (trackingEvents) {
        try {
          const events = JSON.parse(trackingEvents)
          const views = events.filter((e) => e.type === "session_start").length
          const completions = events.filter((e) => e.type === "quiz_completed").length

          // Se o tracking tem mais dados, usar eles
          if (views > analytics.views) {
            analytics.views = views
          }
          if (completions > analytics.completions) {
            analytics.completions = completions
          }

          // Extrair leads do tracking se não temos leads
          if (analytics.leads.length === 0 && completions > 0) {
            const trackingLeads = events
              .filter((e) => e.type === "quiz_completed")
              .map((e, index) => ({
                id: Date.now() + index,
                nome: e.data?.dadosContato?.nome || "Nome não informado",
                email: e.data?.dadosContato?.email || "Email não informado",
                telefone: e.data?.dadosContato?.telefone || "Telefone não informado",
                idade: e.data?.dadosContato?.idade || "N/A",
                categoria: e.data?.analise?.categoria || "Sem categoria",
                timestamp: e.timestamp || new Date().toISOString(),
                variante: e.variante || "default",
              }))

            analytics.leads = trackingLeads
            console.log("✅ Leads extraídos do tracking:", trackingLeads.length)
          }
        } catch (e) {
          console.error("❌ Erro ao processar tracking events:", e)
        }
      }

      // Atualizar estado
      setData(analytics)
      setLastUpdate(new Date().toLocaleTimeString())

      console.log("📊 Dados finais carregados:", analytics)
    } catch (error) {
      console.error("❌ Erro geral ao carregar dados:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createTestLead = () => {
    if (!mounted || typeof window === "undefined") {
      return
    }

    const testLead = {
      id: Date.now(),
      nome: `Teste ${Date.now()}`,
      email: `teste${Date.now()}@email.com`,
      telefone: "11999999999",
      idade: "45",
      categoria: "Teste",
      timestamp: new Date().toISOString(),
      variante: "testbx9",
    }

    try {
      // 1. Atualizar dados principais
      const currentData = localStorage.getItem("menopausa_data")
      let analytics = { views: 0, completions: 0, leads: [] }

      if (currentData) {
        analytics = JSON.parse(currentData)
      }

      analytics.completions++
      analytics.leads.push(testLead)

      // Salvar em múltiplos locais
      localStorage.setItem("menopausa_data", JSON.stringify(analytics))
      localStorage.setItem("menopausa_data_backup", JSON.stringify(analytics))

      // 2. Salvar no backup de leads
      const backupLeads = JSON.parse(localStorage.getItem("menopausa_backup_leads") || "[]")
      backupLeads.push(testLead)
      localStorage.setItem("menopausa_backup_leads", JSON.stringify(backupLeads))

      // 3. Salvar no tracking system
      const trackingEvents = JSON.parse(localStorage.getItem("quiz_tracking_events") || "[]")
      trackingEvents.push({
        id: Date.now(),
        type: "quiz_completed",
        timestamp: new Date().toISOString(),
        variante: "testbx9",
        data: {
          dadosContato: {
            nome: testLead.nome,
            email: testLead.email,
            telefone: testLead.telefone,
            idade: testLead.idade,
          },
          analise: {
            categoria: testLead.categoria,
          },
        },
      })
      localStorage.setItem("quiz_tracking_events", JSON.stringify(trackingEvents))

      console.log("✅ Lead de teste criado com sucesso:", testLead)

      // Recarregar dados
      setTimeout(loadData, 500)
    } catch (error) {
      console.error("❌ Erro ao criar lead de teste:", error)
    }
  }

  const clearAllData = () => {
    if (!mounted || typeof window === "undefined") {
      return
    }

    if (confirm("Tem certeza que deseja limpar todos os dados?")) {
      localStorage.removeItem("menopausa_data")
      localStorage.removeItem("menopausa_data_backup")
      localStorage.removeItem("menopausa_backup_leads")
      localStorage.removeItem("emergency_leads")
      localStorage.removeItem("quiz_tracking_events")
      localStorage.removeItem("menopausa_variants")

      setData({ views: 0, completions: 0, leads: [] })
      console.log("🧹 Todos os dados foram limpos")
    }
  }

  useEffect(() => {
    if (mounted) {
      // Carregar dados iniciais
      loadData()

      // Atualizar a cada 5 segundos
      const interval = setInterval(loadData, 5000)

      return () => clearInterval(interval)
    }
  }, [mounted])

  // Não renderizar nada até estar montado no cliente
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const conversionRate = data.views > 0 ? ((data.completions / data.views) * 100).toFixed(1) : "0"

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Dashboard Simples</h1>
            <p className="text-gray-600">Sistema direto de métricas - Última atualização: {lastUpdate}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={loadData} disabled={loading} className="bg-purple-600">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <Button onClick={createTestLead} className="bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Teste
            </Button>

            <Button onClick={clearAllData} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Status GRANDE */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📊 STATUS ATUAL</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-900">{data.views}</div>
              <div className="text-blue-700">VIEWS</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-900">{data.completions}</div>
              <div className="text-green-700">LEADS</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-900">{conversionRate}%</div>
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

        {/* Debug Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>localStorage menopausa_data:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
                  {(typeof window !== "undefined" && localStorage.getItem("menopausa_data")) || "Vazio"}
                </pre>
              </div>
              <div>
                <strong>localStorage backup_leads:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
                  {(typeof window !== "undefined" && localStorage.getItem("menopausa_backup_leads")) || "Vazio"}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

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
                        {lead.variante && <p className="text-xs text-blue-500">Variante: {lead.variante}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum lead ainda</h3>
                <p className="text-gray-500 mb-4">Clique em "Criar Teste" para testar o sistema</p>
                <Button onClick={createTestLead} className="bg-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Lead de Teste
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        {error && <div className="text-red-500 mt-4">Erro: {error}</div>}
      </div>
    </div>
  )
}
