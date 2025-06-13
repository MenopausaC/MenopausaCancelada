"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

export default function TesteMakePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)

  const testarWebhookMake = async () => {
    setIsLoading(true)
    setErro(null)
    setResultado(null)

    try {
      console.log("📤 Testando webhook do Make...")

      const makeWebhookUrl = "https://hook.us1.make.com/3lqca8wvfvl6sbhvhyskarl2rkvkpff7"

      const dadosTeste = {
        // Dados do contato
        dadosContato: {
          nome: "Maria Silva Teste Make",
          email: "maria.make.teste@email.com",
          telefone: "11999999999",
          idade: "52",
        },

        // Análise completa
        analise: {
          categoria: "Sintomas Intensos",
          pontuacaoTotal: 67,
          descricao: "Sua avaliação mostra que você precisa urgentemente de acompanhamento nutricional.",
          expectativa: "97% das mulheres melhoram com nutrição especializada",
          recomendacao:
            "Nossa nutricionista especializada vai criar um protocolo nutricional específico para seu caso.",
          urgencia: "alta",
          sintomas: [
            {
              nome: "Ganho de Peso Descontrolado",
              urgencia: "alta",
              explicacao: "O ganho de peso na menopausa pode ser controlado com a alimentação certa.",
            },
            {
              nome: "Calores e Suores Frequentes",
              urgencia: "alta",
              explicacao: "Alguns alimentos podem intensificar os calores, outros podem aliviá-los.",
            },
            {
              nome: "Problemas para Dormir",
              urgencia: "alta",
              explicacao: "A nutrição adequada pode melhorar significativamente a qualidade do sono.",
            },
          ],
        },

        // Qualificação do lead (estrutura completa)
        qualificacaoLead: {
          score: 67,
          categoria: "QUENTE",
          prioridade: 5,
          motivos: ["Ganho de Peso Descontrolado", "Calores e Suores Frequentes", "Problemas para Dormir"],
          comportamento: {
            tempoMedioResposta: 8500,
            tempoTotalQuestionario: 180000,
            voltasPerguntas: 2,
            engajamento: "ALTO",
          },
        },

        // Respostas detalhadas (exemplo mais completo)
        respostas: {
          sintoma_principal: {
            pergunta: "sintoma_principal",
            resposta: "Ganho de peso descontrolado",
            pontos: 9,
            tempo: 5000,
            variante: "testbx9",
          },
          alimentacao_atual: {
            pergunta: "alimentacao_atual",
            resposta: "Como de tudo, sem controle",
            pontos: 10,
            tempo: 7000,
            variante: "testbx9",
          },
          ganho_peso: {
            pergunta: "ganho_peso",
            resposta: "Sim, mais de 10 quilos",
            pontos: 10,
            tempo: 4000,
            variante: "testbx9",
          },
          compulsao_alimentar: {
            pergunta: "compulsao_alimentar",
            resposta: "Sim, o tempo todo, não consigo controlar",
            pontos: 9,
            tempo: 6000,
            variante: "testbx9",
          },
          energia_disposicao: {
            pergunta: "energia_disposicao",
            resposta: "Muito baixa, me sinto sempre cansada",
            pontos: 8,
            tempo: 5500,
            variante: "testbx9",
          },
          frequencia_fogachos: {
            pergunta: "frequencia_fogachos",
            resposta: "Várias vezes por dia",
            pontos: 10,
            tempo: 4500,
            variante: "testbx9",
          },
          qualidade_sono: {
            pergunta: "qualidade_sono",
            resposta: "Muito mal, acordo várias vezes",
            pontos: 9,
            tempo: 6500,
            variante: "testbx9",
          },
          digestao: {
            pergunta: "digestao",
            resposta: "Muito ruim, sempre com problemas",
            pontos: 8,
            tempo: 5000,
            variante: "testbx9",
          },
        },

        // Metadados
        variante: "testbx9",
        tempoTotal: 180000,
        timestamp: new Date().toISOString(),
        origem: "teste-webhook-make-dashboard",
      }

      const response = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosTeste),
      })

      if (response.ok) {
        const responseText = await response.text()
        console.log("✅ Webhook Make testado com sucesso!")
        setResultado({
          status: "sucesso",
          statusCode: response.status,
          response: responseText || "Webhook executado com sucesso",
          timestamp: new Date().toISOString(),
        })
      } else {
        const errorText = await response.text()
        console.error("❌ Erro no webhook Make:", errorText)
        setErro(`Erro ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error("❌ Erro ao testar webhook:", error)
      setErro(`Erro de conexão: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testarWebhookInterno = async () => {
    setIsLoading(true)
    setErro(null)
    setResultado(null)

    try {
      console.log("📤 Testando webhook interno...")

      const dadosTeste = {
        // Dados do contato
        dadosContato: {
          nome: "Maria Silva Teste Interno",
          email: "maria.interno.teste@email.com",
          telefone: "11999999999",
          idade: "52",
        },

        // Análise completa
        analise: {
          categoria: "Sintomas Intensos",
          pontuacaoTotal: 67,
          descricao: "Sua avaliação mostra que você precisa urgentemente de acompanhamento nutricional.",
          expectativa: "97% das mulheres melhoram com nutrição especializada",
          recomendacao:
            "Nossa nutricionista especializada vai criar um protocolo nutricional específico para seu caso.",
          urgencia: "alta",
          sintomas: [
            {
              nome: "Ganho de Peso Descontrolado",
              urgencia: "alta",
              explicacao: "O ganho de peso na menopausa pode ser controlado com a alimentação certa.",
            },
            {
              nome: "Calores e Suores Frequentes",
              urgencia: "alta",
              explicacao: "Alguns alimentos podem intensificar os calores, outros podem aliviá-los.",
            },
          ],
        },

        // Qualificação do lead
        qualificacaoLead: {
          score: 67,
          categoria: "QUENTE",
          prioridade: 5,
          motivos: ["Ganho de Peso Descontrolado", "Calores e Suores Frequentes"],
          comportamento: {
            tempoMedioResposta: 8500,
            tempoTotalQuestionario: 180000,
            voltasPerguntas: 2,
            engajamento: "ALTO",
          },
        },

        // Respostas detalhadas
        respostas: {
          sintoma_principal: {
            pergunta: "sintoma_principal",
            resposta: "Ganho de peso descontrolado",
            pontos: 9,
            tempo: 5000,
            variante: "testbx9",
          },
        },

        // Metadados
        variante: "testbx9",
        tempoTotal: 180000,
        timestamp: new Date().toISOString(),
        origem: "teste-webhook-interno",
      }

      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosTeste),
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log("✅ Webhook interno testado com sucesso!")
        setResultado({
          status: "sucesso",
          statusCode: response.status,
          response: JSON.stringify(responseData, null, 2),
          timestamp: new Date().toISOString(),
        })
      } else {
        console.error("❌ Erro no webhook interno:", responseData)
        setErro(`Erro ${response.status}: ${JSON.stringify(responseData, null, 2)}`)
      }
    } catch (error) {
      console.error("❌ Erro ao testar webhook interno:", error)
      setErro(`Erro de conexão: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Teste do Webhook Make</CardTitle>
            <p className="text-center text-gray-600">
              Teste a integração com o webhook do Make para envio de dados do questionário
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <Button
                onClick={testarWebhookMake}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg mr-4"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Testar Webhook Make"
                )}
              </Button>

              <Button
                onClick={testarWebhookInterno}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  "Testar Webhook Interno"
                )}
              </Button>
            </div>

            {/* Resultado do teste */}
            {resultado && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <CardTitle className="text-green-800">Teste Realizado com Sucesso!</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-700">Status:</p>
                      <Badge className="bg-green-100 text-green-800">{resultado.status}</Badge>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Código HTTP:</p>
                      <Badge className="bg-blue-100 text-blue-800">{resultado.statusCode}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Resposta do Make:</p>
                    <div className="bg-white p-3 rounded border text-sm font-mono">{resultado.response}</div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Timestamp:</p>
                    <p className="text-sm text-gray-600">{resultado.timestamp}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Erro */}
            {erro && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <CardTitle className="text-red-800">Erro no Teste</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-3 rounded border text-sm text-red-700">{erro}</div>
                </CardContent>
              </Card>
            )}

            {/* Informações do webhook */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Informações do Webhook</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-700">URL do Webhook:</p>
                  <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                    https://hook.us1.make.com/3lqca8wvfvl6sbhvhyskarl2rkvkpff7
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Método:</p>
                  <Badge className="bg-green-100 text-green-800">POST</Badge>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Content-Type:</p>
                  <Badge className="bg-gray-100 text-gray-800">application/json</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Dados enviados */}
            <Card>
              <CardHeader>
                <CardTitle>Estrutura dos Dados Enviados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-x-auto">
                  <pre>{`{
  "dadosContato": {
    "nome": "string",
    "email": "string", 
    "telefone": "string",
    "idade": "string"
  },
  "analise": {
    "categoria": "string",
    "pontuacaoTotal": number,
    "descricao": "string",
    "expectativa": "string",
    "recomendacao": "string",
    "urgencia": "baixa|media|alta",
    "sintomas": [...]
  },
  "qualificacaoLead": {
    "score": number,
    "categoria": "FRIO|MORNO|QUENTE|MUITO_QUENTE",
    "prioridade": 1-5,
    "motivos": [...],
    "comportamento": {...}
  },
  "respostas": {...},
  "variante": "string",
  "tempoTotal": number,
  "timestamp": "ISO string",
  "origem": "string"
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
