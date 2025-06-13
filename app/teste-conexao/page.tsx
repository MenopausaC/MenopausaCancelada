"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { testSupabaseConnection, getSupabaseStatus, criarLeadTeste } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

export default function TesteConexao() {
  const [status, setStatus] = useState({
    config: null,
    connection: null,
    loading: false,
  })

  const verificarTudo = async () => {
    setStatus((prev) => ({ ...prev, loading: true }))

    try {
      // Verificar configuração
      const configStatus = getSupabaseStatus()
      console.log("📋 Status da configuração:", configStatus)

      // Testar conexão
      const connectionTest = await testSupabaseConnection()
      console.log("🔌 Teste de conexão:", connectionTest)

      setStatus({
        config: configStatus,
        connection: connectionTest,
        loading: false,
      })
    } catch (error) {
      console.error("❌ Erro no teste:", error)
      setStatus((prev) => ({
        ...prev,
        loading: false,
        connection: { success: false, message: error.message, status: "error" },
      }))
    }
  }

  const criarTeste = async () => {
    try {
      const resultado = await criarLeadTeste()
      if (resultado) {
        alert("✅ Lead de teste criado com sucesso!")
        console.log("Lead criado:", resultado)
      } else {
        alert("❌ Erro ao criar lead de teste")
      }
    } catch (error) {
      alert(`❌ Erro: ${error.message}`)
    }
  }

  useEffect(() => {
    verificarTudo()
  }, [])

  const getStatusIcon = (success) => {
    if (status.loading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
    if (success) return <CheckCircle className="w-5 h-5 text-green-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  const getStatusBadge = (success, loading = false) => {
    if (loading) return <Badge className="bg-blue-100 text-blue-800">Verificando...</Badge>
    if (success) return <Badge className="bg-green-100 text-green-800">OK</Badge>
    return <Badge className="bg-red-100 text-red-800">Erro</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 mb-6">🔍 Teste de Conexão Supabase</h1>

        {/* Status da Configuração */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📋 Configuração das Variáveis</span>
              {getStatusBadge(status.config?.configured, status.loading)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.config && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>NEXT_PUBLIC_SUPABASE_URL</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.config.url.includes("✅"))}
                    <span className="text-sm">{status.config.url}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.config.key.includes("✅"))}
                    <span className="text-sm">{status.config.key}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status da Conexão */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🔌 Teste de Conexão</span>
              {getStatusBadge(status.connection?.success, status.loading)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(status.connection?.success)}
              <span>{status.connection?.message || "Aguardando teste..."}</span>
            </div>

            {status.connection?.status === "error" && status.connection?.details && (
              <div className="bg-red-50 p-3 rounded-md text-sm text-red-800 mb-4">
                <div className="font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Detalhes do Erro:
                </div>
                <pre className="mt-2 text-xs overflow-x-auto">{JSON.stringify(status.connection.details, null, 2)}</pre>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={verificarTudo} disabled={status.loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${status.loading ? "animate-spin" : ""}`} />
                Verificar Novamente
              </Button>

              {status.connection?.success && (
                <Button onClick={criarTeste} variant="outline">
                  🧪 Criar Lead de Teste
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">✅ Se tudo estiver OK:</h4>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>
                    Acesse <code>/dashboard-supabase</code> para ver os dados
                  </li>
                  <li>Preencha o questionário para testar</li>
                  <li>Os dados devem aparecer no dashboard</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-2">⚠️ Se houver erro:</h4>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  <li>
                    Verifique se o arquivo <code>.env.local</code> existe na raiz
                  </li>
                  <li>Confirme se as variáveis estão corretas</li>
                  <li>
                    Reinicie o servidor (<code>npm run dev</code>)
                  </li>
                  <li>Verifique se as tabelas foram criadas no Supabase</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
