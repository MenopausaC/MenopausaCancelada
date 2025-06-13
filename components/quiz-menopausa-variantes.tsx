"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Star,
  CheckCircle,
  User,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  Zap,
  Quote,
  Utensils,
  Leaf,
} from "lucide-react"
import { trackEvent } from "@/lib/tracking-system"
import { registrarView, registrarLead, type Lead } from "@/lib/supabase"

// Tipos e interfaces
interface Resposta {
  pergunta: string
  resposta: string
  pontos: number
  tempo: number
  variante: string
}

interface DadosContato {
  nome: string
  idade: string
  telefone: string
  email: string
}

interface AnaliseResultado {
  pontuacaoTotal: number
  categoria: string
  classificacaoFinal: string // Nova classificação (AAA, AA, A, B)
  descricao: string
  expectativa: string
  recomendacao: string
  urgencia: "baixa" | "media" | "alta"
  sintomas: Array<{
    nome: string
    urgencia: "baixa" | "media" | "alta"
    explicacao: string
  }>
}

interface Depoimento {
  nome: string
  idade: number
  texto: string
  resultado: string
}

interface VarianteConfig {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  features: {
    questionarioCompleto: boolean
    botaoAgendamento: boolean
    depoimentos: boolean
    alteracaoTexto: boolean
    botoesContinuar: boolean
    efeitosVisuais: boolean
  }
}

// Configurações das variantes
const VARIANTES: VarianteConfig[] = [
  {
    id: "testbx4",
    nome: "Base Completa",
    descricao: "Versão Base com Avaliação Nutricional Completa",
    ativo: true,
    features: {
      questionarioCompleto: true,
      botaoAgendamento: false,
      depoimentos: false,
      alteracaoTexto: false,
      botoesContinuar: false,
      efeitosVisuais: false,
    },
  },
  {
    id: "testbx5",
    nome: "Com Agendamento",
    descricao: "Versão com Botão para Consulta Nutricional",
    ativo: true,
    features: {
      questionarioCompleto: true,
      botaoAgendamento: true,
      depoimentos: false,
      alteracaoTexto: false,
      botoesContinuar: false,
      efeitosVisuais: false,
    },
  },
  {
    id: "testbx6",
    nome: "Com Depoimentos",
    descricao: "Versão com Depoimentos de Transformação",
    ativo: true,
    features: {
      questionarioCompleto: true,
      botaoAgendamento: true,
      depoimentos: true,
      alteracaoTexto: false,
      botoesContinuar: false,
      efeitosVisuais: false,
    },
  },
  {
    id: "testbx7",
    nome: "Texto Alterado",
    descricao: "Versão com Foco em Nutrição Natural",
    ativo: true,
    features: {
      questionarioCompleto: true,
      botaoAgendamento: true,
      depoimentos: true,
      alteracaoTexto: true,
      botoesContinuar: false,
      efeitosVisuais: false,
    },
  },
  {
    id: "testbx8",
    nome: "Botões Continuar",
    descricao: "Versão com Navegação Otimizada",
    ativo: true,
    features: {
      questionarioCompleto: true,
      botaoAgendamento: true,
      depoimentos: true,
      alteracaoTexto: true,
      botoesContinuar: true,
      efeitosVisuais: false,
    },
  },
  {
    id: "testbx9",
    nome: "Efeitos Visuais",
    descricao: "Versão com Experiência Visual Completa",
    ativo: true,
    features: {
      questionarioCompleto: true,
      botaoAgendamento: true,
      depoimentos: true,
      alteracaoTexto: true,
      botoesContinuar: true,
      efeitosVisuais: true,
    },
  },
]

// Depoimentos atualizados para nutrição
const DEPOIMENTOS: Depoimento[] = [
  {
    nome: "Maria Silva",
    idade: 52,
    texto:
      "Depois de anos sofrendo com calores e ganho de peso, descobri que a alimentação certa fez toda a diferença. Sem remédios, apenas nutrição!",
    resultado: "Perdeu 12kg em 4 meses",
  },
  {
    nome: "Ana Costa",
    idade: 48,
    texto:
      "Eu achava que era normal engordar na menopausa. Com o acompanhamento nutricional, recuperei minha energia e autoestima!",
    resultado: "Sintomas controlados naturalmente",
  },
  {
    nome: "Carmen Santos",
    idade: 55,
    texto:
      "Os calores eram tão intensos que eu não conseguia trabalhar. A nutrição especializada mudou minha vida completamente.",
    resultado: "Calores reduzidos em 80%",
  },
  {
    nome: "Lucia Oliveira",
    idade: 50,
    texto:
      "Descobri que alguns alimentos estavam piorando meus sintomas. Com a orientação certa, me sinto 10 anos mais jovem!",
    resultado: "Energia e disposição restauradas",
  },
]

export default function QuizMenopausaVariantes() {
  // Estados principais
  const [varianteAtual, setVarianteAtual] = useState<string>("")
  const [currentStep, setCurrentStep] = useState(1)
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({})
  const [dadosContato, setDadosContato] = useState<DadosContato>({
    nome: "",
    idade: "",
    telefone: "",
    email: "",
  })
  const [showResult, setShowResult] = useState(false)
  const [analise, setAnalise] = useState<AnaliseResultado | null>(null)
  const [leadRegistrado, setLeadRegistrado] = useState(false)

  // Estados para funcionalidades específicas
  const [depoimentoAtual, setDepoimentoAtual] = useState(0)
  const [startTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Detectar variante da URL ou usar padrão
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const varianteUrl = urlParams.get("variante") || "testbx9" // Padrão: versão mais completa
    setVarianteAtual(varianteUrl)

    // Registrar session_start no tracking system
    trackEvent("session_start", {
      variante: varianteUrl,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    })

    // Registrar view no Supabase (com fallback para localStorage)
    registrarView({
      variante: varianteUrl,
      userAgent: navigator.userAgent,
      url: window.location.href,
    })

    console.log("📊 VIEW REGISTRADA! Variante:", varianteUrl)
  }, [])

  // Rotação de depoimentos a cada 5 segundos
  useEffect(() => {
    if (getVarianteConfig()?.features.depoimentos) {
      const interval = setInterval(() => {
        setDepoimentoAtual((prev) => (prev + 1) % DEPOIMENTOS.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [varianteAtual])

  // Tracking de tempo por pergunta
  useEffect(() => {
    setQuestionStartTime(Date.now())
    if (currentStep <= 12) {
      trackEvent("question_view", { step: currentStep, variante: varianteAtual })
    }
  }, [currentStep, varianteAtual])

  const getVarianteConfig = (): VarianteConfig | undefined => {
    return VARIANTES.find((v) => v.id === varianteAtual)
  }

  const perguntas = [
    {
      id: "sintoma_principal",
      textoInicial: "O que mais te incomoda",
      textoDestaque: "nesta fase da vida?",
      opcoes: [
        { texto: "Calores repentinos e suores", pontos: 8 },
        { texto: "Ganho de peso descontrolado", pontos: 9 },
        { texto: "Não consigo dormir direito", pontos: 7 },
        { texto: "Fico irritada com facilidade", pontos: 6 },
        { texto: "Perdi energia e disposição", pontos: 7 },
      ],
    },
    {
      id: "alimentacao_atual",
      textoInicial: "Como está sua",
      textoDestaque: "alimentação hoje?",
      opcoes: [
        { texto: "Como de tudo, sem controle", pontos: 10 },
        { texto: "Tento comer bem, mas é difícil", pontos: 7 },
        { texto: "Faço dieta, mas não funciona", pontos: 8 },
        { texto: "Tenho uma alimentação equilibrada", pontos: 3 },
      ],
    },
    {
      id: "ganho_peso",
      textoInicial: "Você tem",
      textoDestaque: "ganhado peso?",
      opcoes: [
        { texto: "Sim, mais de 10 quilos", pontos: 10 },
        { texto: "Sim, entre 5 e 10 quilos", pontos: 8 },
        { texto: "Sim, poucos quilos", pontos: 5 },
        { texto: "Não ganhei peso", pontos: 1 },
      ],
    },
    {
      id: "compulsao_alimentar",
      textoInicial: "Você sente",
      textoDestaque: "vontade de comer doces?",
      opcoes: [
        { texto: "Sim, o tempo todo, não consigo controlar", pontos: 9 },
        { texto: "Sim, principalmente à tarde/noite", pontos: 7 },
        { texto: "Às vezes, mas consigo controlar", pontos: 4 },
        { texto: "Não tenho vontade de doces", pontos: 1 },
      ],
    },
    {
      id: "energia_disposicao",
      textoInicial: "Como está sua",
      textoDestaque: "energia no dia a dia?",
      opcoes: [
        { texto: "Muito baixa, me sinto sempre cansada", pontos: 8 },
        { texto: "Baixa, especialmente à tarde", pontos: 6 },
        { texto: "Varia muito durante o dia", pontos: 4 },
        { texto: "Boa, tenho disposição", pontos: 1 },
      ],
    },
    {
      id: "frequencia_fogachos",
      textoInicial: "Com que frequência você sente",
      textoDestaque: "calores e suores?",
      opcoes: [
        { texto: "Várias vezes por dia", pontos: 10 },
        { texto: "Todo dia pelo menos uma vez", pontos: 8 },
        { texto: "Algumas vezes na semana", pontos: 5 },
        { texto: "Quase nunca sinto", pontos: 1 },
      ],
    },
    {
      id: "qualidade_sono",
      textoInicial: "Como você tem",
      textoDestaque: "dormido ultimamente?",
      opcoes: [
        { texto: "Muito mal, acordo várias vezes", pontos: 9 },
        { texto: "Tenho dificuldade para pegar no sono", pontos: 7 },
        { texto: "Durmo, mas acordo cansada", pontos: 4 },
        { texto: "Durmo bem na maioria das noites", pontos: 1 },
      ],
    },
    {
      id: "digestao",
      textoInicial: "Como está sua",
      textoDestaque: "digestão?",
      opcoes: [
        { texto: "Muito ruim, sempre com problemas", pontos: 8 },
        { texto: "Ruim, frequentemente inchada", pontos: 6 },
        { texto: "Às vezes tenho problemas", pontos: 3 },
        { texto: "Normal, sem problemas", pontos: 1 },
      ],
    },
    {
      id: "hidratacao",
      textoInicial: "Quanta água você",
      textoDestaque: "bebe por dia?",
      opcoes: [
        { texto: "Menos de 1 litro", pontos: 8 },
        { texto: "Entre 1 e 1,5 litros", pontos: 5 },
        { texto: "Entre 1,5 e 2 litros", pontos: 3 },
        { texto: "Mais de 2 litros", pontos: 1 },
      ],
    },
    {
      id: "exercicios",
      textoInicial: "Você pratica",
      textoDestaque: "exercícios físicos?",
      opcoes: [
        { texto: "Não pratico nenhum exercício", pontos: 7 },
        { texto: "Muito pouco, irregularmente", pontos: 5 },
        { texto: "Sim, algumas vezes na semana", pontos: 2 },
        { texto: "Sim, regularmente", pontos: 1 },
      ],
    },
    {
      id: "suplementos",
      textoInicial: "Você toma",
      textoDestaque: "vitaminas ou suplementos?",
      opcoes: [
        { texto: "Não tomo nada", pontos: 5 },
        { texto: "Tomo, mas sem orientação", pontos: 4 },
        { texto: "Tomo com orientação médica", pontos: 2 },
        { texto: "Tomo muitos, mas não vejo resultado", pontos: 6 },
      ],
    },
    {
      id: "tratamento_anterior",
      textoInicial: "Você já tentou algum",
      textoDestaque: "tratamento para menopausa?",
      opcoes: [
        { texto: "Sim, mas não resolveu", pontos: 8 },
        { texto: "Sim, melhorou um pouco", pontos: 4 },
        { texto: "Nunca tentei nada", pontos: 6 },
        { texto: "Faço tratamento e estou bem", pontos: 2 },
      ],
    },
  ]

  const totalSteps = 16 // 12 perguntas + 4 dados de contato

  const handleAnswer = (questionId: string, answer: string, pontos: number) => {
    const tempoResposta = Date.now() - questionStartTime

    setRespostas((prev) => ({
      ...prev,
      [questionId]: {
        pergunta: questionId,
        resposta: answer,
        pontos,
        tempo: tempoResposta,
        variante: varianteAtual,
      },
    }))

    // Tracking da resposta
    trackEvent("question_answered", {
      questionId,
      answer,
      pontos,
      tempoResposta,
      step: currentStep,
      variante: varianteAtual,
    })

    // Lógica de navegação corrigida
    if (currentStep < perguntas.length) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300)
    } else if (currentStep === perguntas.length) {
      setTimeout(() => setCurrentStep(perguntas.length + 1), 300)
    }
  }

  const calcularAnalise = (todasRespostas: Record<string, Resposta>, dados: DadosContato): AnaliseResultado => {
    const pontuacaoTotal = Object.values(todasRespostas).reduce((sum, resp) => sum + resp.pontos, 0)

    const sintomas = []
    if (todasRespostas.ganho_peso?.pontos >= 8) {
      sintomas.push({
        nome: "Ganho de Peso Descontrolado",
        urgencia: "alta" as const,
        explicacao: "O ganho de peso na menopausa pode ser controlado com a alimentação certa.",
      })
    }
    if (todasRespostas.compulsao_alimentar?.pontos >= 7) {
      sintomas.push({
        nome: "Compulsão por Doces",
        urgencia: "alta" as const,
        explicacao: "A vontade excessiva de doces pode ser equilibrada com nutrição adequada.",
      })
    }
    if (todasRespostas.energia_disposicao?.pontos >= 6) {
      sintomas.push({
        nome: "Baixa Energia e Disposição",
        urgencia: "media" as const,
        explicacao: "A alimentação correta pode restaurar sua energia naturalmente.",
      })
    }
    if (todasRespostas.frequencia_fogachos?.pontos >= 8) {
      sintomas.push({
        nome: "Calores e Suores Frequentes",
        urgencia: "alta" as const,
        explicacao: "Alguns alimentos podem intensificar os calores, outros podem aliviá-los.",
      })
    }
    if (todasRespostas.qualidade_sono?.pontos >= 7) {
      sintomas.push({
        nome: "Problemas para Dormir",
        urgencia: "alta" as const,
        explicacao: "A nutrição adequada pode melhorar significativamente a qualidade do sono.",
      })
    }
    if (todasRespostas.digestao?.pontos >= 6) {
      sintomas.push({
        nome: "Problemas Digestivos",
        urgencia: "media" as const,
        explicacao: "Uma alimentação balanceada pode resolver problemas digestivos.",
      })
    }

    let urgencia: "baixa" | "media" | "alta" = "baixa"
    const idade = Number.parseInt(dados.idade) || 50
    if (idade < 45 && pontuacaoTotal > 40) urgencia = "alta"
    else if (pontuacaoTotal > 50) urgencia = "alta"
    else if (pontuacaoTotal > 30) urgencia = "media"

    let categoria = ""
    let descricao = ""
    let expectativa = ""
    let recomendacao = ""
    let classificacaoFinal = "" // Nova variável para a classificação AAA, AA, A, B

    if (pontuacaoTotal <= 25) {
      categoria = "Sintomas Leves"
      classificacaoFinal = "B"
      descricao = "Sua avaliação mostra que você pode se beneficiar de orientação nutricional."
      expectativa = "95% das mulheres melhoram com acompanhamento nutricional"
      recomendacao = "Nossa nutricionista especializada vai orientar você sobre a alimentação ideal para esta fase."
    } else if (pontuacaoTotal <= 45) {
      categoria = "Sintomas Moderados"
      classificacaoFinal = "A"
      descricao = "Sua avaliação mostra que você precisa de acompanhamento nutricional especializado."
      expectativa = "96% das mulheres melhoram com nutrição adequada"
      recomendacao = "Nossa nutricionista especializada vai criar um plano alimentar personalizado para você."
    } else if (pontuacaoTotal <= 65) {
      categoria = "Sintomas Intensos"
      classificacaoFinal = "AA"
      descricao = "Sua avaliação mostra que você precisa urgentemente de acompanhamento nutricional."
      expectativa = "97% das mulheres melhoram com nutrição especializada"
      recomendacao = "Nossa nutricionista especializada vai criar um protocolo nutricional específico para seu caso."
    } else {
      categoria = "Sintomas Muito Intensos"
      classificacaoFinal = "AAA"
      descricao = "Sua avaliação mostra que você precisa urgentemente de acompanhamento nutricional intensivo."
      expectativa = "98% das mulheres melhoram com protocolo nutricional especializado"
      recomendacao =
        "Nossa nutricionista especializada vai criar um protocolo nutricional intensivo para transformar sua saúde."
    }

    return {
      pontuacaoTotal,
      categoria,
      classificacaoFinal, // Incluir a nova classificação
      descricao,
      expectativa,
      recomendacao,
      urgencia,
      sintomas,
    }
  }

  // Função para enviar dados para o webhook do Make
  const enviarParaMake = async (leadData: Lead, analiseResult: AnaliseResultado) => {
    try {
      console.log("📤 Enviando dados para Make webhook...")

      const makeWebhookUrl = "https://hook.us1.make.com/3lqca8wvfvl6sbhvhyskarl2rkvkpff7"

      const dadosParaMake = {
        // Dados do contato
        dadosContato: {
          nome: leadData.nome,
          email: leadData.email,
          telefone: leadData.telefone || "",
          idade: leadData.idade || "",
        },

        // Análise completa
        analise: {
          categoria: analiseResult.categoria,
          classificacaoFinal: analiseResult.classificacaoFinal, // Incluir a nova classificação
          pontuacaoTotal: analiseResult.pontuacaoTotal,
          descricao: analiseResult.descricao,
          expectativa: analiseResult.expectativa,
          recomendacao: analiseResult.recomendacao,
          urgencia: analiseResult.urgencia,
          sintomas: analiseResult.sintomas,
        },

        // Qualificação do lead baseada na pontuação
        qualificacaoLead: {
          score: analiseResult.pontuacaoTotal,
          categoria: analiseResult.categoria, // Manter a categoria original (QUENTE, MORNO, FRIO)
          classificacaoFinal: analiseResult.classificacaoFinal, // Nova classificação
          prioridade: analiseResult.pontuacaoTotal > 50 ? 5 : analiseResult.pontuacaoTotal > 30 ? 3 : 1,
          motivos: analiseResult.sintomas.map((s) => s.nome),
          comportamento: {
            tempoMedioResposta: leadData.tempo_total ? leadData.tempo_total / Object.keys(respostas).length : 0,
            tempoTotalQuestionario: leadData.tempo_total || 0,
            voltasPerguntas: 0, // Pode ser implementado se necessário
            engajamento:
              analiseResult.pontuacaoTotal > 40 ? "ALTO" : analiseResult.pontuacaoTotal > 20 ? "MEDIO" : "BAIXO",
          },
        },

        // Respostas detalhadas
        respostas: respostas,

        // Metadados
        variante: varianteAtual,
        tempoTotal: leadData.tempo_total,
        timestamp: new Date().toISOString(),
        origem: "questionario-menopausa",
      }

      const makeResponse = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosParaMake),
      })

      if (makeResponse.ok) {
        console.log("✅ Dados enviados com sucesso para Make")
        return true
      } else {
        console.error("❌ Erro ao enviar para Make:", await makeResponse.text())
        return false
      }
    } catch (error) {
      console.error("❌ Erro ao enviar dados para Make:", error)
      return false
    }
  }

  // Função para registrar lead
  const registrarLeadCompleto = async () => {
    if (leadRegistrado) return // Evita duplicação

    const tempoTotal = Date.now() - startTime
    const analiseResult = calcularAnalise(respostas, dadosContato)

    console.log("🔥 REGISTRANDO LEAD COMPLETO")

    const leadData: Lead = {
      nome: dadosContato.nome,
      email: dadosContato.email,
      telefone: dadosContato.telefone,
      idade: dadosContato.idade,
      categoria: analiseResult.categoria,
      classificacao_final: analiseResult.classificacaoFinal, // Salvar a nova classificação
      pontuacao: analiseResult.pontuacaoTotal,
      variante: varianteAtual,
      tempo_total: tempoTotal,
      respostas: respostas,
      analise: analiseResult,
    }

    // 1. Registrar lead no Supabase (com fallback para localStorage)
    const leadRegistradoSupabase = await registrarLead(leadData)

    if (leadRegistradoSupabase) {
      console.log("✅ LEAD REGISTRADO:", leadRegistradoSupabase)

      // 2. Enviar para Make webhook
      await enviarParaMake(leadData, analiseResult)

      // Marcar como registrado para evitar duplicação
      setLeadRegistrado(true)
    } else {
      console.error("❌ Falha ao registrar lead")
    }
  }

  const finalizarQuestionario = async () => {
    const tempoTotal = Date.now() - startTime
    const analiseResult = calcularAnalise(respostas, dadosContato)
    setAnalise(analiseResult)

    const dadosCompletos = {
      respostas,
      dadosContato,
      analise: analiseResult,
      tempoTotal,
      variante: varianteAtual,
      timestamp: new Date().toISOString(),
      metadados: {
        totalPerguntas: perguntas.length,
        perguntasRespondidas: Object.keys(respostas).length,
      },
    }

    // Tracking da finalização
    trackEvent("quiz_completed", dadosCompletos)

    // Se o lead ainda não foi registrado, registre-o agora
    if (!leadRegistrado) {
      await registrarLeadCompleto()
    }

    setShowResult(true)
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      trackEvent("navigation_back", { fromStep: currentStep, toStep: currentStep - 1, variante: varianteAtual })
    }
  }

  const renderDepoimento = () => {
    const config = getVarianteConfig()
    if (!config?.features.depoimentos) return null

    const depoimento = DEPOIMENTOS[depoimentoAtual]

    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
        <div className="flex items-start space-x-3">
          <Quote className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
          <div>
            <p className="text-gray-700 text-sm italic mb-2">"{depoimento.texto}"</p>
            <div className="flex items-center justify-between">
              <p className="text-purple-600 font-semibold text-sm">
                {depoimento.nome}, {depoimento.idade} anos
              </p>
              <Badge className="bg-purple-100 text-purple-800 text-xs">{depoimento.resultado}</Badge>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderQuestion = () => {
    const config = getVarianteConfig()
    if (!config) return <div>Carregando...</div>

    if (currentStep <= perguntas.length) {
      const pergunta = perguntas[currentStep - 1]

      if (!pergunta) {
        console.error(`❌ Pergunta não encontrada para step ${currentStep}`)
        return <div>Erro: Pergunta não encontrada</div>
      }

      return (
        <div className="space-y-6">
          {/* Barra de progresso */}
          <div className="w-full bg-purple-200 h-2 rounded-full">
            <div
              className="bg-gradient-to-r from-purple-950 to-purple-700 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Depoimento rotativo */}
          {renderDepoimento()}

          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-950 to-purple-700 flex items-center justify-center text-white font-bold text-sm mr-4">
              {currentStep}
            </div>
            <h2 className="text-xl md:text-2xl font-medium leading-tight flex-1">
              <span className="text-purple-800 font-bold">{pergunta.textoInicial} </span>
              <span className="text-purple-600 font-bold">{pergunta.textoDestaque}</span>
            </h2>
          </div>

          <div className="space-y-4">
            {pergunta.opcoes.map((opcao, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(pergunta.id, opcao.texto, opcao.pontos)}
                className="w-full p-4 bg-white border border-purple-200 rounded-2xl text-left hover:border-purple-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full border-2 border-purple-300 flex items-center justify-center">
                    {respostas[pergunta.id]?.resposta === opcao.texto && (
                      <div className="w-3 h-3 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <span className="text-purple-800 text-sm md:text-base font-bold">{opcao.texto}</span>
                </div>
              </button>
            ))}
          </div>

          {currentStep > 1 && (
            <div className="pt-4">
              <Button
                onClick={prevStep}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                Voltar
              </Button>
            </div>
          )}
        </div>
      )
    }

    return <DadosContato />
  }

  const DadosContato = () => {
    const config = getVarianteConfig()

    const handleInputChange = (field: string, value: string) => {
      setDadosContato((prev) => ({ ...prev, [field]: value }))
      trackEvent("input_change", { field, step: currentStep, variante: varianteAtual })

      // Se o campo for email e for o último passo, e o email for válido, finalize o questionário
      if (field === "email" && currentStep === 16 && value.includes("@") && value.includes(".")) {
        // Pequeno delay para garantir que o estado foi atualizado antes de finalizar
        setTimeout(() => {
          finalizarQuestionario()
        }, 500)
      }
    }

    const handleNext = () => {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
        trackEvent("navigation_next", {
          fromStep: currentStep,
          toStep: currentStep + 1,
          variante: varianteAtual,
        })
      } else {
        // Se for o último passo e o email já foi validado e finalizado, este botão não deve ser clicável
        // Ou pode ser um botão de "Revisar" ou "Voltar ao Início"
        finalizarQuestionario() // Garante que finalize se o usuário clicar no botão
      }
    }

    const isStepValid = () => {
      switch (currentStep) {
        case 13:
          return dadosContato.nome.trim().length > 2
        case 14:
          return (
            dadosContato.idade.trim() !== "" &&
            Number.parseInt(dadosContato.idade) > 0 &&
            Number.parseInt(dadosContato.idade) < 120
          )
        case 15:
          return dadosContato.telefone.trim().length >= 10
        case 16:
          return dadosContato.email.trim().includes("@") && dadosContato.email.trim().includes(".")
        default:
          return false
      }
    }

    const renderStep = () => {
      switch (currentStep) {
        case 13:
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl md:text-2xl font-semibold text-purple-800">Qual é o seu nome completo?</h3>
              </div>
              <Input
                placeholder="Digite seu nome completo"
                value={dadosContato.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                className="border-purple-300 focus:border-purple-600 focus:ring-purple-600 text-lg p-4"
                autoFocus
              />
            </div>
          )
        case 14:
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl md:text-2xl font-semibold text-purple-800">Qual é a sua idade?</h3>
              </div>
              <Input
                type="number"
                placeholder="Digite sua idade"
                value={dadosContato.idade}
                onChange={(e) => handleInputChange("idade", e.target.value)}
                className="border-purple-300 focus:border-purple-600 focus:ring-purple-600 text-lg p-4"
                min="18"
                max="120"
                autoFocus
              />
            </div>
          )
        case 15:
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Phone className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl md:text-2xl font-semibold text-purple-800">Qual é o seu telefone?</h3>
              </div>
              <Input
                placeholder="(11) 99999-9999"
                value={dadosContato.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                className="border-purple-300 focus:border-purple-600 focus:ring-purple-600 text-lg p-4"
                autoFocus
              />
            </div>
          )
        case 16:
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl md:text-2xl font-semibold text-purple-800">Qual é o seu e-mail?</h3>
              </div>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={dadosContato.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="border-purple-300 focus:border-purple-600 focus:ring-purple-600 text-lg p-4"
                autoFocus
              />
            </div>
          )
        default:
          return null
      }
    }

    return (
      <div className="space-y-6">
        {/* Barra de progresso para dados de contato */}
        <div className="w-full bg-purple-200 h-2 rounded-full">
          <div
            className="bg-gradient-to-r from-purple-950 to-purple-700 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Depoimento rotativo */}
        {renderDepoimento()}

        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-950 to-purple-700 flex items-center justify-center text-white font-bold text-sm mr-4">
            {currentStep}
          </div>
          <div className="flex-1">{renderStep()}</div>
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={prevStep} variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
            Voltar
          </Button>

          {/* Botões Continuar (testbx8) */}
          {isStepValid() && (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-950 to-purple-700 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg px-8"
            >
              {config?.features.botoesContinuar && currentStep < 16
                ? "Continuar"
                : config?.features.alteracaoTexto
                  ? "Obter Avaliação Nutricional"
                  : "Finalizar Avaliação"}
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (showResult && analise) {
    return <ResultadoAnalise analise={analise} dadosContato={dadosContato} varianteConfig={getVarianteConfig()} />
  }

  const config = getVarianteConfig()
  if (!config) return <div>Carregando...</div>

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white rounded-3xl">
        <CardHeader className="text-center pb-4 px-6">
          <CardTitle className="text-3xl md:text-4xl font-bold text-purple-800 mb-3 tracking-tight">
            Nutrição na Menopausa
          </CardTitle>

          {/* Badge com efeitos visuais (testbx9) */}
          <Badge
            className={`mx-auto bg-gradient-to-r from-purple-950 to-purple-700 text-white border-0 px-4 py-2 text-sm rounded-full font-medium ${
              config.features.efeitosVisuais ? "animate-pulse shadow-lg shadow-purple-500/50" : ""
            }`}
          >
            {config.features.alteracaoTexto ? "Avaliação Nutricional Gratuita" : "Avaliação Nutricional Gratuita"}
          </Badge>

          <p className="text-sm text-gray-500 mt-2 font-medium">
            {config.features.alteracaoTexto ? "(Sem Remédios ou Hormônios)" : "(100% Natural)"}
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-8">{renderQuestion()}</CardContent>
      </Card>
    </div>
  )
}

function ResultadoAnalise({
  analise,
  dadosContato,
  varianteConfig,
}: {
  analise: AnaliseResultado
  dadosContato: DadosContato
  varianteConfig?: VarianteConfig
}) {
  const handleAgendamento = () => {
    trackEvent("agendamento_click", { valor: 197, variante: varianteConfig?.id })
    // Redirecionar para página de agendamento
    window.open("https://calendly.com/nutricionista-menopausa", "_blank")
  }

  const handleConcluir = () => {
    trackEvent("resultado_concluir", { variante: varianteConfig?.id })
    // Redirecionar para o WhatsApp
    const whatsappMessage = encodeURIComponent(
      `Olá! Completei o questionário e minha classificação é ${analise.classificacaoFinal}. Gostaria de conversar sobre minha avaliação nutricional. Meu nome é ${dadosContato.nome} e meu e-mail é ${dadosContato.email}.`,
    )
    // Substitua 'SEU_NUMERO_DE_WHATSAPP' pelo número de telefone da sua equipe, incluindo o código do país (ex: 5511999999999)
    window.open(`https://wa.me/SEU_NUMERO_DE_WHATSAPP?text=${whatsappMessage}`, "_blank")
  }

  const getUrgenciaColor = (urgencia: "baixa" | "media" | "alta") => {
    switch (urgencia) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200"
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "baixa":
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  const getUrgenciaIcon = (urgencia: "baixa" | "media" | "alta") => {
    switch (urgencia) {
      case "alta":
        return <AlertTriangle className="w-4 h-4" />
      case "media":
        return <Clock className="w-4 h-4" />
      case "baixa":
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const getUrgenciaText = (urgencia: "baixa" | "media" | "alta") => {
    switch (urgencia) {
      case "alta":
        return "Urgente"
      case "media":
        return "Importante"
      case "baixa":
        return "Leve"
    }
  }

  const getClassificacaoColor = (classificacao: string) => {
    switch (classificacao) {
      case "AAA":
        return "bg-red-100 text-red-800"
      case "AA":
        return "bg-orange-100 text-orange-800"
      case "A":
        return "bg-yellow-100 text-yellow-800"
      case "B":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Card className="shadow-xl border-0 bg-white rounded-3xl">
          <div className="w-full bg-purple-200 h-2 rounded-t-3xl">
            <div className="bg-gradient-to-r from-purple-950 to-purple-700 h-2 rounded-t-3xl w-full" />
          </div>

          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-950 to-purple-700 rounded-full flex items-center justify-center mb-4">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-purple-800 mb-2">AVALIAÇÃO CONCLUÍDA!</h2>
              <p className="text-gray-600">Sua análise nutricional está pronta</p>
            </div>

            <div className="mb-6 p-4 bg-purple-50 rounded-2xl border-l-4 border-purple-600">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-purple-800">Resultado da sua avaliação</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {analise.descricao} Você está com <span className="font-semibold">{analise.categoria}</span> que podem
                ser controlados naturalmente através da alimentação adequada.
              </p>
              <div className="mt-3 flex items-center justify-center">
                <Badge className={getClassificacaoColor(analise.classificacaoFinal)}>
                  Classificação: {analise.classificacaoFinal}
                </Badge>
              </div>
            </div>

            {analise.sintomas.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Pontos que precisam de atenção nutricional
                </h3>
                <div className="space-y-3">
                  {analise.sintomas.map((sintoma, index) => (
                    <div key={index} className="p-3 bg-white border border-purple-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-800">{sintoma.nome}</h4>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getUrgenciaColor(sintoma.urgencia)}`}
                        >
                          {getUrgenciaIcon(sintoma.urgencia)}
                          <span className="capitalize">{getUrgenciaText(sintoma.urgencia)}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{sintoma.explicacao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6 p-4 bg-purple-50 rounded-2xl border-l-4 border-purple-600">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-purple-800">Excelentes notícias</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Mulheres com sintomas como os seus têm obtido resultados incríveis com acompanhamento nutricional
                especializado. <span className="font-semibold text-purple-700">{analise.expectativa}</span> sem usar
                remédios ou hormônios.
              </p>
            </div>

            {/* Botão de agendamento (testbx5+) */}
            {varianteConfig?.features.botaoAgendamento && (
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-800">Agende sua consulta nutricional</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Consulta especializada em nutrição para menopausa - tratamento 100% natural.
                </p>
                <Button
                  onClick={handleAgendamento}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 text-lg font-semibold shadow-lg rounded-2xl"
                >
                  Agendar Consulta Nutricional - R$ 197
                </Button>
              </div>
            )}

            <div className="mb-6 p-4 bg-purple-50 rounded-2xl border-l-4 border-purple-500">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-purple-800">Próximos passos</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Nossa <span className="font-semibold">nutricionista especializada em menopausa</span> vai entrar em
                contato para conversar sobre um plano alimentar personalizado para você.{" "}
                <span className="font-semibold">Tratamento 100% natural, sem remédios ou hormônios</span>.
              </p>
            </div>

            <div className="text-center">
              <Button
                onClick={handleConcluir}
                className="w-full bg-gradient-to-r from-purple-950 to-purple-700 hover:from-purple-700 hover:to-purple-600 text-white py-4 text-lg font-semibold shadow-lg rounded-2xl animate-pulse-button"
              >
                Falar com a Equipe (WhatsApp)
              </Button>
              <p className="text-xs text-gray-500 mt-2">Clique para falar com nossa equipe no WhatsApp</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
