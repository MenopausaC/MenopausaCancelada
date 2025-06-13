"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { testSupabaseConnection } from "@/lib/supabase"

export default function SupabaseStatus() {
  const [status, setStatus] = useState({
    status: "checking",
    message: "Verificando conexão...",
    details: null,
  })
  const [loading, setLoading] = useState(false)

  const checkConnection = async () => {
    setLoading(true)
    try {
      const result = await testSupabaseConnection()
      setStatus({
        status: result.status,
        message: result.message,
        details: result.details || null,
      })
    } catch (error) {
      setStatus({
        status: "exception",
        message: `Erro ao verificar: ${error.message}`,
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const getStatusIcon = () => {
    switch (status.status) {
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

  const getStatusBadge = () => {
    switch (status.status) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Status do Supabase</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          {getStatusIcon()}
          <div className="text-sm">{status.message}</div>
        </div>

        {status.status === "error" && (
          <div className="bg-red-50 p-3 rounded-md text-sm text-red-800 mb-4">
            <div className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Erro detectado
            </div>
            <div className="mt-1 text-xs font-mono overflow-x-auto">{JSON.stringify(status.details, null, 2)}</div>
          </div>
        )}

        <Button
          onClick={checkConnection}
          disabled={loading}
          className="w-full"
          variant={status.status === "connected" ? "outline" : "default"}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Verificando..." : "Verificar Conexão"}
        </Button>
      </CardContent>
    </Card>
  )
}
