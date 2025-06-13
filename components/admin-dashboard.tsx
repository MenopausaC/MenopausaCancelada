"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  BarChart3,
  Settings,
  Eye,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Layers,
  Clipboard,
  CheckCheck,
  Home,
  Utensils,
  Leaf,
  Plus,
  Download,
  Trash2,
  Database,
} from "lucide-react"

import { buscarMetricas, criarLeadTeste, limparDadosTeste, getSupabaseStatus } from "@/lib/supabase"

// Tipos e interfaces
interface VarianteConfig {
  id: string
  nome: string
  descricao: string
  status: "ativo" | "inativo" | "teste"
  features: string[]
  cor: string
  estatisticas?: {
    visualizacoes: number
    conclusoes: number
    taxaConclusao: number
    tempoMedio: number
  }
}

// Configurações das variantes atualizadas para nutrição
const VARIANTES: VarianteConfig[] = [
  {
    id: "testbx4",
    nome: "Base Completa",
    descricao: "Versão Base com Avaliação Nutricional Completa",
    status: "ativo",
    features: [
      "Avaliação nutricional completa para menopausa",
      "Sistema de tracking integrado",
      "Integração com Supabase",
      "Foco em alimentação natural",
    ],
    cor: "bg-blue-500",
  },
  {
    id: "testbx5",
    nome: "Com Agendamento",
    descricao: "Versão com Botão para Consulta Nutricional",
    status: "ativo",
    features: [
      "Botão direcionando para consulta nutricional",
      "Valor fixo de R$197 para consulta",
      "Foco em tratamento sem remédios",
      "Otimização do fluxo de conversão",
    ],
    cor: "bg-green-500",
  },
  {
    id: "testbx6",
    nome: "Com Depoimentos",
    descricao: "Versão com Depoimentos de Transformação",
    status: "ativo",
    features: [
      "Depoimentos de transformação nutricional",
      "Troca automática de depoimentos a cada 5 segundos",
      "Histórias de sucesso sem medicamentos",
      "Design com foco em resultados naturais",
    ],
    cor: "bg-purple-500",
  },
  {
    id: "testbx7",
    nome: "Texto Alterado",
    descricao: "Versão com Foco em Nutrição Natural",
    status: "ativo",
    features: [
      "Ênfase em 'Avaliação Nutricional'",
      "Destaque para tratamento sem hormônios",
      "Copy otimizado para nutrição natural",
      "Messaging focado em alimentação",
    ],
    cor: "bg-orange-500",
  },
  {
    id: "testbx8",
    nome: "Botões Continuar",
    descricao: "Versão com Navegação Otimizada",
    status: "ativo",
    features: [
      'Botões "Continuar" visíveis em todas as perguntas',
      'Mantém "Obter Avaliação Nutricional" na última pergunta',
      "Fluxo de navegação mais claro",
      "Redução de abandono no formulário",
    ],
    cor: "bg-pink-500",
  },
  {
    id: "testbx9",
    nome: "Efeitos Visuais",
    descricao: "Versão com Experiência Visual Completa",
    status: "ativo",
    features: [
      'Efeito fade/pulse na badge "Avaliação Nutricional Gratuita"',
      "Animação sutil com glow effect verde",
      "Todas as funcionalidades das versões anteriores",
      "Experiência visual focada em saúde natural",
    ],
    cor: "bg-indigo-500",
  },
]

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("variantes")
  const [variantesData, setVariantesData] = useState<VarianteConfig[]>(VARIANTES)
  const [loading, setLoading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo" | "teste">("todos")
  const [metricas, setMetricas] = useState({
    totalViews: 0,
    totalLeads: 0,
    leads: [],
    variantesViews: {},
    variantesLeads: {},
    taxaConversao: "0",
    mode: "local",
  })
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [searchTermAnalytics, setSearchTermAnalytics] = useState("")
  const [supabaseStatus, setSupabaseStatus] = useState(getSupabaseStatus())

  // Autenticação simples
  const handleLogin = () => {
    if (username === "admin" && password === "menopausa2024") {
      setAuthenticated(true)
      setTimeout(() => {
        loadDashboardData()
      }, 100)
    } else {
      alert("Credenciais inválidas!")
    }
  }

  // Carregar dados do dashboard usando Supabase ou localStorage
  const loadDashboardData = async () => {
    setLoading(true)

    try {
      console.log("📊 Carregando dados...")

      // Atualizar status do Supabase
      setSupabaseStatus(getSupabaseStatus())

      // Buscar métricas (Supabase ou localStorage)
      const metricasData = await buscarMetricas()
      setMetricas(metricasData)

      // Atualizar estatísticas das variantes
      const updatedVariantes = [...variantesData]
      updatedVariantes.forEach((variante) => {
        const views = metricasData.variantesViews[variante.id] || 0
        const leads = metricasData.variantesLeads[variante.id] || 0

        variante.estatisticas = {
          visualizacoes: views,
          conclusoes: leads,
          taxaConclusao: views > 0 ? (leads / views) * 100 : 0,
          tempoMedio: 120, // Valor fixo por enquanto
        }
      })

      setVariantesData(updatedVariantes)
      setLastUpdate(new Date())

      console.log("✅ Dados carregados:", metricasData)
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  // Criar lead de teste
  const handleCreateTestLead = async () => {
    try {
      setLoading(true)
      const lead = await criarLeadTeste()
      if (lead) {
        alert("Lead de teste criado com sucesso!")
        await loadDashboardData()
      } else {
        alert("Erro ao criar lead de teste.")
      }
    } catch (e) {
      console.error("Erro ao criar lead:", e)
      alert("Erro ao criar lead de teste: " + e)
    } finally {
      setLoading(false)
    }
  }

  // Limpar dados
  const handleClearAnalyticsData = async () => {
    if (confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      try {
        setLoading(true)
        const success = await limparDadosTeste()
        if (success) {
          await loadDashboardData()
          alert("Todos os dados foram limpos!")
        } else {
          alert("Erro ao limpar dados.")
        }
      } catch (e) {
        console.error("Erro ao limpar dados:", e)
        alert("Erro ao limpar dados: " + e)
      } finally {
        setLoading(false)
      }
    }
  }

  // Exportar dados
  const handleExportData = () => {
    try {
      const exportData = {
        metricas: metricas,
        timestamp: new Date().toISOString(),
      }

      const jsonData = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `menopausa-analytics-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      alert(`Erro ao exportar dados: ${error}`)
    }
  }

  // Abrir variante em nova aba
  const abrirVariante = (varianteId: string) => {
    const url = `/?variante=${varianteId}&direct=true`
    window.open(url, "_blank")
  }

  // Abrir variante na mesma aba
  const irParaVariante = (varianteId: string) => {
    window.location.href = `/?variante=${varianteId}&direct=true`
  }

  // Copiar URL para clipboard
  const copiarUrl = (varianteId: string) => {
    const url = `${window.location.origin}/?variante=${varianteId}&direct=true`
    navigator.clipboard.writeText(url)
    setCopiedUrl(varianteId)
    setTimeout(() => setCopiedUrl(""), 2000)
  }

  // Filtrar variantes por termo de busca e status
  const variantesFiltradas = variantesData.filter((variante) => {
    const matchesSearch =
      variante.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variante.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variante.descricao.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "todos" || variante.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Atualização periódica
  useEffect(() => {
    if (authenticated) {
      // Carregar dados iniciais
      loadDashboardData()

      // Configurar atualização periódica
      const intervalId = setInterval(() => {
        loadDashboardData()
      }, 30000)

      return () => clearInterval(intervalId)
    }
  }, [authenticated])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-950 to-purple-700 rounded-full flex items-center justify-center mb-4">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-purple-800">Dashboard Nutricional</CardTitle>
            <p className="text-gray-600">Acesso restrito - Faça login para continuar</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-700">
              Entrar
            </Button>
            <p className="text-xs text-gray-500 text-center">Usuário: admin | Senha: menopausa2024</p>
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                onClick={() => (window.location.href = "/?admin=false&direct=true")}
              >
                <Home className="w-4 h-4 mr-2" />
                Ir direto para a Avaliação (sem login)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-950 to-purple-700 rounded-lg flex items-center justify-center mr-3">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-purple-800">Dashboard Nutricional</h1>
                <p className="text-sm text-gray-500">
                  Avaliação Nutricional para Menopausa - Modo: {metricas.mode === "supabase" ? "Supabase" : "Local"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/selector", "_blank")}
                className="border-purple-300 text-purple-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Seletor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/?admin=false&direct=true")}
                className="border-purple-300 text-purple-600"
              >
                <Home className="w-4 h-4 mr-2" />
                Avaliação Direta
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status do Supabase */}
        {!supabaseStatus.configured && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">⚠️ Modo Local Ativo</h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    Supabase não configurado. Os dados estão sendo salvos localmente no navegador.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline" className="bg-white border-yellow-300 text-yellow-700">
                      localStorage
                    </Badge>
                    <Badge variant="outline" className="bg-white border-yellow-300 text-yellow-700">
                      Dados Temporários
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="variantes" className="flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Variantes
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="configuracoes" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                disabled={loading}
                className="border-purple-300 text-purple-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar Dados
              </Button>
            </div>
          </div>

          <TabsContent value="variantes" className="space-y-6">
            {/* Instruções de Uso */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-800 mb-1">Avaliação Nutricional para Menopausa</h3>
                    <p className="text-sm text-purple-700 mb-2">
                      Sistema de avaliação nutricional especializado para mulheres na menopausa.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="bg-white border-purple-300 text-purple-700">
                        {supabaseStatus.configured ? "Supabase Database" : "localStorage"}
                      </Badge>
                      <Badge variant="outline" className="bg-white border-purple-300 text-purple-700">
                        Real-time Analytics
                      </Badge>
                      <Badge variant="outline" className="bg-white border-purple-300 text-purple-700">
                        100% Natural
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-1/2">
                <Input
                  placeholder="Buscar variante por nome, ID ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-purple-300 focus:border-purple-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Status:</span>
                <div className="flex space-x-1">
                  <Button
                    variant={statusFilter === "todos" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("todos")}
                    className={
                      statusFilter === "todos" ? "bg-purple-600 text-white" : "border-purple-300 text-purple-600"
                    }
                  >
                    Todos
                  </Button>
                  <Button
                    variant={statusFilter === "ativo" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("ativo")}
                    className={
                      statusFilter === "ativo" ? "bg-purple-600 text-white" : "border-purple-300 text-purple-600"
                    }
                  >
                    Ativos
                  </Button>
                  <Button
                    variant={statusFilter === "teste" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("teste")}
                    className={
                      statusFilter === "teste" ? "bg-purple-600 text-white" : "border-purple-300 text-purple-600"
                    }
                  >
                    Teste
                  </Button>
                </div>
              </div>
            </div>

            {/* Grid de Variantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {variantesFiltradas.map((variante) => (
                <Card key={variante.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${variante.cor}`}></div>
                        <Badge
                          variant={variante.status === "ativo" ? "default" : "secondary"}
                          className={
                            variante.status === "ativo"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {variante.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copiarUrl(variante.id)}
                        className="text-purple-600 hover:bg-purple-50"
                      >
                        {copiedUrl === variante.id ? (
                          <CheckCheck className="w-4 h-4" />
                        ) : (
                          <Clipboard className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-purple-800">{variante.nome}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{variante.descricao}</p>
                      <p className="text-xs text-purple-600 font-mono mt-1">ID: {variante.id}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Estatísticas */}
                    {variante.estatisticas && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-800">{variante.estatisticas.visualizacoes}</div>
                          <div className="text-xs text-purple-600">Visualizações</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-800">{variante.estatisticas.conclusoes}</div>
                          <div className="text-xs text-green-600">Conclusões</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-800">
                            {variante.estatisticas.taxaConclusao.toFixed(1)}%
                          </div>
                          <div className="text-xs text-blue-600">Taxa Conclusão</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-800">{variante.estatisticas.tempoMedio}s</div>
                          <div className="text-xs text-orange-600">Tempo Médio</div>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Características:</h4>
                      <div className="space-y-1">
                        {variante.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <ChevronRight className="w-3 h-3 mr-1 text-purple-500" />
                            {feature}
                          </div>
                        ))}
                        {variante.features.length > 3 && (
                          <div className="text-xs text-gray-500">+{variante.features.length - 3} mais...</div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <div className="flex space-x-2 w-full">
                      <Button
                        onClick={() => abrirVariante(variante.id)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir
                      </Button>
                      <Button
                        onClick={() => irParaVariante(variante.id)}
                        variant="outline"
                        className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
                        size="sm"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Ir
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {variantesFiltradas.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma variante encontrada</h3>
                <p className="text-gray-500">Tente ajustar os filtros de busca ou status.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total de Visualizações</p>
                      <h3 className="text-3xl font-bold text-purple-900">{metricas.totalViews}</h3>
                    </div>
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total de Leads</p>
                      <h3 className="text-3xl font-bold text-purple-900">{metricas.totalLeads}</h3>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
                      <h3 className="text-3xl font-bold text-purple-900">{metricas.taxaConversao}%</h3>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Última Atualização</p>
                      <h3 className="text-sm font-bold text-purple-900">
                        {lastUpdate ? lastUpdate.toLocaleTimeString() : "Nunca"}
                      </h3>
                    </div>
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCreateTestLead} disabled={loading} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Lead Teste
              </Button>

              <Button onClick={handleExportData} variant="outline" className="border-purple-300 text-purple-600">
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>

              <Button onClick={handleClearAnalyticsData} disabled={loading} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Dados
              </Button>
            </div>

            {/* Banco de Leads */}
            <Card>
              <CardHeader>
                <CardTitle>Banco de Leads ({metricas.leads.length} leads)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Buscar por nome, email..."
                    value={searchTermAnalytics}
                    onChange={(e) => setSearchTermAnalytics(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-4">
                  {metricas.leads
                    .filter((lead: any) => {
                      if (!searchTermAnalytics) return true
                      const nome = (lead.nome || "").toLowerCase()
                      const email = (lead.email || "").toLowerCase()
                      const termo = searchTermAnalytics.toLowerCase()
                      return nome.includes(termo) || email.includes(termo)
                    })
                    .slice(0, 10)
                    .map((lead: any, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="font-medium">{lead.nome || "Nome não informado"}</h3>
                            <p className="text-sm text-gray-600">
                              {lead.email || "Email não informado"} | {lead.telefone || "Telefone não informado"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Idade: {lead.idade || "N/A"} | Variante: {lead.variante || "N/A"}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              {lead.categoria || "Sem categoria"}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {lead.created_at ? new Date(lead.created_at).toLocaleString() : "Data desconhecida"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  {metricas.leads.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum lead encontrado</h3>
                      <p className="text-gray-500 mb-4">Ainda não há leads registrados no sistema.</p>
                      <Button onClick={handleCreateTestLead} disabled={loading}>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Lead Teste
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-medium mb-2">Status do Sistema</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Supabase:</span>
                        <Badge variant={supabaseStatus.configured ? "default" : "destructive"}>
                          {supabaseStatus.configured ? "✅ Configurado" : "❌ Não Configurado"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>URL:</span>
                        <span className="text-sm">{supabaseStatus.url}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chave:</span>
                        <span className="text-sm">{supabaseStatus.key}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Modo:</span>
                        <Badge variant={metricas.mode === "supabase" ? "default" : "secondary"}>
                          {metricas.mode === "supabase" ? "Supabase" : "Local"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de Leads</span>
                        <span className="font-medium">{metricas.totalLeads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de Views</span>
                        <span className="font-medium">{metricas.totalViews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Última Atualização</span>
                        <span className="text-sm text-gray-500">
                          {lastUpdate ? lastUpdate.toLocaleTimeString() : "Nunca"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-2">URLs das Variantes</h3>
                    <div className="space-y-2 text-sm">
                      {VARIANTES.map((variante) => (
                        <div key={variante.id} className="flex justify-between items-center">
                          <span className="font-mono text-blue-700">{variante.id}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copiarUrl(variante.id)}
                            className="text-blue-600 hover:bg-blue-100"
                          >
                            {copiedUrl === variante.id ? "Copiado!" : "Copiar URL"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
