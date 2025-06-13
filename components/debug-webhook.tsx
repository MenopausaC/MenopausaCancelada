"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugWebhook() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testarWebhook = async () => {
    setLoading(true)
    setResultado(null)

    const dadosTeste = {
      dadosContato: {
        nome: "Maria Teste",
        email: "maria@teste.com",
        telefone: "(11) 99999-9999",
        idade: "45",
      },
      respostas: {
        sintoma_principal: {
          pergunta: "sintoma_principal",
          resposta: "Calores repentinos e suores",
          pontos: 8,
          tempo: 5000,
        },
      },
      analise: {
        pontuacaoTotal: 45,
        categoria: "Sintomas Moderados",
        urgencia: "media",
        sintomas: [],
      },
      qualificacaoLead: {
        score: 65,
        categoria: "QUENTE",
        prioridade: 4,
        motivos: ["Teste"],
        comportamento: {
          tempoMedioResposta: 4000,
          tempoTotalQuestionario: 180000,
          tempoTelaFinal: 45000,
          voltasPerguntas: 1,
          hesitacaoPerguntas: [],
          engajamento: "ALTO",
        },
      },
      timestamp: new Date().toISOString(),
      metadados: {
        userAgent: navigator.userAgent,
        acao: "teste",
      },
    }

    try {
      console.log("🧪 Testando webhook com dados:", dadosTeste)

      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosTeste),
      })

      const responseData = await response.json()

      console.log("📋 Resposta do webhook:", responseData)

      setResultado({
        success: response.ok,
        status: response.status,
        data: responseData,
      })
    } catch (error) {
      console.error("❌ Erro no teste:", error)
      setResultado({
        success: false,
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug do Webhook</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testarWebhook} disabled={loading} className="w-full">
          {loading ? "Testando..." : "Testar Webhook"}
        </Button>

        {resultado && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Resultado do Teste:</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(resultado, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
