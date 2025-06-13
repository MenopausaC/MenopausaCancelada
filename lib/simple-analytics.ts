// Sistema de analytics SIMPLES que FUNCIONA
interface AnalyticsData {
  totalViews: number
  totalCompletions: number
  leads: Array<{
    id: string
    nome: string
    email: string
    telefone: string
    idade: string
    categoria: string
    timestamp: string
    respostas: Record<string, any>
  }>
  lastUpdate: string
}

const ANALYTICS_KEY = "menopausa_analytics"

// Função para obter dados
export function getAnalytics(): AnalyticsData {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      console.log("📊 Dados carregados:", parsed)
      return parsed
    }
  } catch (error) {
    console.error("Erro ao carregar analytics:", error)
  }

  // Dados padrão
  const defaultData: AnalyticsData = {
    totalViews: 0,
    totalCompletions: 0,
    leads: [],
    lastUpdate: new Date().toISOString(),
  }

  saveAnalytics(defaultData)
  return defaultData
}

// Função para salvar dados
export function saveAnalytics(data: AnalyticsData): void {
  try {
    data.lastUpdate = new Date().toISOString()
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data))
    console.log("💾 Analytics salvos:", data)

    // Disparar evento para atualizar dashboard
    window.dispatchEvent(new CustomEvent("analytics-updated", { detail: data }))
  } catch (error) {
    console.error("Erro ao salvar analytics:", error)
  }
}

// Registrar visualização
export function trackView(): void {
  const data = getAnalytics()
  data.totalViews++
  saveAnalytics(data)
  console.log("👁️ View registrada. Total:", data.totalViews)
}

// Registrar conclusão do questionário
export function trackCompletion(leadData: {
  nome: string
  email: string
  telefone: string
  idade: string
  categoria: string
  respostas: Record<string, any>
}): void {
  const data = getAnalytics()

  const lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...leadData,
    timestamp: new Date().toISOString(),
  }

  data.totalCompletions++
  data.leads.push(lead)

  saveAnalytics(data)
  console.log("✅ Lead registrado:", lead)
  console.log("📊 Total de conclusões:", data.totalCompletions)
}

// Criar lead de teste
export function createTestLead(): void {
  const testLead = {
    nome: `Maria Teste ${Math.floor(Math.random() * 1000)}`,
    email: `teste${Math.floor(Math.random() * 1000)}@email.com`,
    telefone: "11999999999",
    idade: "45",
    categoria: "Sintomas Moderados",
    respostas: {
      sintoma_principal: { resposta: "Calores repentinos", pontos: 8 },
      frequencia_fogachos: { resposta: "Todo dia", pontos: 8 },
    },
  }

  trackCompletion(testLead)
  alert("✅ Lead de teste criado com sucesso!")
}

// Limpar todos os dados
export function clearAnalytics(): void {
  if (confirm("Tem certeza que deseja limpar todos os dados?")) {
    localStorage.removeItem(ANALYTICS_KEY)
    console.log("🗑️ Analytics limpos")
    window.dispatchEvent(
      new CustomEvent("analytics-updated", {
        detail: { totalViews: 0, totalCompletions: 0, leads: [], lastUpdate: new Date().toISOString() },
      }),
    )
    alert("Dados limpos com sucesso!")
  }
}
