"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TesteWebhook() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testarWebhookDireto = async () => {
    setLoading(true)
    setResultado(null)

    const dadosSimples = {
      nome: "Maria Teste",
      email: "maria@teste.com",
      telefone: "11999999999",
      idade: "45",
      categoria: "Sintomas Moderados",
      pontuacao: 50,
      qualificacao: "QUENTE",
      timestamp: new Date().toISOString(),
      teste: true,
    }

    console.log("🧪 Testando webhook direto com dados:", dadosSimples)

    try {
      const response = await fetch("https://hook.us1.make.com/m4960xismeqglvgo9qvm1zt220rnnmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dadosSimples),
      })

      console.log("📊 Status:", response.status)
      console.log("📊 Headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("📋 Resposta:", responseText)

      setResultado({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        response: responseText,
        dadosEnviados: dadosSimples,
      })
    } catch (error) {
      console.error("❌ Erro:", error)
      setResultado({
        success: false,
        error: error.message,
        dadosEnviados: dadosSimples,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Teste Direto do Webhook Make</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">URL do Webhook:</h3>
              <code className="text-sm bg-white p-2 rounded block">
                https://hook.us1.make.com/m4960xismeqglvgo9qvm1zt220rnnmer
              </code>
            </div>

            <Button onClick={testarWebhookDireto} disabled={loading} className="w-full" size="lg">
              {loading ? "🔄 Testando..." : "🚀 Testar Webhook Direto"}
            </Button>

            {resultado && (
              <div className="mt-6 space-y-4">
                <div
                  className={`p-4 rounded-lg ${resultado.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border`}
                >
                  <h3 className="font-semibold mb-2">{resultado.success ? "✅ Sucesso!" : "❌ Erro!"}</h3>
                  <div className="text-sm space-y-2">
                    <div>
                      <strong>Status:</strong> {resultado.status} {resultado.statusText}
                    </div>
                    {resultado.error && (
                      <div>
                        <strong>Erro:</strong> {resultado.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">📋 Detalhes Completos:</h3>
                  <pre className="text-xs overflow-auto bg-white p-3 rounded border max-h-96">
                    {JSON.stringify(resultado, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2">🔍 Como diagnosticar:</h3>
              <ul className="text-sm space-y-1">
                <li>
                  • <strong>Status 200:</strong> Webhook funcionando ✅
                </li>
                <li>
                  • <strong>Status 404:</strong> URL incorreta ou cenário não ativo ❌
                </li>
                <li>
                  • <strong>Status 500:</strong> Erro no cenário do Make ❌
                </li>
                <li>
                  • <strong>Erro de rede:</strong> Problema de conectividade ❌
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
