"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TesteFormatacao() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dados de exemplo para teste
  const dadosExemplo = {
    nome: "João Silva",
    email: "joao.silva@exemplo.com",
    telefone: "11999887766",
    idade: 45,
    categoria_sintomas: "Sintomas Moderados",
    pontuacao_total: 58,
    urgencia: "média",
    expectativa_melhora: "85% das mulheres relatam melhora",
    sintomas_identificados: {
      "Ondas de Calor": 3,
      Insônia: 2,
      Irritabilidade: 4,
    },
    score_qualificacao: 58,
    categoria_lead: "MORNO",
    prioridade: 3,
    motivos_qualificacao: JSON.stringify(["Sintomas Moderados", "Interesse em Tratamento"]),
    tempo_medio_resposta: 7500,
    tempo_total_questionario: 150000,
    voltas_perguntas: 1,
    engajamento: "MEDIO",
    respostas_detalhadas: {
      pergunta1: { resposta: "Opção 2", pontos: 3 },
      pergunta2: { resposta: "Opção 1", pontos: 2 },
    },
    versao_questionario: "v2",
    origem: "teste-formatacao",
    dispositivo: "Desktop",
    navegador: "Chrome",
    sistema_operacional: "Windows",
  }

  // Dados no formato antigo para teste
  const dadosAntigosExemplo = {
    nome: "Maria Oliveira",
    email: "maria.oliveira@exemplo.com",
    telefone: "11988776655",
    idade: 52,
    categoria: "Sintomas Intensos",
    pontuacaoTotal: 75,
    sintomas: {
      "Ondas de Calor": 5,
      Insônia: 4,
      Irritabilidade: 5,
    },
    score: 75,
    respostas: {
      pergunta1: { resposta: "Opção 3", pontos: 5 },
      pergunta2: { resposta: "Opção 2", pontos: 4 },
    },
    variante: "v1",
    tempoTotal: 180000,
    origem: "teste-formatacao-antigo",
  }

  const testarFormatacao = async (dados: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/format-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      setResultado(data)
      console.log("Resposta da API:", data)
    } catch (err) {
      setError((err as Error).message)
      console.error("Erro ao testar formatação:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Teste de Formatação de Dados</h1>

      <Tabs defaultValue="novo">
        <TabsList className="mb-4">
          <TabsTrigger value="novo">Formato Novo</TabsTrigger>
          <TabsTrigger value="antigo">Formato Antigo</TabsTrigger>
        </TabsList>

        <TabsContent value="novo">
          <Card>
            <CardHeader>
              <CardTitle>Testar Formatação - Dados Novos</CardTitle>
              <CardDescription>Testa a API de formatação com dados no novo formato (QUIZ DASHBOARD)</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md text-xs max-h-60 overflow-auto">
                {JSON.stringify(dadosExemplo, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={() => testarFormatacao(dadosExemplo)} disabled={loading}>
                {loading ? "Processando..." : "Testar Formatação"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="antigo">
          <Card>
            <CardHeader>
              <CardTitle>Testar Formatação - Dados Antigos</CardTitle>
              <CardDescription>Testa a API de formatação com dados no formato antigo</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md text-xs max-h-60 overflow-auto">
                {JSON.stringify(dadosAntigosExemplo, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={() => testarFormatacao(dadosAntigosExemplo)} disabled={loading} variant="outline">
                {loading ? "Processando..." : "Testar Formatação Antiga"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-md">
          <h3 className="text-red-800 font-semibold">Erro:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {resultado && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3">Resultado da Formatação:</h2>
          <Card>
            <CardContent className="pt-6">
              <pre className="bg-gray-100 p-4 rounded-md text-xs max-h-96 overflow-auto">
                {JSON.stringify(resultado, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
