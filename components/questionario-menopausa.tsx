"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { addLead, addView } from "@/lib/analytics"
import { ForceMetrics } from "@/components/force-metrics"

// Definição da interface Pergunta
interface Pergunta {
  id: string
  textoInicial: string
  textoDestaque: string
  opcoes: Array<{
    texto: string
    pontos: number
  }>
}

// Definição da interface QualificacaoLead
interface QualificacaoLead {
  score: number
  categoria: "FRIO" | "MORNO" | "QUENTE" | "MUITO_QUENTE"
  prioridade: 1 | 2 | 3 | 4 | 5
  motivos: string[]
  comportamento: {
    tempoMedioResposta: number
    tempoTotalQuestionario: number
    voltasPerguntas: number
    engajamento: "BAIXO" | "MEDIO" | "ALTO"
  }
}

// Perguntas do questionário
const perguntas: Pergunta[] = [
  {
    id: "idade",
    textoInicial: "Qual a sua",
    textoDestaque: "idade?",
    opcoes: [
      { texto: "Menos de 35 anos", pontos: 5 },
      { texto: "Entre 35 e 45 anos", pontos: 10 },
      { texto: "Entre 46 e 55 anos", pontos: 15 },
      { texto: "Mais de 55 anos", pontos: 10 },
    ],
  },
  {
    id: "sintomas",
    textoInicial: "Quais sintomas da menopausa mais",
    textoDestaque: "te incomodam?",
    opcoes: [
      { texto: "Ondas de calor (fogachos)", pontos: 15 },
      { texto: "Insônia e alterações no sono", pontos: 10 },
      { texto: "Ganho de peso e mudanças no corpo", pontos: 15 },
      { texto: "Alterações de humor e ansiedade", pontos: 10 },
      { texto: "Ainda não sinto sintomas significativos", pontos: 5 },
    ],
  },
  {
    id: "duracao",
    textoInicial: "Há quanto tempo você sente esses",
    textoDestaque: "sintomas?",
    opcoes: [
      { texto: "Menos de 6 meses", pontos: 10 },
      { texto: "Entre 6 meses e 2 anos", pontos: 15 },
      { texto: "Mais de 2 anos", pontos: 20 },
      { texto: "Não sinto sintomas ainda", pontos: 5 },
    ],
  },
  {
    id: "tratamento",
    textoInicial: "Você já tentou algum",
    textoDestaque: "tratamento?",
    opcoes: [
      { texto: "Sim, reposição hormonal", pontos: 15 },
      { texto: "Sim, métodos naturais", pontos: 20 },
      { texto: "Sim, ambos os métodos", pontos: 25 },
      { texto: "Não, ainda não tentei nada", pontos: 10 },
    ],
  },
  {
    id: "impacto",
    textoInicial: "Quanto os sintomas",
    textoDestaque: "impactam sua vida?",
    opcoes: [
      { texto: "Muito, afetam minha rotina diariamente", pontos: 25 },
      { texto: "Moderadamente, incomodam mas consigo lidar", pontos: 15 },
      { texto: "Pouco, são sintomas leves", pontos: 10 },
      { texto: "Não afetam minha vida", pontos: 5 },
    ],
  },
]

// Função para qualificar o lead com base na pontuação
function qualificarLead(pontuacao: number, tempoTotal: number, voltasPerguntas: number): QualificacaoLead {
  let categoria: "FRIO" | "MORNO" | "QUENTE" | "MUITO_QUENTE"
  let prioridade: 1 | 2 | 3 | 4 | 5
  const motivos: string[] = []
  let engajamento: "BAIXO" | "MEDIO" | "ALTO" = "MEDIO"

  // Qualificação baseada na pontuação
  if (pontuacao < 40) {
    categoria = "FRIO"
    prioridade = 1
    motivos.push("Baixa pontuação no questionário")
  } else if (pontuacao < 60) {
    categoria = "MORNO"
    prioridade = 2
    motivos.push("Pontuação média no questionário")
  } else if (pontuacao < 80) {
    categoria = "QUENTE"
    prioridade = 4
    motivos.push("Pontuação alta no questionário")
  } else {
    categoria = "MUITO_QUENTE"
    prioridade = 5
    motivos.push("Pontuação muito alta no questionário")
  }

  // Ajuste baseado no tempo de resposta
  const tempoMedioResposta = tempoTotal / 5 // 5 perguntas

  if (tempoMedioResposta > 15000) {
    // Mais de 15 segundos por pergunta
    motivos.push("Alto tempo de consideração nas respostas")
    engajamento = "ALTO"
    if (prioridade < 5) prioridade++
  } else if (tempoMedioResposta < 5000) {
    // Menos de 5 segundos por pergunta
    motivos.push("Baixo tempo de consideração nas respostas")
    engajamento = "BAIXO"
    if (prioridade > 1) prioridade--
  }

  // Ajuste baseado nas voltas ao questionário
  if (voltasPerguntas > 2) {
    motivos.push("Revisitou perguntas múltiplas vezes")
    engajamento = "ALTO"
    if (prioridade < 5) prioridade++
  }

  return {
    score: pontuacao,
    categoria,
    prioridade,
    motivos,
    comportamento: {
      tempoMedioResposta,
      tempoTotalQuestionario: tempoTotal,
      voltasPerguntas,
      engajamento,
    },
  }
}

// Componente principal do questionário
export default function QuestionarioMenopausa({ variante = "default" }: { variante?: string }) {
  const [perguntaAtual, setPerguntaAtual] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [pontuacao, setPontuacao] = useState(0)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [tempoInicio, setTempoInicio] = useState(Date.now())
  const [voltasPerguntas, setVoltasPerguntas] = useState(0)
  const [temposPerguntas, setTemposPerguntas] = useState<Record<string, number>>({})
  const [qualificacao, setQualificacao] = useState<QualificacaoLead | null>(null)
  const [tempoTotal, setTempoTotal] = useState(0)
  const [varianteSalva, setVarianteSalva] = useState(variante)

  // Referência para o formulário
  const formRef = useRef<HTMLDivElement>(null)

  // Registrar visualização ao montar o componente
  useEffect(() => {
    // Registrar visualização
    addView()
    console.log("📊 Visualização registrada para variante:", variante)

    // Registrar variante no localStorage
    try {
      const variantesData = JSON.parse(localStorage.getItem("menopausa_variants") || "{}")
      const varianteAtual = variantesData[variante] || { views: 0, completions: 0, totalTime: 0, sessions: [] }
      varianteAtual.views = (varianteAtual.views || 0) + 1
      varianteAtual.sessions = [...(varianteAtual.sessions || []), { start: Date.now() }]
      variantesData[variante] = varianteAtual
      localStorage.setItem("menopausa_variants", JSON.stringify(variantesData))
      console.log("📊 Variante registrada:", variante, varianteAtual)
    } catch (e) {
      console.error("❌ Erro ao registrar variante:", e)
    }

    // Salvar variante
    setVarianteSalva(variante)

    // Iniciar tempo
    setTempoInicio(Date.now())
    setTemposPerguntas({
      ...temposPerguntas,
      [perguntas[0].id]: Date.now(),
    })
  }, [])

  // Função para avançar para a próxima pergunta
  const avancarPergunta = () => {
    // Registrar tempo da pergunta atual
    const perguntaId = perguntas[perguntaAtual].id
    const tempoInicioPergunta = temposPerguntas[perguntaId] || 0
    const tempoPergunta = Date.now() - tempoInicioPergunta

    // Atualizar tempos
    setTemposPerguntas({
      ...temposPerguntas,
      [perguntaId]: tempoPergunta,
      [perguntas[perguntaAtual + 1]?.id]: Date.now(),
    })

    // Avançar para a próxima pergunta
    setPerguntaAtual(perguntaAtual + 1)
  }

  // Função para voltar para a pergunta anterior
  const voltarPergunta = () => {
    // Incrementar contador de voltas
    setVoltasPerguntas(voltasPerguntas + 1)

    // Registrar tempo da pergunta atual
    const perguntaId = perguntas[perguntaAtual].id
    const tempoInicioPergunta = temposPerguntas[perguntaId] || 0
    const tempoPergunta = Date.now() - tempoInicioPergunta

    // Atualizar tempos
    setTemposPerguntas({
      ...temposPerguntas,
      [perguntaId]: tempoPergunta,
      [perguntas[perguntaAtual - 1]?.id]: Date.now(),
    })

    // Voltar para a pergunta anterior
    setPerguntaAtual(perguntaAtual - 1)
  }

  // Função para selecionar uma resposta
  const selecionarResposta = (perguntaId: string, resposta: string, pontos: number) => {
    // Atualizar respostas
    setRespostas({
      ...respostas,
      [perguntaId]: resposta,
    })

    // Atualizar pontuação
    const pontuacaoAnterior = pontuacao
    setPontuacao(pontuacaoAnterior + pontos)

    // Avançar automaticamente para a próxima pergunta
    if (perguntaAtual < perguntas.length - 1) {
      avancarPergunta()
    } else {
      // Finalizar questionário
      finalizarQuestionario()
    }
  }

  // Função para finalizar o questionário
  const finalizarQuestionario = () => {
    // Calcular tempo total
    const tempoFinal = Date.now()
    const tempoTotalCalculado = tempoFinal - tempoInicio

    // Salvar tempo total
    setTempoTotal(tempoTotalCalculado)

    // Qualificar lead
    const qualificacaoLead = qualificarLead(pontuacao, tempoTotalCalculado, voltasPerguntas)
    setQualificacao(qualificacaoLead)

    // Mostrar formulário
    setMostrarFormulario(true)

    // Rolar para o formulário
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Função para enviar o formulário
  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    try {
      // Dados do lead
      const leadData = {
        nome,
        email,
        telefone,
        idade: respostas["idade"],
        sintomas: respostas["sintomas"],
        duracao: respostas["duracao"],
        tratamento: respostas["tratamento"],
        impacto: respostas["impacto"],
        pontuacao,
        categoria: qualificacao?.categoria,
        prioridade: qualificacao?.prioridade,
        tempoTotal,
        variante: varianteSalva,
      }

      console.log("📝 Enviando formulário:", leadData)

      // Registrar lead no analytics
      addLead(leadData)

      // Registrar conclusão na variante
      try {
        const variantesData = JSON.parse(localStorage.getItem("menopausa_variants") || "{}")
        const varianteAtual = variantesData[varianteSalva] || { views: 0, completions: 0, totalTime: 0, sessions: [] }
        varianteAtual.completions = (varianteAtual.completions || 0) + 1
        varianteAtual.totalTime = (varianteAtual.totalTime || 0) + tempoTotal

        // Atualizar última sessão
        if (varianteAtual.sessions && varianteAtual.sessions.length > 0) {
          const lastSession = varianteAtual.sessions[variante.sessions.length - 1]
          lastSession.end = Date.now()
          lastSession.completed = true
        }

        variantesData[varianteSalva] = varianteAtual
        localStorage.setItem("menopausa_variants", JSON.stringify(variantesData))
        console.log("📊 Conclusão registrada para variante:", varianteSalva, varianteAtual)
      } catch (e) {
        console.error("❌ Erro ao registrar conclusão da variante:", e)
      }

      // Simular envio para webhook
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setEnviado(true)
      console.log("✅ Formulário enviado com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao enviar formulário:", error)
      alert("Erro ao enviar formulário. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  // Se o formulário foi enviado, mostrar mensagem de sucesso
  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <ForceMetrics />
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Avaliação Enviada!</h2>
          <p className="text-gray-600 mb-6">
            Obrigada por responder nossa avaliação nutricional. Em breve entraremos em contato com você!
          </p>
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-700">
              <strong>Sua qualificação:</strong> {qualificacao?.categoria}
            </p>
            <p className="text-sm text-purple-700">
              <strong>Pontuação:</strong> {pontuacao} pontos
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Fazer Nova Avaliação
          </Button>
        </div>
      </div>
    )
  }

  // Se deve mostrar o formulário
  if (mostrarFormulario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <ForceMetrics />
        <div ref={formRef} className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sua Avaliação Nutricional</h2>
            <p className="text-gray-600 text-sm">
              Baseado nas suas respostas, você obteve <strong>{pontuacao} pontos</strong> e foi classificada como{" "}
              <strong className="text-purple-600">{qualificacao?.categoria}</strong>
            </p>
          </div>

          <form onSubmit={enviarFormulario} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite seu melhor e-mail"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>

            <Button
              type="submit"
              disabled={enviando}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
            >
              {enviando ? "Enviando..." : "Obter Minha Avaliação Nutricional"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Seus dados estão seguros e não serão compartilhados com terceiros.
          </p>
        </div>
      </div>
    )
  }

  // Renderizar pergunta atual
  const pergunta = perguntas[perguntaAtual]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <ForceMetrics />
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header com progresso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">Avaliação Nutricional Gratuita</Badge>
            <span className="text-sm text-gray-500">
              {perguntaAtual + 1} de {perguntas.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((perguntaAtual + 1) / perguntas.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Pergunta */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
            {pergunta.textoInicial}{" "}
            <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">{pergunta.textoDestaque}</span>
          </h2>

          <RadioGroup className="space-y-3">
            {pergunta.opcoes.map((opcao, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                onClick={() => selecionarResposta(pergunta.id, opcao.texto, opcao.pontos)}
              >
                <RadioGroupItem value={opcao.texto} id={`opcao-${index}`} />
                <label htmlFor={`opcao-${index}`} className="flex-1 cursor-pointer text-gray-700">
                  {opcao.texto}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navegação */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={voltarPergunta}
            disabled={perguntaAtual === 0}
            className="border-gray-300 text-gray-600"
          >
            Voltar
          </Button>

          <div className="text-sm text-gray-500">Selecione uma opção para continuar</div>
        </div>
      </div>
    </div>
  )
}
