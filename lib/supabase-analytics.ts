import { supabase } from "./supabase"

// Interface para as métricas do dashboard
export interface DashboardMetrics {
  totalViews: number
  totalLeads: number
  taxaConversao: string
  leads: any[]
  categorias: {
    [key: string]: number
  }
  urgencias: {
    [key: string]: number
  }
  variantesPerformance: {
    [key: string]: {
      views: number
      leads: number
      conversao: string
    }
  }
  leadsRecentes: any[]
  mode: "supabase" | "local" | "error"
}

// Função principal para buscar métricas do Supabase
export async function buscarMetricasSupabase(): Promise<DashboardMetrics> {
  if (!supabase) {
    console.log("📊 Supabase não configurado - usando dados locais")
    return buscarMetricasLocal()
  }

  try {
    console.log("📊 Buscando métricas do Supabase...")

    // 1. Buscar total de leads
    const { count: totalLeads, error: errorLeads } = await supabase
      .from("QUIZ_DASHBOARD")
      .select("*", { count: "exact", head: true })

    if (errorLeads) {
      console.error("❌ Erro ao buscar total de leads:", errorLeads)
      return buscarMetricasLocal()
    }

    // 2. Buscar total de views (sessions)
    const { count: totalViews, error: errorViews } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })

    if (errorViews) {
      console.error("❌ Erro ao buscar total de views:", errorViews)
      // Continuar sem views se não existir a tabela
    }

    // 3. Buscar leads recentes com detalhes
    const { data: leadsRecentes, error: errorRecentes } = await supabase
      .from("QUIZ_DASHBOARD")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(50)

    if (errorRecentes) {
      console.error("❌ Erro ao buscar leads recentes:", errorRecentes)
      return buscarMetricasLocal()
    }

    // 4. Processar dados para métricas
    const leads = leadsRecentes || []
    const views = totalViews || 0
    const leadsCount = totalLeads || 0

    // Calcular distribuição por categoria
    const categorias: { [key: string]: number } = {}
    leads.forEach((lead) => {
      const categoria = lead.categoria_lead || lead.categoria_sintomas || "Não classificado"
      categorias[categoria] = (categorias[categoria] || 0) + 1
    })

    // Calcular distribuição por urgência
    const urgencias: { [key: string]: number } = {}
    leads.forEach((lead) => {
      const urgencia = lead.urgencia || "Não definida"
      urgencias[urgencia] = (urgencias[urgencia] || 0) + 1
    })

    // Calcular performance por variante
    const variantesPerformance: { [key: string]: any } = {}

    // Buscar views por variante
    if (totalViews > 0) {
      const { data: viewsPorVariante } = await supabase.from("sessions").select("variante")

      const viewsCount: { [key: string]: number } = {}
      viewsPorVariante?.forEach((session) => {
        const variante = session.variante || "default"
        viewsCount[variante] = (viewsCount[variante] || 0) + 1
      })

      // Leads por variante
      const leadsPorVariante: { [key: string]: number } = {}
      leads.forEach((lead) => {
        const variante = lead.versao_questionario || "default"
        leadsPorVariante[variante] = (leadsPorVariante[variante] || 0) + 1
      })

      // Calcular conversão por variante
      Object.keys(viewsCount).forEach((variante) => {
        const viewsVar = viewsCount[variante] || 0
        const leadsVar = leadsPorVariante[variante] || 0
        variantesPerformance[variante] = {
          views: viewsVar,
          leads: leadsVar,
          conversao: viewsVar > 0 ? ((leadsVar / viewsVar) * 100).toFixed(1) : "0",
        }
      })
    }

    const taxaConversao = views > 0 ? ((leadsCount / views) * 100).toFixed(1) : "0"

    const metricas: DashboardMetrics = {
      totalViews: views,
      totalLeads: leadsCount,
      taxaConversao,
      leads,
      categorias,
      urgencias,
      variantesPerformance,
      leadsRecentes: leads.slice(0, 10), // Últimos 10 para exibição
      mode: "supabase",
    }

    console.log("✅ Métricas do Supabase carregadas:", metricas)
    return metricas
  } catch (error) {
    console.error("❌ Erro geral ao buscar métricas do Supabase:", error)
    return buscarMetricasLocal()
  }
}

// Fallback para dados locais
function buscarMetricasLocal(): DashboardMetrics {
  try {
    const analytics = JSON.parse(
      localStorage.getItem("menopausa_data") || '{"views": 0, "completions": 0, "leads": []}',
    )

    return {
      totalViews: analytics.views || 0,
      totalLeads: analytics.completions || 0,
      taxaConversao: analytics.views > 0 ? ((analytics.completions / analytics.views) * 100).toFixed(1) : "0",
      leads: analytics.leads || [],
      categorias: {},
      urgencias: {},
      variantesPerformance: {},
      leadsRecentes: (analytics.leads || []).slice(0, 10),
      mode: "local",
    }
  } catch (error) {
    console.error("❌ Erro ao buscar dados locais:", error)
    return {
      totalViews: 0,
      totalLeads: 0,
      taxaConversao: "0",
      leads: [],
      categorias: {},
      urgencias: {},
      variantesPerformance: {},
      leadsRecentes: [],
      mode: "error",
    }
  }
}

// Função para criar lead de teste no Supabase
export async function criarLeadTesteSupabase() {
  if (!supabase) {
    console.log("📊 Supabase não configurado - criando lead local")
    return null
  }

  const leadTeste = {
    nome: `Teste Supabase ${Date.now()}`,
    email: `teste.supabase.${Date.now()}@email.com`,
    telefone: "11999999999",
    idade: 45,
    categoria_sintomas: "Sintomas Moderados",
    pontuacao_total: 75,
    urgencia: "media",
    expectativa_melhora: "Alta expectativa de melhora",
    score_qualificacao: 75,
    categoria_lead: "MORNO",
    prioridade: 3,
    motivos_qualificacao: '["Sintomas Moderados", "Interesse em Tratamento"]',
    sintomas_identificados: JSON.stringify(["calores", "insonia", "irritabilidade"]),
    respostas_detalhadas: JSON.stringify({ teste: true, origem: "dashboard" }),
    tempo_total: 120000,
    tempo_total_questionario: 120000,
    tempo_medio_resposta: 8000,
    voltas_perguntas: 1,
    engajamento: "MEDIO",
    hesitacao_perguntas: "baixa",
    tempo_tela_final: 15000,
    origem: "teste-dashboard",
    versao_questionario: "testbx9",
    acao: "lead_teste_criado",
    dispositivo: "Desktop",
    sistema_operacional: "Windows",
    navegador: "Chrome",
    criado_em: new Date().toISOString(),
  }

  try {
    const { data, error } = await supabase.from("QUIZ_DASHBOARD").insert([leadTeste]).select()

    if (error) {
      console.error("❌ Erro ao criar lead de teste:", error)
      return null
    }

    console.log("✅ Lead de teste criado no Supabase:", data[0])
    return data[0]
  } catch (error) {
    console.error("❌ Erro geral ao criar lead de teste:", error)
    return null
  }
}

// Função para limpar dados de teste
export async function limparDadosTesteSupabase() {
  if (!supabase) {
    console.log("📊 Supabase não configurado")
    return false
  }

  try {
    const { error } = await supabase.from("QUIZ_DASHBOARD").delete().like("nome", "Teste%")

    if (error) {
      console.error("❌ Erro ao limpar dados de teste:", error)
      return false
    }

    console.log("✅ Dados de teste limpos do Supabase")
    return true
  } catch (error) {
    console.error("❌ Erro geral ao limpar dados:", error)
    return false
  }
}
