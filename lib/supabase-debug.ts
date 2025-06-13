import { supabase } from "./supabase"

export async function buscarMetricasDebug() {
  console.log("🔍 INICIANDO DEBUG COMPLETO DAS MÉTRICAS...")

  try {
    // 1. Verificar conexão
    if (!supabase) {
      console.error("❌ Supabase não configurado")
      return null
    }

    // 2. Buscar contadores
    console.log("📊 Buscando contadores...")

    const { count: totalViews, error: viewsError } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })

    const { count: totalLeads, error: leadsError } = await supabase
      .from("QUIZ_DASHBOARD")
      .select("*", { count: "exact", head: true })

    console.log("📈 Contadores:", { totalViews, totalLeads })
    console.log("🔍 Erros:", { viewsError, leadsError })

    // 3. Buscar dados para variantes
    console.log("🎯 Buscando dados para análise de variantes...")

    const { data: dadosQuiz, error: quizError } = await supabase
      .from("QUIZ_DASHBOARD")
      .select("versao_questionario, origem, variante, nome, criado_em")
      .order("criado_em", { ascending: false })

    const { data: dadosSessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("variante, created_at")
      .order("created_at", { ascending: false })

    console.log("📋 Dados brutos:")
    console.log("- QUIZ_DASHBOARD:", dadosQuiz?.length || 0, "registros")
    console.log("- Sessions:", dadosSessions?.length || 0, "registros")

    // 4. Processar variantes
    const variantesLeads = {}
    const variantesViews = {}

    // Processar leads
    if (dadosQuiz && dadosQuiz.length > 0) {
      console.log("🔄 Processando leads...")
      dadosQuiz.forEach((lead, index) => {
        const variante = lead.versao_questionario || lead.origem || lead.variante || "sem_variante"
        variantesLeads[variante] = (variantesLeads[variante] || 0) + 1

        if (index < 5) {
          // Log dos primeiros 5
          console.log(`Lead ${index + 1}: ${lead.nome} -> variante: ${variante}`)
        }
      })
    }

    // Processar views
    if (dadosSessions && dadosSessions.length > 0) {
      console.log("🔄 Processando views...")
      dadosSessions.forEach((session, index) => {
        const variante = session.variante || "sem_variante"
        variantesViews[variante] = (variantesViews[variante] || 0) + 1

        if (index < 5) {
          // Log dos primeiros 5
          console.log(`Session ${index + 1}: variante: ${variante}`)
        }
      })
    } else {
      // Estimar views baseado nos leads
      console.log("📊 Estimando views baseado nos leads...")
      Object.keys(variantesLeads).forEach((variante) => {
        variantesViews[variante] = variantesLeads[variante] * 3
      })
    }

    console.log("🎯 RESULTADO FINAL DAS VARIANTES:")
    console.log("- Leads por variante:", variantesLeads)
    console.log("- Views por variante:", variantesViews)

    const resultado = {
      totalViews: totalViews || 0,
      totalLeads: totalLeads || 0,
      variantesLeads,
      variantesViews,
      taxaConversao: totalViews > 0 ? (((totalLeads || 0) / totalViews) * 100).toFixed(1) : "0",
      debug: {
        dadosQuiz: dadosQuiz?.length || 0,
        dadosSessions: dadosSessions?.length || 0,
        erros: { viewsError, leadsError, quizError, sessionsError },
      },
    }

    console.log("✅ RESULTADO COMPLETO:", resultado)
    return resultado
  } catch (error) {
    console.error("❌ ERRO GERAL NO DEBUG:", error)
    return null
  }
}
