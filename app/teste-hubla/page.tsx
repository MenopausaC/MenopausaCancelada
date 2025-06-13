"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, DollarSign, Users } from "lucide-react"

export default function TesteHublaPage() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [email, setEmail] = useState("teste@email.com")

  const testarWebhookHubla = async () => {
    setLoading(true)
    setResultado(null)

    try {
      // Dados de exemplo da Hubla
      const dadosHublaExemplo = {
        event: "payment.approved",
        payment: {
          id: `pay_${Date.now()}`,
          status: "approved",
          amount: 197.0,
          currency: "BRL",
          created_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
        },
        customer: {
          id: `cust_${Date.now()}`,
          name: "Maria Silva",
          email: email,
          phone: "+5511999999999",
          document: "12345678901",
        },
        product: {
          id: "prod_consulta_nutricional",
          name: "Consulta Nutricional - Menopausa",
          price: 197.0,
        },
        metadata: {
          utm_source: "questionario",
          utm_campaign: "menopausa_quiz",
        },
      }

      console.log("📤 Enviando dados para webhook Hubla:", dadosHublaExemplo)

      const response = await fetch("/api/webhook-hubla", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosHublaExemplo),
      })

      const data = await response.json()
      setResultado({ success: response.ok, data, status: response.status })

      console.log("📥 Resposta do webhook:", data)
    } catch (error) {
      console.error("❌ Erro ao testar webhook:", error)
      setResultado({
        success: false,
        data: { message: error.message },
        status: 500,
      })
    } finally {
      setLoading(false)
    }
  }

  const verificarStatusWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/webhook-hubla")
      const data = await response.json()
      setResultado({ success: response.ok, data, status: response.status })
    } catch (error) {
      setResultado({
        success: false,
        data: { message: error.message },
        status: 500,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teste Webhook Hubla</h1>
          <p className="text-gray-600">Teste a integração com a plataforma de pagamento Hubla</p>
        </div>

        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Configuração do Teste</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email do cliente (deve existir no banco de leads):
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                type="email"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use um email que já preencheu o questionário para testar a correlação
              </p>
            </div>

            <div className="flex space-x-4">
              <Button onClick={testarWebhookHubla} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? "Testando..." : "Simular Pagamento Aprovado"}
              </Button>

              <Button onClick={verificarStatusWebhook} disabled={loading} variant="outline">
                {loading ? "Verificando..." : "Verificar Status"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {resultado.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <span>Resultado do Teste</span>
                <Badge variant={resultado.success ? "default" : "destructive"}>Status: {resultado.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">{JSON.stringify(resultado.data, null, 2)}</pre>
              </div>

              {resultado.success && resultado.data.data?.leadId && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Conversão Registrada!</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Lead ID:</strong> {resultado.data.data.leadId}
                    </p>
                    <p>
                      <strong>Conversão ID:</strong> {resultado.data.data.conversaoId}
                    </p>
                    <p>
                      <strong>Variante:</strong> {resultado.data.data.variante}
                    </p>
                    <p>
                      <strong>Valor:</strong> R$ {resultado.data.data.valor}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Instruções para Hubla</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">URL do Webhook:</h4>
              <code className="bg-gray-100 p-2 rounded block">https://seu-dominio.vercel.app/api/webhook-hubla</code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Eventos para configurar:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <code>payment.approved</code> - Pagamento aprovado (principal)
                </li>
                <li>
                  <code>payment.pending</code> - Pagamento pendente (opcional)
                </li>
                <li>
                  <code>payment.cancelled</code> - Pagamento cancelado (opcional)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Headers necessários:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <code>Content-Type: application/json</code>
                </li>
                <li>
                  <code>Authorization: Bearer SEU_TOKEN</code> (opcional)
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Importante:</h4>
              <p className="text-sm text-yellow-700">
                Configure a variável de ambiente <code>HUBLA_WEBHOOK_SECRET</code> para maior segurança.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
