import { createClient } from "@supabase/supabase-js"

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificação de segurança
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Variáveis do Supabase não configuradas. Usando modo offline.")
}

// Criar cliente apenas se as variáveis estiverem definidas
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Tipos para o banco de dados
export interface Lead {
  id?: string
  nome: string
  email: string
  telefone?: string
  idade?: string
  categoria?: string
  classificacao_final?: string // Nova propriedade para a classificação AAA, AA, A, B
  pontuacao?: number
  variante?: string
  tempo_total?: number
  respostas?: any
  analise?: any
  created_at?: string
  updated_at?: string
}

export interface Session {
  id?: string
  variante?: string
  user_agent?: string
  url?: string
  ip_address?: string
  created_at?: string
}

// Função para verificar se o Supabase está configurado
const isSupabaseConfigured = () => {
  return supabase !== null
}

// Função para registrar uma sessão/view
export async function registrarView(dados: {
  variante: string
  userAgent: string
  url: string
}) {
  if (!isSupabaseConfigured()) {
    console.log("📊 Supabase não configurado - registrando view localmente:", dados)

    // Fallback para localStorage
    try {
      if (typeof window !== "undefined") {
        const views = JSON.parse(localStorage.getItem("menopausa_views") || "[]")
        views.push({
          ...dados,
          timestamp: new Date().toISOString(),
        })
        localStorage.setItem("menopausa_views", JSON.stringify(views))
      }
      return { success: true, mode: "local" }
    } catch (error) {
      console.error("❌ Erro ao salvar view localmente:", error)
      return null
    }
  }

  try {
    console.log("📊 Registrando view no Supabase:", dados)

    const { data, error } = await supabase!
      .from("sessions")
      .insert([
        {
          variante: dados.variante,
          user_agent: dados.userAgent,
          url: dados.url,
        },
      ])
      .select()

    if (error) {
      console.error("❌ Erro ao registrar view:", error)
      return null
    }

    console.log("✅ View registrada com sucesso:", data)
    return data[0]
  } catch (error) {
    console.error("❌ Erro geral ao registrar view:", error)
    return null
  }
}

// Função para registrar um lead
export async function registrarLead(lead: Lead) {
  let leadComId: Lead | null = null

  if (!isSupabaseConfigured()) {
    console.log("📊 Supabase não configurado - registrando lead localmente:", lead)

    // Fallback para localStorage
    try {
      if (typeof window !== "undefined") {
        const leads = JSON.parse(localStorage.getItem("menopausa_leads") || "[]")
        leadComId = {
          ...lead,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        }
        leads.push(leadComId)
        localStorage.setItem("menopausa_leads", JSON.stringify(leads))

        // Também salvar nas métricas antigas para compatibilidade
        const analytics = JSON.parse(
          localStorage.getItem("menopausa_data") || '{"views": 0, "completions": 0, "leads": []}',
        )
        analytics.leads.push(leadComId)
        analytics.completions++
        localStorage.setItem("menopausa_data", JSON.stringify(analytics))
      }

      return { success: true, mode: "local", data: leadComId }
    } catch (error) {
      console.error("❌ Erro ao salvar lead localmente:", error)
      return null
    }
  }

  try {
    console.log("📊 Registrando lead no Supabase:", lead)

    const { data, error } = await supabase!.from("leads").insert([lead]).select()

    if (error) {
      console.error("❌ Erro ao registrar lead:", error)
      return null
    }

    console.log("✅ Lead registrado com sucesso:", data)

    // Também registrar na tabela QUIZ_DASHBOARD se existir
    try {
      // Garantir que a variante seja salva corretamente
      const varianteCode = lead.variante || "default"

      // Determinar a qualificação do lead com base na pontuação
      let categoriaLead = "NÃO CLASSIFICADO"
      let prioridade = 1

      if (lead.analise?.categoria) {
        categoriaLead = lead.analise.categoria
      } else if (lead.pontuacao) {
        if (lead.pontuacao > 50) {
          categoriaLead = "QUENTE"
          prioridade = 5
        } else if (lead.pontuacao > 30) {
          categoriaLead = "MORNO"
          prioridade = 3
        } else {
          categoriaLead = "FRIO"
          prioridade = 1
        }
      }

      const quizData = {
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        idade: lead.idade ? Number.parseInt(lead.idade) : null,
        categoria_sintomas: lead.categoria,
        pontuacao_total: lead.pontuacao,
        versao_questionario: varianteCode, // Garantir que a variante seja salva corretamente
        variante: varianteCode, // Campo adicional para garantir compatibilidade
        tempo_total_questionario: lead.tempo_total, // Salvar tempo total
        respostas_detalhadas: lead.respostas ? JSON.stringify(lead.respostas) : null,
        sintomas_identificados: lead.analise?.sintomas ? JSON.stringify(lead.analise.sintomas) : null,
        categoria_lead: categoriaLead, // Garantir que a qualificação seja salva
        classificacao_final: lead.classificacao_final, // Salvar a nova classificação
        score_qualificacao: lead.analise?.score || lead.pontuacao || 0,
        prioridade: lead.analise?.prioridade || prioridade,
        motivos_qualificacao: lead.analise?.motivos ? JSON.stringify(lead.analise.motivos) : null,
        engajamento: lead.analise?.comportamento?.engajamento || "MÉDIO",
        tempo_medio_resposta: lead.analise?.comportamento?.tempoMedioResposta || 0,
        voltas_perguntas: lead.analise?.comportamento?.voltasPerguntas || 0,
        origem: "questionario_direto",
        acao: "lead_registrado",
      }

      console.log("📊 Salvando dados no QUIZ_DASHBOARD:", quizData)

      const { data: dashboardData, error: dashboardError } = await supabase!
        .from("QUIZ_DASHBOARD")
        .insert([quizData])
        .select()

      if (dashboardError) {
        console.error("❌ Erro ao registrar lead no QUIZ_DASHBOARD:", dashboardError)
      } else {
        console.log("✅ Lead também registrado na tabela QUIZ_DASHBOARD:", dashboardData)
      }
    } catch (dashboardError) {
      console.error("❌ Erro geral ao registrar lead no QUIZ_DASHBOARD:", dashboardError)
    }

    return data[0]
  } catch (error) {
    console.error("❌ Erro geral ao registrar lead:", error)
    return null
  }
}

// Função para buscar métricas
export async function buscarMetricas() {
  console.log("📊 Iniciando busca de métricas...")
  console.log("- Supabase URL:", !!supabaseUrl)
  console.log("- Supabase Key:", !!supabaseAnonKey)
  console.log("- Cliente Supabase:", !!supabase)

  // Mapeamento de nomes das variantes
  const nomeVariantes = {
    testbx4: "Base Completa",
    testbx5: "Com Agendamento",
    testbx6: "Com Depoimentos",
    testbx7: "Texto Alterado",
    testbx8: "Botões Continuar",
    testbx9: "Efeitos Visuais",
    default: "Padrão",
  }

  // Forçar uso do Supabase se as variáveis estiverem definidas
  const forceSupabase = !!supabaseUrl && !!supabaseAnonKey

  if (!forceSupabase) {
    console.log("📊 Supabase não configurado - buscando métricas localmente")

    // Fallback para localStorage
    try {
      if (typeof window === "undefined") {
        return {
          totalViews: 0,
          totalLeads: 0,
          leads: [],
          variantesViews: {},
          variantesLeads: {},
          taxaConversao: "0",
          mode: "server",
        }
      }

      const views = JSON.parse(localStorage.getItem("menopausa_views") || "[]")
      const leads = JSON.parse(localStorage.getItem("menopausa_leads") || "[]")

      // Processar métricas por variante
      const variantesViews = {}
      const variantesLeads = {}
      const variantesQualificacao = {}
      const variantesConversao = {}
      const variantesTempoMedio = {} // Novo para tempo médio

      views.forEach((view) => {
        const variante = view.variante || "default"
        const nomeVariante = nomeVariantes[variante] || variante
        variantesViews[nomeVariante] = (variantesViews[nomeVariante] || 0) + 1
      })

      leads.forEach((lead) => {
        const variante = lead.variante || "default"
        const nomeVariante = nomeVariantes[variante] || variante

        // Contar leads
        variantesLeads[nomeVariante] = (variantesLeads[nomeVariante] || 0) + 1

        // Inicializar qualificação se não existir
        if (!variantesQualificacao[nomeVariante]) {
          variantesQualificacao[nomeVariante] = {
            quentes: 0,
            mornos: 0,
            frios: 0,
            urgentes: 0,
            prioridadeAlta: 0,
            pontuacaoMedia: 0,
            totalPontuacao: 0,
            count: 0,
            classificacaoAAA: 0, // Novas classificações
            classificacaoAA: 0,
            classificacaoA: 0,
            classificacaoB: 0,
          }
        }

        const qual = variantesQualificacao[nomeVariante]

        // Contar por categoria de lead
        if (lead.analise?.categoria === "QUENTE" || lead.analise?.categoria === "MUITO_QUENTE") qual.quentes++
        else if (lead.analise?.categoria === "MORNO") qual.mornos++
        else if (lead.analise?.categoria === "FRIO") qual.frios++

        // Contar por nova classificação
        if (lead.classificacao_final === "AAA") qual.classificacaoAAA++
        else if (lead.classificacao_final === "AA") qual.classificacaoAA++
        else if (lead.classificacao_final === "A") qual.classificacaoA++
        else if (lead.classificacao_final === "B") qual.classificacaoB++

        // Contar urgência
        if (lead.analise?.urgencia === "alta" || lead.analise?.urgencia === "ALTA") qual.urgentes++

        // Contar prioridade alta (4 ou 5)
        if (lead.analise?.prioridade && lead.analise?.prioridade >= 4) qual.prioridadeAlta++

        // Somar pontuação para média
        if (lead.pontuacao && typeof lead.pontuacao === "number") {
          qual.totalPontuacao += lead.pontuacao
          qual.count++
        }

        // Somar tempo total para média
        if (lead.tempo_total && typeof lead.tempo_total === "number") {
          if (!variantesTempoMedio[nomeVariante]) {
            variantesTempoMedio[nomeVariante] = { totalTempo: 0, count: 0 }
          }
          variantesTempoMedio[nomeVariante].totalTempo += lead.tempo_total
          variantesTempoMedio[nomeVariante].count++
        }

        // Contar conversões
        if (lead.analise?.converteu) {
          if (!variantesConversao[nomeVariante]) {
            variantesConversao[nomeVariante] = {
              conversoes: 0,
              receita: 0,
            }
          }
          variantesConversao[nomeVariante].conversoes++
          if (lead.analise?.valor_conversao && typeof lead.analise?.valor_conversao === "number") {
            variantesConversao[nomeVariante].receita += lead.analise?.valor_conversao
          }
        }
      })

      // Calcular médias de pontuação e tempo
      Object.keys(variantesQualificacao).forEach((variante) => {
        const qual = variantesQualificacao[variante]
        if (qual.count > 0) {
          qual.pontuacaoMedia = Math.round(qual.totalPontuacao / qual.count)
        }
      })

      Object.keys(variantesTempoMedio).forEach((variante) => {
        const tempo = variantesTempoMedio[variante]
        if (tempo.count > 0) {
          variantesTempoMedio[variante].tempoMedio = Math.round(tempo.totalTempo / tempo.count / 1000) // em segundos
        }
      })

      const metricas = {
        totalViews: views.length,
        totalLeads: leads.length,
        leads: leads.slice(-50), // Últimos 50 leads
        variantesViews,
        variantesLeads,
        variantesQualificacao,
        variantesConversao,
        variantesTempoMedio, // Incluir tempo médio por variante
        taxaConversao: views.length > 0 ? ((leads.length / views.length) * 100).toFixed(1) : "0",
        taxaConversaoReal: "0",
        receitaTotal: "0",
        tempoMedioConversao: "0",
        mode: "local",
      }

      console.log("✅ Métricas locais carregadas:", metricas)
      return metricas
    } catch (error) {
      console.error("❌ Erro ao buscar métricas locais:", error)
      return {
        totalViews: 0,
        totalLeads: 0,
        leads: [],
        variantesViews: {},
        variantesLeads: {},
        variantesQualificacao: {},
        variantesConversao: {},
        variantesTempoMedio: {},
        taxaConversao: "0",
        taxaConversaoReal: "0",
        receitaTotal: "0",
        tempoMedioConversao: "0",
        mode: "local",
      }
    }
  }

  // Se chegou aqui, usar Supabase
  try {
    console.log("📊 Usando Supabase para buscar métricas...")

    // Inicializar variáveis
    const variantesViews = {}
    const variantesLeads = {}
    const variantesQualificacao = {}
    const variantesConversao = {}
    const variantesTempoMedio = {} // Novo para tempo médio

    // Buscar total de views
    const { count: totalViews } = await supabase!.from("sessions").select("*", { count: "exact", head: true })

    // Buscar total de leads da tabela QUIZ_DASHBOARD
    const { count: totalLeads } = await supabase!.from("QUIZ_DASHBOARD").select("*", { count: "exact", head: true })

    // Buscar leads recentes
    const { data: leadsRecentes } = await supabase!
      .from("QUIZ_DASHBOARD")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(100)

    // Buscar conversões
    let conversoes = []
    let totalConversoes = 0
    try {
      const result = await supabase!
        .from("conversoes")
        .select("*", { count: "exact" })
        .order("criado_em", { ascending: false })

      conversoes = result.data || []
      totalConversoes = result.count || 0
    } catch (error) {
      console.error("❌ Erro ao buscar conversões:", error)
      // Fallback se tabela não existir
    }

    // DEBUG: Verificar estrutura da tabela QUIZ_DASHBOARD
    try {
      const { data: sampleLead } = await supabase!.from("QUIZ_DASHBOARD").select("*").limit(1)
      if (sampleLead && sampleLead.length > 0) {
        console.log("🔍 Estrutura de um lead:", Object.keys(sampleLead[0]))
        console.log("🔍 Exemplo de variante:", sampleLead[0].versao_questionario || sampleLead[0].variante)
      }
    } catch (error) {
      console.error("❌ Erro ao verificar estrutura:", error)
    }

    // Buscar métricas por variante - Views
    const { data: metricasPorVariante } = await supabase!.from("sessions").select("variante")

    // Buscar métricas por variante - Leads (verificando todos os campos possíveis)
    const { data: leadsPorVariante } = await supabase!.from("QUIZ_DASHBOARD").select("*")

    console.log("📊 Dados brutos - Views:", metricasPorVariante?.length || 0)
    console.log("📊 Dados brutos - Leads:", leadsPorVariante?.length || 0)

    // Processar views por variante
    if (metricasPorVariante && metricasPorVariante.length > 0) {
      metricasPorVariante.forEach((session) => {
        const variante = session.variante || "default"
        const nomeVariante = nomeVariantes[variante] || variante
        variantesViews[nomeVariante] = (variantesViews[nomeVariante] || 0) + 1
      })
    }

    // Processar leads por variante - verificando múltiplos campos possíveis
    if (leadsPorVariante && leadsPorVariante.length > 0) {
      leadsPorVariante.forEach((lead) => {
        // Tentar encontrar a variante em vários campos possíveis
        const varianteRaw = lead.versao_questionario || lead.variante || lead.origem || "default"

        // Extrair o código da variante (testbx4, testbx5, etc.)
        let varianteCode = varianteRaw

        // Se a variante contém testbx seguido de um número, extrair apenas essa parte
        const match = varianteRaw.match(/testbx[0-9]+/)
        if (match) {
          varianteCode = match[0]
        }

        const nomeVariante = nomeVariantes[varianteCode] || varianteCode

        console.log(`🔍 Lead ${lead.id}: variante=${varianteRaw}, código=${varianteCode}, nome=${nomeVariante}`)

        // Contar leads
        variantesLeads[nomeVariante] = (variantesLeads[nomeVariante] || 0) + 1

        // Inicializar qualificação
        if (!variantesQualificacao[nomeVariante]) {
          variantesQualificacao[nomeVariante] = {
            quentes: 0,
            mornos: 0,
            frios: 0,
            urgentes: 0,
            prioridadeAlta: 0,
            pontuacaoMedia: 0,
            totalPontuacao: 0,
            count: 0,
            classificacaoAAA: 0, // Novas classificações
            classificacaoAA: 0,
            classificacaoA: 0,
            classificacaoB: 0,
          }
        }

        const qual = variantesQualificacao[nomeVariante]

        // Processar qualificação
        if (lead.categoria_lead === "QUENTE") qual.quentes++
        else if (lead.categoria_lead === "MORNO") qual.mornos++
        else if (lead.categoria_lead === "FRIO") qual.frios++

        // Processar nova classificação
        if (lead.classificacao_final === "AAA") qual.classificacaoAAA++
        else if (lead.classificacao_final === "AA") qual.classificacaoAA++
        else if (lead.classificacao_final === "A") qual.classificacaoA++
        else if (lead.classificacao_final === "B") qual.classificacaoB++

        if (lead.urgencia === "alta") qual.urgentes++
        if (lead.prioridade >= 4) qual.prioridadeAlta++

        if (lead.pontuacao_total) {
          qual.totalPontuacao += lead.pontuacao_total
          qual.count++
        }

        // Somar tempo total para média
        if (lead.tempo_total_questionario && typeof lead.tempo_total_questionario === "number") {
          if (!variantesTempoMedio[nomeVariante]) {
            variantesTempoMedio[nomeVariante] = { totalTempo: 0, count: 0 }
          }
          variantesTempoMedio[nomeVariante].totalTempo += lead.tempo_total_questionario
          variantesTempoMedio[nomeVariante].count++
        }

        // Processar conversões
        if (lead.converteu) {
          if (!variantesConversao[nomeVariante]) {
            variantesConversao[nomeVariante] = { conversoes: 0, receita: 0 }
          }
          variantesConversao[nomeVariante].conversoes++
          if (lead.valor_conversao) {
            variantesConversao[nomeVariante].receita += lead.valor_conversao
          }
        }
      })

      // Calcular médias
      Object.keys(variantesQualificacao).forEach((variante) => {
        const qual = variantesQualificacao[variante]
        if (qual.count > 0) {
          qual.pontuacaoMedia = Math.round(qual.totalPontuacao / qual.count)
        }
      })

      Object.keys(variantesTempoMedio).forEach((variante) => {
        const tempo = variantesTempoMedio[variante]
        if (tempo.count > 0) {
          variantesTempoMedio[variante].tempoMedio = Math.round(tempo.totalTempo / tempo.count / 1000) // em segundos
        }
      })
    }

    // Se não há dados de variantes, criar pelo menos uma entrada padrão
    if (Object.keys(variantesViews).length === 0 && totalViews > 0) {
      variantesViews["Padrão"] = totalViews
    }

    if (Object.keys(variantesLeads).length === 0 && totalLeads > 0) {
      variantesLeads["Padrão"] = totalLeads
      variantesQualificacao["Padrão"] = {
        quentes: 0,
        mornos: 0,
        frios: 0,
        urgentes: 0,
        prioridadeAlta: 0,
        pontuacaoMedia: 0,
        totalPontuacao: 0,
        count: 0,
        classificacaoAAA: 0,
        classificacaoAA: 0,
        classificacaoA: 0,
        classificacaoB: 0,
      }
      variantesTempoMedio["Padrão"] = { totalTempo: 0, count: 0, tempoMedio: 0 }
    }

    // Calcular métricas de conversão
    let receitaTotal = 0
    const tempoMedioConversao = 0

    if (conversoes && conversoes.length > 0) {
      receitaTotal = conversoes.reduce((sum, conv) => sum + (conv.payment_amount || 0), 0)
    }

    const metricas = {
      totalViews: totalViews || 0,
      totalLeads: totalLeads || 0,
      totalConversoes: totalConversoes || 0,
      leads: leadsRecentes || [],
      conversoes: conversoes || [],
      variantesViews,
      variantesLeads,
      variantesQualificacao,
      variantesConversao,
      variantesTempoMedio, // Incluir tempo médio por variante
      taxaConversao: totalViews > 0 ? (((totalLeads || 0) / totalViews) * 100).toFixed(1) : "0",
      taxaConversaoReal: totalLeads > 0 ? (((totalConversoes || 0) / totalLeads) * 100).toFixed(1) : "0",
      receitaTotal: receitaTotal.toFixed(2),
      tempoMedioConversao: tempoMedioConversao.toString(),
      mode: "supabase",
    }

    console.log("✅ Métricas do Supabase carregadas:", metricas)
    console.log("📊 Variantes detectadas:", Object.keys(variantesLeads))
    return metricas
  } catch (error) {
    console.error("❌ Erro ao buscar métricas do Supabase:", error)
    return {
      totalViews: 0,
      totalLeads: 0,
      totalConversoes: 0,
      leads: [],
      conversoes: [],
      variantesViews: {},
      variantesLeads: {},
      variantesQualificacao: {},
      variantesConversao: {},
      variantesTempoMedio: {},
      taxaConversao: "0",
      taxaConversaoReal: "0",
      receitaTotal: "0",
      tempoMedioConversao: "0",
      mode: "error",
    }
  }
}

// Função para criar lead de teste
export async function criarLeadTeste() {
  const leadTeste: Lead = {
    nome: `Teste ${Date.now()}`,
    email: `teste${Date.now()}@email.com`,
    telefone: "11999999999",
    idade: "45",
    categoria: "Teste",
    classificacao_final: "AAA", // Adicionado para teste
    pontuacao: 50,
    variante: "testbx9",
    tempo_total: 120000,
    respostas: { teste: true },
    analise: {
      categoria: "QUENTE",
      classificacaoFinal: "AAA", // Adicionado para teste
      score: 75,
      prioridade: 4,
      motivos: ["Teste 1", "Teste 2"],
      sintomas: ["Calor", "Insônia"],
      comportamento: {
        tempoMedioResposta: 5000,
        tempoTotalQuestionario: 120000,
        voltasPerguntas: 1,
        engajamento: "ALTO",
      },
    },
  }

  return await registrarLead(leadTeste)
}

// Função para limpar dados de teste
export async function limparDadosTeste() {
  if (!isSupabaseConfigured()) {
    console.log("📊 Limpando dados de teste localmente")

    try {
      if (typeof window !== "undefined") {
        // Limpar localStorage
        const leads = JSON.parse(localStorage.getItem("menopausa_leads") || "[]")
        const leadsLimpos = leads.filter((lead) => !lead.nome?.startsWith("Teste"))
        localStorage.setItem("menopausa_leads", JSON.stringify(leadsLimpos))

        const views = JSON.parse(localStorage.getItem("menopausa_views") || "[]")
        const viewsLimpas = views.filter((view) => view.variante !== "teste")
        localStorage.setItem("menopausa_views", JSON.stringify(viewsLimpas))
      }

      console.log("✅ Dados de teste locais limpos com sucesso")
      return true
    } catch (error) {
      console.error("❌ Erro ao limpar dados locais:", error)
      return false
    }
  }

  try {
    // Deletar leads de teste
    const { error: errorLeads } = await supabase!.from("leads").delete().like("nome", "Teste%")
    const { error: errorDashboard } = await supabase!.from("QUIZ_DASHBOARD").delete().like("nome", "Teste%")

    // Deletar sessões de teste
    const { error: errorSessions } = await supabase!.from("sessions").delete().eq("variante", "teste")

    if (errorLeads || errorSessions || errorDashboard) {
      console.error("❌ Erro ao limpar dados:", errorLeads || errorSessions || errorDashboard)
      return false
    }

    console.log("✅ Dados de teste do Supabase limpos com sucesso")
    return true
  } catch (error) {
    console.error("❌ Erro geral ao limpar dados:", error)
    return false
  }
}

// Função para verificar status da configuração
export function getSupabaseStatus() {
  console.log("🔍 Verificando status do Supabase:")
  console.log("- URL:", supabaseUrl)
  console.log("- Key:", supabaseAnonKey ? "Definida" : "Não definida")
  console.log("- Cliente:", supabase ? "Criado" : "Null")

  const status = {
    configured: isSupabaseConfigured(),
    url: supabaseUrl ? "✅ Configurada" : "❌ Não configurada",
    key: supabaseAnonKey ? "✅ Configurada" : "❌ Não configurada",
  }

  console.log("📊 Status final:", status)
  return status
}

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase não configurado", status: "not_configured" }
  }

  try {
    // Tenta fazer uma query simples
    const { data, error } = await supabase!.from("QUIZ_DASHBOARD").select("count(*)", { count: "exact" }).limit(1)

    if (error) {
      return {
        success: false,
        message: `Erro ao conectar: ${error.message}`,
        status: "error",
        details: error,
      }
    }

    return {
      success: true,
      message: "Conexão com Supabase estabelecida com sucesso",
      status: "connected",
      data,
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro inesperado: ${error.message}`,
      status: "exception",
      details: error,
    }
  }
}
