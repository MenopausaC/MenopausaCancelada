// Sistema ULTRA SIMPLES que FUNCIONA SEMPRE
let analytics = {
  views: 0,
  completions: 0,
  leads: [] as any[],
}

// Função para registrar view - CORRIGIDA
export function addView() {
  try {
    // Carregar dados atuais primeiro
    loadFromStorage()

    // Incrementar views
    analytics.views++

    console.log("📊 VIEW REGISTRADA! Total:", analytics.views)
    console.log("📊 Analytics atual:", analytics)

    // Salvar IMEDIATAMENTE
    const dataToSave = JSON.stringify(analytics)
    localStorage.setItem("menopausa_data", dataToSave)
    localStorage.setItem("menopausa_data_backup", dataToSave)

    // Verificar se foi salvo
    const verificacao = localStorage.getItem("menopausa_data")
    if (verificacao) {
      console.log("✅ View salva com sucesso no localStorage")
    } else {
      console.error("❌ Falha ao salvar view no localStorage")
    }

    // Notificar atualização
    notifyUpdate()

    return true
  } catch (e) {
    console.error("❌ Erro ao registrar view:", e)
    return false
  }
}

// Função para adicionar lead - CORRIGIDA
export function addLead(leadData: any) {
  try {
    console.log("📊 Iniciando registro de lead:", leadData)

    // Carregar dados atuais primeiro
    loadFromStorage()

    // Incrementar completions
    analytics.completions++

    // Adicionar lead com ID único
    const newLead = {
      id: Date.now() + Math.random(),
      ...leadData,
      timestamp: new Date().toISOString(),
    }

    analytics.leads.push(newLead)

    console.log("📊 LEAD REGISTRADO! Total:", analytics.completions)
    console.log("📊 Lead data:", newLead)
    console.log("📊 Analytics atual:", analytics)

    // Salvar IMEDIATAMENTE em múltiplos locais
    const dataToSave = JSON.stringify(analytics)

    // 1. Salvar dados principais
    localStorage.setItem("menopausa_data", dataToSave)
    localStorage.setItem("menopausa_data_backup", dataToSave)

    // 2. Salvar backup individual do lead
    const backupLeads = JSON.parse(localStorage.getItem("menopausa_backup_leads") || "[]")
    backupLeads.push(newLead)
    localStorage.setItem("menopausa_backup_leads", JSON.stringify(backupLeads))

    // 3. Salvar no tracking system também
    const trackingEvents = JSON.parse(localStorage.getItem("quiz_tracking_events") || "[]")
    trackingEvents.push({
      id: Date.now(),
      type: "quiz_completed",
      timestamp: new Date().toISOString(),
      data: {
        dadosContato: {
          nome: leadData.nome,
          email: leadData.email,
          telefone: leadData.telefone,
          idade: leadData.idade,
        },
        analise: {
          categoria: leadData.categoria,
        },
      },
    })
    localStorage.setItem("quiz_tracking_events", JSON.stringify(trackingEvents))

    // Verificar se foi salvo
    const verificacao = localStorage.getItem("menopausa_data")
    if (verificacao) {
      const dadosVerificacao = JSON.parse(verificacao)
      console.log("✅ Lead salvo com sucesso! Verificação:", dadosVerificacao)
    } else {
      console.error("❌ Falha ao salvar lead no localStorage")
    }

    // Notificar atualização
    notifyUpdate()

    return newLead
  } catch (e) {
    console.error("❌ Erro crítico ao registrar lead:", e)

    // Tentativa de recuperação - salvar em emergência
    try {
      const emergencyLead = {
        id: Date.now(),
        ...leadData,
        timestamp: new Date().toISOString(),
        emergency: true,
      }

      localStorage.setItem("emergency_lead_" + Date.now(), JSON.stringify(emergencyLead))
      console.log("🚨 Lead salvo em modo de emergência")

      return emergencyLead
    } catch (err) {
      console.error("💥 Falha total ao salvar lead:", err)
      return null
    }
  }
}

// Função para carregar do storage - CORRIGIDA
function loadFromStorage() {
  try {
    // Tentar carregar dados principais
    const data = localStorage.getItem("menopausa_data")
    if (data) {
      const parsed = JSON.parse(data)
      analytics = {
        views: parsed.views || 0,
        completions: parsed.completions || 0,
        leads: parsed.leads || [],
      }
      console.log("📂 Dados carregados do localStorage:", analytics)
      return
    }

    // Se não encontrar, tentar carregar do backup
    const backupData = localStorage.getItem("menopausa_data_backup")
    if (backupData) {
      const parsed = JSON.parse(backupData)
      analytics = {
        views: parsed.views || 0,
        completions: parsed.completions || 0,
        leads: parsed.leads || [],
      }
      console.log("📂 Dados carregados do backup:", analytics)

      // Restaurar dados principais
      localStorage.setItem("menopausa_data", backupData)
      return
    }

    // Se ainda não encontrar, verificar leads de backup individuais
    const backupLeads = localStorage.getItem("menopausa_backup_leads")
    if (backupLeads) {
      const leads = JSON.parse(backupLeads)
      if (leads.length > 0) {
        analytics.leads = leads
        analytics.completions = leads.length
        console.log("📂 Leads restaurados do backup individual:", leads.length)

        // Salvar no localStorage principal
        const dataToSave = JSON.stringify(analytics)
        localStorage.setItem("menopausa_data", dataToSave)
      }
    }

    console.log("📂 Analytics final após carregamento:", analytics)
  } catch (e) {
    console.error("❌ Erro ao carregar storage:", e)
    // Manter analytics com valores padrão
    analytics = { views: 0, completions: 0, leads: [] }
  }
}

// Função para obter dados - CORRIGIDA
export function getAnalytics() {
  // Sempre carregar dados frescos do localStorage
  loadFromStorage()

  console.log("📊 getAnalytics retornando:", analytics)
  return { ...analytics }
}

// Notificar atualização - CORRIGIDA
function notifyUpdate() {
  try {
    // Disparar múltiplos eventos para garantir que seja capturado
    window.dispatchEvent(
      new CustomEvent("analytics-update", {
        detail: analytics,
      }),
    )

    window.dispatchEvent(
      new CustomEvent("menopausa-metrics-update", {
        detail: analytics,
      }),
    )

    console.log("📡 Eventos de atualização disparados")
  } catch (e) {
    console.error("❌ Erro ao disparar evento:", e)
  }
}

// Criar lead de teste - CORRIGIDA
export function createTestLead() {
  const testLead = {
    nome: `Teste ${Date.now()}`,
    email: `teste${Date.now()}@email.com`,
    telefone: "11999999999",
    idade: "45",
    categoria: "Teste",
  }

  console.log("🧪 Criando lead de teste:", testLead)
  return addLead(testLead)
}

// Limpar dados
export function clearData() {
  analytics = { views: 0, completions: 0, leads: [] }

  // Limpar todos os storages
  localStorage.removeItem("menopausa_data")
  localStorage.removeItem("menopausa_data_backup")
  localStorage.removeItem("menopausa_backup_leads")
  localStorage.removeItem("quiz_tracking_events")

  // Limpar leads de emergência
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("emergency_lead_")) {
      localStorage.removeItem(key)
    }
  })

  notifyUpdate()
  console.log("🧹 Dados limpos com sucesso")
}

// Verificar se localStorage está funcionando
export function checkStorage(): boolean {
  try {
    const testKey = "test_storage"
    localStorage.setItem(testKey, "test")
    const result = localStorage.getItem(testKey) === "test"
    localStorage.removeItem(testKey)
    console.log("🔍 localStorage funcionando:", result)
    return result
  } catch (error) {
    console.error("❌ localStorage não disponível:", error)
    return false
  }
}

// Inicializar carregando dados existentes
if (typeof window !== "undefined") {
  loadFromStorage()
}
