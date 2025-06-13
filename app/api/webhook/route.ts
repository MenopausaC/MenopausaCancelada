import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase = null
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Função para detectar informações do dispositivo
function detectarInformacoesDispositivo(userAgent: string) {
  const detectarDispositivo = (ua: string) => {
    if (/Mobile|Android|iPhone/.test(ua)) return "Mobile"
    if (/Tablet|iPad/.test(ua)) return "Tablet"
    return "Desktop"
  }

  const detectarSO = (ua: string) => {
    if (/Windows NT 10/.test(ua)) return "Windows 10"
    if (/Windows NT/.test(ua)) return "Windows"
    if (/Mac OS X/.test(ua)) return "macOS"
    if (/Linux/.test(ua)) return "Linux"
    if (/Android/.test(ua)) return "Android"
    if (/iPhone|iPad/.test(ua)) return "iOS"
    return "Desconhecido"
  }

  const detectarNavegador = (ua: string) => {
    if (/Edg/.test(ua)) return "Edge"
    if (/Chrome/.test(ua)) return "Chrome"
    if (/Firefox/.test(ua)) return "Firefox"
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari"
    return "Desconhecido"
  }

  return {
    dispositivo: detectarDispositivo(userAgent),
    sistema_operacional: detectarSO(userAgent),
    navegador: detectarNavegador(userAgent),
  }
}

// Função para validar dados obrigatórios
function validarDados(dados: any) {
  const erros = []

  if (!dados.dadosContato) {
    erros.push("dadosContato é obrigatório")
  } else {
    if (!dados.dadosContato.nome || dados.dadosContato.nome.trim() === "") {
      erros.push("Nome é obrigatório")
    }
    if (!dados.dadosContato.email || dados.dadosContato.email.trim() === "") {
      erros.push("Email é obrigatório")
    }
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (dados.dadosContato.email && !emailRegex.test(dados.dadosContato.email)) {
      erros.push("Email inválido")
    }
  }

  return erros
}

// Função para processar e limpar dados
function processarDados(dados: any, request: Request) {
  const userAgent = request.headers.get("user-agent") || ""
  const infoDispositivo = detectarInformacoesDispositivo(userAgent)

  // Extrair dados com fallbacks seguros
  const dadosContato = dados.dadosContato || {}
  const analise = dados.analise || {}
  const qualificacaoLead = dados.qualificacaoLead || {}
  const respostas = dados.respostas || {}

  // Processar idade de forma segura
  let idade = null
  if (dadosContato.idade) {
    const idadeNum = Number.parseInt(dadosContato.idade.toString())
    if (!isNaN(idadeNum) && idadeNum > 0 && idadeNum < 150) {
      idade = idadeNum
    }
  }

  // Processar pontuações de forma segura
  const pontuacaoTotal = analise.pontuacaoTotal ? Number(analise.pontuacaoTotal) : 0
  const scoreQualificacao = qualificacaoLead.score ? Number(qualificacaoLead.score) : 0
  const prioridade = qualificacaoLead.prioridade ? Number(qualificacaoLead.prioridade) : null

  // Processar tempos de forma segura
  const tempoTotal = dados.tempoTotal ? Number(dados.tempoTotal) : null
  const tempoMedioResposta = qualificacaoLead.comportamento?.tempoMedioResposta
    ? Number(qualificacaoLead.comportamento.tempoMedioResposta)
    : null

  return {
    // Dados básicos do contato
    nome: dadosContato.nome?.trim() || "",
    email: dadosContato.email?.trim().toLowerCase() || "",
    telefone: dadosContato.telefone?.trim() || null,
    idade: idade,

    // Análise dos sintomas
    categoria_sintomas: analise.categoria?.trim() || null,
    pontuacao_total: pontuacaoTotal,
    urgencia: analise.urgencia?.toLowerCase() || null,
    expectativa_melhora: analise.expectativa?.trim() || null,

    // Qualificação do lead
    score_qualificacao: scoreQualificacao,
    categoria_lead: qualificacaoLead.categoria?.toUpperCase() || null,
    classificacao_final: qualificacaoLead.classificacaoFinal?.toUpperCase() || null, // Adicionado
    prioridade: prioridade,
    motivos_qualificacao: qualificacaoLead.motivos ? JSON.stringify(qualificacaoLead.motivos) : null,

    // Dados estruturados (JSONB)
    sintomas_identificados: analise.sintomas || null,
    respostas_detalhadas: respostas || null,

    // Métricas de comportamento
    tempo_total_questionario: tempoTotal,
    tempo_medio_resposta: tempoMedioResposta,
    voltas_perguntas: qualificacaoLead.comportamento?.voltasPerguntas || 0,
    engajamento: qualificacaoLead.comportamento?.engajamento?.toUpperCase() || null,
    hesitacao_perguntas: null,
    tempo_tela_final: null,

    // Metadados
    timestamp: dados.timestamp || new Date().toISOString(),
    user_agent: userAgent,
    origem: dados.origem?.trim() || "questionario-menopausa",
    versao_questionario: dados.variante?.trim() || "default",
    acao: "lead_registrado",

    // Informações técnicas
    dispositivo: infoDispositivo.dispositivo,
    sistema_operacional: infoDispositivo.sistema_operacional,
    navegador: infoDispositivo.navegador,
    resolucao: null,
    referrer: request.headers.get("referer") || null,

    // UTM parameters (se disponíveis no futuro)
    utm_source: dados.utm_source || null,
    utm_medium: dados.utm_medium || null,
    utm_campaign: dados.utm_campaign || null,

    // IP address
    ip_address:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown",

    // Timestamp de criação
    criado_em: new Date().toISOString(),
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    console.log("🎯 Webhook recebeu requisição")

    // Verificar se o Supabase está configurado
    if (!supabase) {
      console.warn("⚠️ Supabase não configurado - processando dados sem salvar")
    }

    // Obter os dados do corpo da requisição
    let dados
    try {
      dados = await request.json()
    } catch (error) {
      console.error("❌ Erro ao parsear JSON:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Dados JSON inválidos",
          error: "invalid_json",
        },
        { status: 400 },
      )
    }

    console.log("📦 Dados recebidos:", {
      origem: dados.origem,
      variante: dados.variante,
      temContato: !!dados.dadosContato,
      temAnalise: !!dados.analise,
      temQualificacao: !!dados.qualificacaoLead,
    })

    // Validar dados obrigatórios
    const errosValidacao = validarDados(dados)
    if (errosValidacao.length > 0) {
      console.error("❌ Erros de validação:", errosValidacao)
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: errosValidacao,
          received_data: dados,
        },
        { status: 400 },
      )
    }

    // Processar e limpar dados
    const dadosProcessados = processarDados(dados, request)

    console.log("🔄 Dados processados:", {
      nome: dadosProcessados.nome,
      email: dadosProcessados.email,
      categoria_lead: dadosProcessados.categoria_lead,
      classificacao_final: dadosProcessados.classificacao_final, // Log da nova classificação
      pontuacao_total: dadosProcessados.pontuacao_total,
      dispositivo: dadosProcessados.dispositivo,
      origem: dadosProcessados.origem,
    })

    if (supabase) {
      // Verificar se já existe um lead com o mesmo email (opcional)
      const { data: leadExistente } = await supabase
        .from("QUIZ_DASHBOARD")
        .select("id, email, criado_em")
        .eq("email", dadosProcessados.email)
        .order("criado_em", { ascending: false })
        .limit(1)

      if (leadExistente && leadExistente.length > 0) {
        console.log("⚠️ Lead já existe com este email:", leadExistente[0])
        // Continuar salvando mesmo assim, mas logar
      }

      // Salvar no Supabase
      const { data, error } = await supabase.from("QUIZ_DASHBOARD").insert([dadosProcessados]).select()

      if (error) {
        console.error("❌ Erro ao salvar no Supabase:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Erro ao salvar no banco de dados",
            error: error.message,
            error_details: error.details,
            error_hint: error.hint,
            supabase_error: error,
          },
          { status: 500 },
        )
      }

      const processTime = Date.now() - startTime
      console.log(`✅ Lead salvo com sucesso no Supabase em ${processTime}ms:`, {
        id: data[0]?.id,
        nome: data[0]?.nome,
        email: data[0]?.email,
        categoria_lead: data[0]?.categoria_lead,
        classificacao_final: data[0]?.classificacao_final, // Log da nova classificação
      })

      return NextResponse.json({
        success: true,
        message: "Lead processado e salvo com sucesso na tabela QUIZ DASHBOARD",
        leadId: data[0]?.id,
        processTime: `${processTime}ms`,
        timestamp: new Date().toISOString(),
        saved_data: {
          id: data[0]?.id,
          nome: data[0]?.nome,
          email: data[0]?.email,
          categoria_lead: data[0]?.categoria_lead,
          classificacao_final: data[0]?.classificacao_final, // Retornar a nova classificação
          pontuacao_total: data[0]?.pontuacao_total,
          urgencia: data[0]?.urgencia,
          dispositivo: data[0]?.dispositivo,
          origem: data[0]?.origem,
          criado_em: data[0]?.criado_em,
        },
      })
    } else {
      const processTime = Date.now() - startTime
      console.log(`⚠️ Dados processados sem salvar (Supabase não configurado) em ${processTime}ms`)

      return NextResponse.json({
        success: true,
        message: "Dados processados com sucesso (Supabase não configurado)",
        processTime: `${processTime}ms`,
        processed_data: {
          nome: dadosProcessados.nome,
          email: dadosProcessados.email,
          categoria_lead: dadosProcessados.categoria_lead,
          classificacao_final: dadosProcessados.classificacao_final, // Retornar a nova classificação
          pontuacao_total: dadosProcessados.pontuacao_total,
          urgencia: dadosProcessados.urgencia,
          dispositivo: dadosProcessados.dispositivo,
          origem: dadosProcessados.origem,
        },
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    const processTime = Date.now() - startTime
    console.error("❌ Erro crítico ao processar webhook:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: (error as Error).message,
        processTime: `${processTime}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Método GET para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook está funcionando",
    timestamp: new Date().toISOString(),
    supabase_configured: !!supabase,
  })
}
