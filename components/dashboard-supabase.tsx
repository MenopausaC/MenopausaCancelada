"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  RefreshCw,
  Plus,
  Eye,
  CheckCircle,
  Database,
  WifiOff,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react"
import { buscarMetricas, criarLeadTeste, limparDadosTeste, testSupabaseConnection } from "@/lib/supabase"

export default function DashboardSupabase() {
  const [data, setData] = useState({
    totalViews: 0,
    totalLeads: 0,
    totalConversoes: 0,
    taxaConversao: "0",
    taxaConversaoReal: "0",
    receitaTotal: "0",
    tempoMedioConversao: "0",
    leads: [],
    conversoes: [],
    variantesViews: {},
    variantesLeads: {},
    variantesQualificacao: {},
    variantesConversao: {},
    mode: "loading",
  })
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({
    status: "checking",
    message: "Verificando conexão...",
  })

  const testConnection = async () => {
    try {
      const result = await testSupabaseConnection()
      setConnectionStatus({
        status: result.status,
        message: result.message,
      })
      console.log("Teste de conexão:", result)
      return result.success
    } catch (error) {
      console.error("Erro ao testar conexão:", error)
      setConnectionStatus({
        status: "exception",
        message: `Erro ao testar conexão: ${error.message}`,
      })
      return false
    }
  }

  const loadData = async () => {
    setLoading(true)
    console.log("📊 Carregando dados do Supabase...")

    try {
      // Primeiro testar a conexão
      const connected = await testConnection()

      if (!connected) {
        console.log("Conexão falhou, usando dados locais")
        setLoading(false)
        return
      }

      const metricas = await buscarMetricas()
      setData(metricas)
      console.log("✅ Dados carregados:", metricas)
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error)
      setConnectionStatus({
        status: "error",
        message: `Erro ao carregar dados: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Carregar dados iniciais
    loadData()

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleCreateTest = async () => {
    setLoading(true)
    try {
      await criarLeadTeste()
      setTimeout(loadData, 1000) // Recarregar após criar teste
    } catch (error) {
      console.error("❌ Erro ao criar teste:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    setLoading(true)
    try {
      await limparDadosTeste()
      setTimeout(loadData, 1000) // Recarregar após limpar
    } catch (error) {
      console.error("❌ Erro ao limpar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const getModeIcon = () => {
    switch (connectionStatus.status) {
      case "connected":
        return <Database className="w-4 h-4 text-green-600" />
      case "checking":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case "not_configured":
        return <WifiOff className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
  }

  const getModeText = () => {
    return connectionStatus.message
  }

  const getQualificacaoBadge = (categoria: string) => {
    switch (categoria) {
      case "QUENTE":
        return "bg-red-100 text-red-800 border-red-200"
      case "MORNO":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "FRIO":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUrgenciaBadge = (urgencia: string) => {
    switch (urgencia) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200"
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "baixa":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPrioridadeColor = (prioridade: number) => {
    if (prioridade >= 4) return "text-red-600"
    if (prioridade >= 3) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Analytics Completo</h1>
            <div className="flex items-center gap-2 mt-2">
              {getModeIcon()}
              <p className="text-gray-600">{getModeText()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={loadData} disabled={loading} className="bg-purple-600">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <Button onClick={handleCreateTest} disabled={loading} className="bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Teste
            </Button>

            <Button onClick={handleClear} disabled={loading} variant="destructive">
              Limpar Testes
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Visualizações</p>
                  <h3 className="text-3xl font-bold text-purple-900">{data.totalViews}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Leads</p>
                  <h3 className="text-3xl font-bold text-green-900">{data.totalLeads}</h3>
                  <p className="text-xs text-gray-500">{data.taxaConversao}% conversão</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Vendas</p>
                  <h3 className="text-3xl font-bold text-blue-900">{data.totalConversoes}</h3>
                  <p className="text-xs text-gray-500">{data.taxaConversaoReal}% dos leads</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Receita</p>
                  <h3 className="text-2xl font-bold text-green-900">R$ {data.receitaTotal}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tempo Médio</p>
                  <h3 className="text-3xl font-bold text-orange-900">{data.tempoMedioConversao}h</h3>
                  <p className="text-xs text-gray-500">para conversão</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance por Variante com Qualificação */}
        {Object.keys(data.variantesViews).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Performance por Quiz (Variante)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Nome do Quiz</th>
                      <th className="text-center py-3 px-4 font-semibold">Views</th>
                      <th className="text-center py-3 px-4 font-semibold">Leads</th>
                      <th className="text-center py-3 px-4 font-semibold">Conversão</th>
                      <th className="text-center py-3 px-4 font-semibold">Qualificação</th>
                      <th className="text-center py-3 px-4 font-semibold">Urgência</th>
                      <th className="text-center py-3 px-4 font-semibold">Pontuação</th>
                      <th className="text-center py-3 px-4 font-semibold">Vendas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(data.variantesViews).map((nomeQuiz) => {
                      const views = data.variantesViews[nomeQuiz] || 0
                      const leads = data.variantesLeads[nomeQuiz] || 0
                      const conversao = views > 0 ? ((leads / views) * 100).toFixed(1) : "0"
                      const qual = data.variantesQualificacao[nomeQuiz] || {}
                      const conv = data.variantesConversao[nomeQuiz] || { conversoes: 0, receita: 0 }

                      return (
                        <tr key={nomeQuiz} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-purple-800">{nomeQuiz}</div>
                          </td>
                          <td className="text-center py-3 px-4">{views}</td>
                          <td className="text-center py-3 px-4">{leads}</td>
                          <td className="text-center py-3 px-4">
                            <Badge variant={Number.parseFloat(conversao) > 10 ? "default" : "secondary"}>
                              {conversao}%
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex gap-1 justify-center">
                                <Badge className="bg-red-100 text-red-800 text-xs">🔥 {qual.quentes || 0}</Badge>
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">🟡 {qual.mornos || 0}</Badge>
                                <Badge className="bg-blue-100 text-blue-800 text-xs">❄️ {qual.frios || 0}</Badge>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-red-100 text-red-800 text-xs">⚡ {qual.urgentes || 0}</Badge>
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                ⭐ {qual.prioridadeAlta || 0}
                              </Badge>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="font-mono text-sm">{qual.pontuacaoMedia || 0}</div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-green-100 text-green-800 text-xs">💰 {conv.conversoes}</Badge>
                              <div className="text-xs text-gray-500">R$ {conv.receita?.toFixed(0) || 0}</div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Leads com Qualificação Completa */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Qualificados ({data.totalLeads})</CardTitle>
          </CardHeader>
          <CardContent>
            {data.leads && data.leads.length > 0 ? (
              <div className="space-y-4">
                {data.leads.slice(0, 20).map((lead: any) => (
                  <div key={lead.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{lead.nome}</h3>
                        <p className="text-gray-600">
                          {lead.email} | {lead.telefone} | {lead.idade} anos
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getQualificacaoBadge(lead.categoria_lead)}>
                          {lead.categoria_lead || "N/A"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{new Date(lead.criado_em).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>

                    {/* Dados de Qualificação */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Quiz</p>
                        <p className="font-medium text-sm">{lead.versao_questionario || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pontuação</p>
                        <p className="font-bold text-lg">{lead.pontuacao_total || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Urgência</p>
                        <Badge className={getUrgenciaBadge(lead.urgencia)} size="sm">
                          {lead.urgencia || "N/A"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Prioridade</p>
                        <p className={`font-bold text-lg ${getPrioridadeColor(lead.prioridade || 1)}`}>
                          {lead.prioridade || 1}/5
                        </p>
                      </div>
                    </div>

                    {/* Sintomas Identificados */}
                    {lead.sintomas_identificados && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Sintomas Identificados:</p>
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(lead.sintomas_identificados).map((sintoma: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {sintoma.nome || sintoma}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Motivos de Qualificação */}
                    {lead.motivos_qualificacao && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Motivos:</p>
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(lead.motivos_qualificacao).map((motivo: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {motivo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status de Conversão */}
                    {lead.converteu && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-800 font-medium">Converteu - R$ {lead.valor_conversao || 0}</span>
                          {lead.data_conversao && (
                            <span className="text-green-600 text-xs">
                              em {new Date(lead.data_conversao).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum lead ainda</h3>
                <p className="text-gray-500 mb-4">Os leads aparecerão aqui quando forem registrados</p>
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
