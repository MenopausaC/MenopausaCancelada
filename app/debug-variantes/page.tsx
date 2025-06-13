"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function DebugVariantes() {
  const [dados, setDados] = useState({
    quizDashboard: [],
    sessions: [],
    leads: [],
    loading: true,
    error: null,
  })

  const carregarDados = async () => {
    setDados((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log("🔍 Iniciando debug das variantes...")

      // Buscar dados da tabela QUIZ_DASHBOARD
      const { data: quizData, error: quizError } = await supabase
        .from("QUIZ_DASHBOARD")
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(10)

      if (quizError) {
        console.error("❌ Erro ao buscar QUIZ_DASHBOARD:", quizError)
      } else {
        console.log("✅ Dados QUIZ_DASHBOARD:", quizData)
      }

      // Buscar dados da tabela sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (sessionsError) {
        console.error("❌ Erro ao buscar sessions:", sessionsError)
      } else {
        console.log("✅ Dados sessions:", sessionsData)
      }

      // Buscar dados da tabela leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (leadsError) {
        console.error("❌ Erro ao buscar leads:", leadsError)
      } else {
        console.log("✅ Dados leads:", leadsData)
      }

      setDados({
        quizDashboard: quizData || [],
        sessions: sessionsData || [],
        leads: leadsData || [],
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error("❌ Erro geral:", error)
      setDados((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }))
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const analisarVariantes = () => {
    console.log("🔍 ANÁLISE DETALHADA DAS VARIANTES:")

    // Analisar QUIZ_DASHBOARD
    const variantesQuiz = {}
    dados.quizDashboard.forEach((item, index) => {
      console.log(`Quiz ${index + 1}:`, {
        nome: item.nome,
        versao_questionario: item.versao_questionario,
        origem: item.origem,
        variante: item.variante,
        criado_em: item.criado_em,
      })

      const variante = item.versao_questionario || item.origem || item.variante || "sem_variante"
      variantesQuiz[variante] = (variantesQuiz[variante] || 0) + 1
    })

    // Analisar Sessions
    const variantesSessions = {}
    dados.sessions.forEach((item, index) => {
      console.log(`Session ${index + 1}:`, {
        variante: item.variante,
        created_at: item.created_at,
      })

      const variante = item.variante || "sem_variante"
      variantesSessions[variante] = (variantesSessions[variante] || 0) + 1
    })

    // Analisar Leads
    const variantesLeads = {}
    dados.leads.forEach((item, index) => {
      console.log(`Lead ${index + 1}:`, {
        nome: item.nome,
        variante: item.variante,
        origem: item.origem,
        created_at: item.created_at,
      })

      const variante = item.variante || item.origem || "sem_variante"
      variantesLeads[variante] = (variantesLeads[variante] || 0) + 1
    })

    console.log("📊 RESUMO DAS VARIANTES:")
    console.log("- QUIZ_DASHBOARD:", variantesQuiz)
    console.log("- Sessions:", variantesSessions)
    console.log("- Leads:", variantesLeads)

    return { variantesQuiz, variantesSessions, variantesLeads }
  }

  if (dados.loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Carregando dados para debug...</p>
        </div>
      </div>
    )
  }

  if (dados.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-bold mb-2">Erro ao carregar dados</p>
          <p>{dados.error}</p>
          <Button onClick={carregarDados} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  const { variantesQuiz, variantesSessions, variantesLeads } = analisarVariantes()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-900">Debug das Variantes</h1>
          <Button onClick={carregarDados} className="bg-purple-600">
            Recarregar Dados
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>QUIZ_DASHBOARD</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{dados.quizDashboard.length}</p>
              <p className="text-sm text-gray-600">registros encontrados</p>
              <div className="mt-2">
                {Object.entries(variantesQuiz).map(([variante, count]) => (
                  <div key={variante} className="flex justify-between text-sm">
                    <span>{variante}:</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{dados.sessions.length}</p>
              <p className="text-sm text-gray-600">registros encontrados</p>
              <div className="mt-2">
                {Object.entries(variantesSessions).map(([variante, count]) => (
                  <div key={variante} className="flex justify-between text-sm">
                    <span>{variante}:</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{dados.leads.length}</p>
              <p className="text-sm text-gray-600">registros encontrados</p>
              <div className="mt-2">
                {Object.entries(variantesLeads).map(([variante, count]) => (
                  <div key={variante} className="flex justify-between text-sm">
                    <span>{variante}:</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dados detalhados */}
        <div className="grid grid-cols-1 gap-6">
          {/* QUIZ_DASHBOARD */}
          <Card>
            <CardHeader>
              <CardTitle>Dados QUIZ_DASHBOARD (últimos 10)</CardTitle>
            </CardHeader>
            <CardContent>
              {dados.quizDashboard.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Versão Questionário</th>
                        <th className="text-left p-2">Origem</th>
                        <th className="text-left p-2">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.quizDashboard.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.nome}</td>
                          <td className="p-2">{item.email}</td>
                          <td className="p-2 font-bold text-purple-600">{item.versao_questionario || "N/A"}</td>
                          <td className="p-2">{item.origem || "N/A"}</td>
                          <td className="p-2">{new Date(item.criado_em).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Nenhum dado encontrado na tabela QUIZ_DASHBOARD</p>
              )}
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Sessions (últimos 10)</CardTitle>
            </CardHeader>
            <CardContent>
              {dados.sessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Variante</th>
                        <th className="text-left p-2">User Agent</th>
                        <th className="text-left p-2">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.sessions.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.id}</td>
                          <td className="p-2 font-bold text-blue-600">{item.variante || "N/A"}</td>
                          <td className="p-2 truncate max-w-xs">{item.user_agent}</td>
                          <td className="p-2">{new Date(item.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Nenhum dado encontrado na tabela sessions</p>
              )}
            </CardContent>
          </Card>

          {/* Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Leads (últimos 10)</CardTitle>
            </CardHeader>
            <CardContent>
              {dados.leads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Variante</th>
                        <th className="text-left p-2">Origem</th>
                        <th className="text-left p-2">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.leads.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.nome}</td>
                          <td className="p-2">{item.email}</td>
                          <td className="p-2 font-bold text-green-600">{item.variante || "N/A"}</td>
                          <td className="p-2">{item.origem || "N/A"}</td>
                          <td className="p-2">{new Date(item.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Nenhum dado encontrado na tabela leads</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">📋 Instruções:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Abra o console do navegador (F12) para ver logs detalhados</li>
            <li>Verifique se os dados estão sendo salvos nas tabelas corretas</li>
            <li>Observe quais campos de variante estão preenchidos</li>
            <li>Compare com o que aparece no dashboard principal</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
