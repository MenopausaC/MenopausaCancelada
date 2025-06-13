"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function WebhookTest() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const testarWebhookMake = async () => {
    setLoading(true)
    setResultado(null)

    try {
      console.log("🧪 Testando webhook do Make...")

      const dadosTeste = {
        dadosContato: {
          nome: "Teste Make " + Date.now(),
          email: `teste.make.${Date.now()}@email.com`,
          telefone: "11999999999",
          idade: "45",
        },
        analise: {
          categoria: "Sintomas Moderados",
          pontuacaoTotal: 65,
          sintomas: [
            { nome: "Ondas de calor", intensidade: "Alta" },
            { nome: "Insônia", intensidade: "Média" },
          ],
          recomendacoes: ["Consultar ginecologista", "Exercícios regulares"],
        },
        qualificacaoLead: {
          categoria: "MORNO",
          prioridade: 3,
          score: 65,
          motivos: ["Sintomas moderados", "Interesse em tratamento"],
        },
        respostas: {
          pergunta1: "Sim, frequentemente",
          pergunta2: "Moderada",
          pergunta3: "Às vezes",
        },
        variante: "testbx9",
        tempoTotal: 120000,
        timestamp: new Date().toISOString(),
        origem: "teste-webhook",
      }

      // Enviar para o webhook do Make
      const makeResponse = await fetch("https://hook.us1.make.com/3lqca8wvfvl6sbhvhyskarl2rkvkpff7", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosTeste),
      })

      const makeResult = await makeResponse.text()

      setResultado({
        success: makeResponse.ok,
        status: makeResponse.status,
        response: makeResult,
        dadosEnviados: dadosTeste,
        timestamp: new Date().toISOString(),
      })

      console.log("✅ Teste do webhook concluído:", {
        status: makeResponse.status,
        response: makeResult,
      })
    } catch (error) {
      console.error("❌ Erro no teste do webhook:", error)
      setResultado({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔗 Teste do Webhook Make</CardTitle>
        <CardDescription>Testar envio de dados para o webhook do Make.com</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Make Webhook</Badge>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            https://hook.us1.make.com/3lqca8wvfvl6sbhvhyskarl2rkvkpff7
          </code>
        </div>

        <Button onClick={testarWebhookMake} disabled={loading} className="w-full">
          {loading ? "🔄 Enviando..." : "🚀 Testar Webhook Make"}
        </Button>

        {resultado && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={resultado.success ? "default" : "destructive"}>
                {resultado.success ? "✅ Sucesso" : "❌ Erro"}
              </Badge>
              {resultado.status && <Badge variant="outline">Status: {resultado.status}</Badge>}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <strong>Timestamp:</strong> {resultado.timestamp}
              </div>

              {resultado.response && (
                <div>
                  <strong>Resposta:</strong>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">{resultado.response}</pre>
                </div>
              )}

              {resultado.error && (
                <div>
                  <strong>Erro:</strong>
                  <pre className="bg-red-50 p-2 rounded text-xs text-red-700">{resultado.error}</pre>
                </div>
              )}

              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Ver dados enviados</summary>
                <pre className="bg-white p-2 rounded text-xs overflow-auto mt-2">
                  {JSON.stringify(resultado.dadosEnviados, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
