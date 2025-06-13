"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, AlertTriangle, Smartphone, Monitor, Tablet, RefreshCw, Award } from "lucide-react"

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase = null
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

interface QuizData {
  id: string
  nome: string
  email: string
  telefone?: string
  idade?: number
  categoria_sintomas?: string
  pontuacao_total?: number
  urgencia?: string
  expectativa_melhora?: string
  score_qualificacao?: number
  categoria_lead?: string
  classificacao_final?: string // Nova propriedade
  prioridade?: number
  motivos_qualificacao?: string
  sintomas_identificados?: any
  respostas_detalhadas?: any
  tempo_total_questionario?: number
  tempo_medio_resposta?: number
  voltas_perguntas?: number
  engajamento?: string
  dispositivo?: string
  sistema_operacional?: string
  navegador?: string
  origem?: string
  versao_questionario?: string
  criado_em?: string
}

export default function DashboardQuizPage() {
  const [dados, setDados] = useState<QuizData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    quentes: 0,
    mornos: 0,
    frios: 0,
    urgentes: 0,
    tempoMedio: 0,
    classificacaoAAA: 0, // Novas estatísticas
    classificacaoAA: 0,
    classificacaoA: 0,
    classificacaoB: 0,
  })

  const carregarDados = async () => {
    if (!supabase) {
      setError("Supabase não configurado")
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Buscar dados da tabela QUIZ DASHBOARD
      const { data, error } = await supabase
        .from("QUIZ_DASHBOARD") // Certifique-se que o nome da tabela está correto (QUIZ_DASHBOARD)
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(100)

      if (error) {
        throw error
      }

      setDados(data || [])

      // Calcular estatísticas
      const total = data?.length || 0
      const quentes = data?.filter((d) => d.categoria_lead === "QUENTE").length || 0
      const mornos = data?.filter((d) => d.categoria_lead === "MORNO").length || 0
      const frios = data?.filter((d) => d.categoria_lead === "FRIO").length || 0
      const urgentes = data?.filter((d) => d.urgencia === "alta").length || 0
      const tempoMedio = data?.reduce((acc, d) => acc + (d.tempo_total_questionario || 0), 0) / total || 0

      const classificacaoAAA = data?.filter((d) => d.classificacao_final === "AAA").length || 0
      const classificacaoAA = data?.filter((d) => d.classificacao_final === "AA").length || 0
      const classificacaoA = data?.filter((d) => d.classificacao_final === "A").length || 0
      const classificacaoB = data?.filter((d) => d.classificacao_final === "B").length || 0

      setStats({
        total,
        quentes,
        mornos,
        frios,
        urgentes,
        tempoMedio: Math.round(tempoMedio / 1000), // converter para segundos
        classificacaoAAA,
        classificacaoAA,
        classificacaoA,
        classificacaoB,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const getLeadBadgeColor = (classificacao: string) => {
    switch (classificacao) {
      case "AAA":
        return "bg-red-100 text-red-800"
      case "AA":
        return "bg-orange-100 text-orange-800"
      case "A":
        return "bg-yellow-100 text-yellow-800"
      case "B":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgenciaBadgeColor = (urgencia: string) => {
    switch (urgencia) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "baixa":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDispositivoIcon = (dispositivo: string) => {
    switch (dispositivo) {
      case "Mobile":
        return <Smartphone className="w-4 h-4" />
      case "Tablet":
        return <Tablet className="w-4 h-4" />
      case "Desktop":
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">Supabase não configurado</h2>
              <p className="text-yellow-700">
                Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Quiz Menopausa</h1>
            <p className="text-gray-600">Dados da tabela QUIZ DASHBOARD</p>
          </div>
          <Button onClick={carregarDados} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Classificação AAA</p>
                  <p className="text-2xl font-bold text-red-600">{stats.classificacaoAAA}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Classificação AA</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.classificacaoAA}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Classificação A</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.classificacaoA}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Classificação B</p>
                  <p className="text-2xl font-bold text-green-600">{stats.classificacaoB}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.tempoMedio}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Erro */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">Erro: {error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Carregando dados...</p>
            </CardContent>
          </Card>
        )}

        {/* Tabela de dados */}
        {!loading && dados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Leads Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Classificação</th> {/* Alterado para Classificação */}
                      <th className="text-left p-2">Urgência</th>
                      <th className="text-left p-2">Pontuação</th>
                      <th className="text-left p-2">Dispositivo</th>
                      <th className="text-left p-2">Versão</th>
                      <th className="text-left p-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{item.nome}</td>
                        <td className="p-2 text-gray-600">{item.email}</td>
                        <td className="p-2">
                          <Badge className={getLeadBadgeColor(item.classificacao_final || "")}>
                            {item.classificacao_final || "N/A"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={getUrgenciaBadgeColor(item.urgencia || "")}>{item.urgencia || "N/A"}</Badge>
                        </td>
                        <td className="p-2 font-mono">{item.pontuacao_total || 0}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-1">
                            {getDispositivoIcon(item.dispositivo || "")}
                            <span className="text-xs">{item.dispositivo}</span>
                          </div>
                        </td>
                        <td className="p-2 text-xs text-gray-500">{item.versao_questionario}</td>
                        <td className="p-2 text-xs text-gray-500">
                          {item.criado_em ? new Date(item.criado_em).toLocaleDateString("pt-BR") : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sem dados */}
        {!loading && dados.length === 0 && !error && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum dado encontrado</h3>
              <p className="text-gray-500">A tabela QUIZ DASHBOARD está vazia.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
