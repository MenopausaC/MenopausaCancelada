"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSupabaseStatus, testSupabaseConnection } from "@/lib/supabase"
import { RefreshCw, Database, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function ConfigSupabase() {
  const [status, setStatus] = useState({
    configured: false,
    url: "",
    key: "",
    connectionStatus: "checking",
    connectionMessage: "Verificando conexão...",
  })
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      // Verificar configuração
      const configStatus = getSupabaseStatus()
      console.log("Status da configuração:", configStatus)

      // Testar conexão
      const connectionTest = await testSupabaseConnection()
      console.log("Teste de conexão:", connectionTest)

      setStatus({
        configured: configStatus.configured,
        url: configStatus.url,
        key: configStatus.key,
        connectionStatus: connectionTest.status,
        connectionMessage: connectionTest.message,
      })
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      setStatus((prev) => ({
        ...prev,
        connectionStatus: "error",
        connectionMessage: `Erro: ${error.message}`,
      }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case "✅ Configurada":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "❌ Não configurada":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getConnectionIcon = () => {
    switch (status.connectionStatus) {
      case "connected":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "checking":
        return <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
      case "not_configured":
        return <Database className="w-6 h-6 text-yellow-600" />
      default:
        return <XCircle className="w-6 h-6 text-red-600" />
    }
  }

  const getConnectionBadge = () => {
    switch (status.connectionStatus) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>
      case "checking":
        return <Badge className="bg-blue-100 text-blue-800">Verificando</Badge>
      case "not_configured":
        return <Badge className="bg-yellow-100 text-yellow-800">Não Configurado</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 mb-6">Configuração do Supabase</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status da Configuração</span>
              <Badge className={status.configured ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {status.configured ? "Configurado" : "Não Configurado"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.url)}
                  <span>URL do Supabase</span>
                </div>
                <div>{status.url}</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.key)}
                  <span>Chave Anônima</span>
                </div>
                <div>{status.key}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status da Conexão</span>
              {getConnectionBadge()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {getConnectionIcon()}
              <div className="text-sm">{status.connectionMessage}</div>
            </div>

            <Button
              onClick={checkStatus}
              disabled={loading}
              className="w-full"
              variant={status.connectionStatus === "connected" ? "outline" : "default"}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Verificando..." : "Verificar Conexão"}
            </Button>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">📋 Instruções:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>
              Verifique se as variáveis de ambiente estão configuradas:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
            </li>
            <li>Se estiver usando o Vercel, configure as variáveis no painel de configurações</li>
            <li>Após configurar, reinicie a aplicação</li>
            <li>Clique em "Verificar Conexão" para testar novamente</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
