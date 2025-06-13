// Sistema de tracking simplificado e robusto
export interface TrackingEvent {
  id: string
  type:
    | "session_start"
    | "question_answered"
    | "quiz_completed"
    | "agendamento_click"
    | "navigation_back"
    | "navigation_next"
    | "input_change"
    | "resultado_concluir"
    | string
  variante: string
  timestamp: string
  data?: any
  sessionId?: string
  userAgent?: string
  url?: string
}

// IMPORTANTE: Usar a mesma chave que o sistema antigo estava usando
const STORAGE_KEY = "quiz_tracking_events"

// Verificar se localStorage está funcionando
export function checkLocalStorage(): boolean {
  try {
    const testKey = "test_storage_check"
    localStorage.setItem(testKey, "test")
    const result = localStorage.getItem(testKey)
    localStorage.removeItem(testKey)
    return result === "test"
  } catch (error) {
    console.error("❌ localStorage não está funcionando:", error)
    return false
  }
}

// Gerar ID único
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Salvar evento
export function saveEvent(event: Omit<TrackingEvent, "id" | "timestamp">): TrackingEvent {
  if (!checkLocalStorage()) {
    console.error("❌ localStorage não está funcionando, não foi possível salvar o evento")
    throw new Error("localStorage não está funcionando")
  }

  const fullEvent: TrackingEvent = {
    ...event,
    id: generateId(),
    timestamp: new Date().toISOString(),
  }

  try {
    // Carregar eventos existentes
    const events = getAllEvents()
    console.log(`📊 Eventos existentes: ${events.length}`)

    // Adicionar novo evento
    events.push(fullEvent)

    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))

    // Verificar se foi salvo corretamente
    const savedEvents = getAllEvents()
    console.log(`✅ Evento salvo! Total agora: ${savedEvents.length}`)

    // Disparar evento customizado para notificar o dashboard
    window.dispatchEvent(
      new CustomEvent("menopausa:tracking", {
        detail: { event: fullEvent, totalEvents: savedEvents.length },
      }),
    )

    return fullEvent
  } catch (error) {
    console.error("❌ Erro ao salvar evento:", error)
    throw error
  }
}

// Obter todos os eventos
export function getAllEvents(): TrackingEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      console.log("📂 Nenhum evento encontrado no localStorage")
      return []
    }

    const events = JSON.parse(data)
    console.log(`📂 ${events.length} eventos carregados do localStorage`)
    return events
  } catch (error) {
    console.error("❌ Erro ao carregar eventos:", error)
    return []
  }
}

// Limpar todos os eventos
export function clearAllEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log("✅ Todos os eventos foram limpos")
  } catch (error) {
    console.error("❌ Erro ao limpar eventos:", error)
    throw error
  }
}

// Criar lead de teste
export function createTestLead(): TrackingEvent {
  console.log("🧪 Criando lead de teste...")

  const testData = {
    type: "quiz_completed" as const,
    variante: "testbx9",
    data: {
      dadosContato: {
        nome: `Maria Teste ${Math.floor(Math.random() * 1000)}`,
        email: `maria.teste${Math.floor(Math.random() * 1000)}@exemplo.com`,
        telefone: "11999999999",
        idade: "45",
      },
      analise: {
        pontuacaoTotal: Math.floor(Math.random() * 100),
        categoria: "Sintomas Moderados",
        urgencia: "media" as const,
        sintomas: [],
      },
      tempoTotal: Math.floor(Math.random() * 300000) + 60000, // 1-5 minutos
    },
    sessionId: `test_session_${generateId()}`,
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  const result = saveEvent(testData)
  console.log("✅ Lead de teste criado com sucesso:", result)
  return result
}

// Exportar eventos como JSON
export function exportEvents(): string {
  const events = getAllEvents()
  return JSON.stringify(events, null, 2)
}

// Obter estatísticas básicas
export function getBasicStats() {
  const events = getAllEvents()

  return {
    totalEvents: events.length,
    sessionStarts: events.filter((e) => e.type === "session_start").length,
    quizCompletions: events.filter((e) => e.type === "quiz_completed").length,
    uniqueSessions: new Set(events.map((e) => e.sessionId).filter(Boolean)).size,
    variants: [...new Set(events.map((e) => e.variante))],
  }
}

// Função principal para rastrear eventos (compatibilidade)
export function trackEvent(type: string, data?: any): TrackingEvent {
  console.log(`🔍 Rastreando evento: ${type}`)

  try {
    // Obter variante da URL ou usar padrão
    const urlParams = new URLSearchParams(window.location.search)
    const variante = urlParams.get("variante") || "testbx9"

    // Obter ou criar sessionId
    let sessionId = sessionStorage.getItem("menopausa_session_id")
    if (!sessionId) {
      sessionId = `session_${generateId()}`
      sessionStorage.setItem("menopausa_session_id", sessionId)
    }

    const event = saveEvent({
      type: type as any,
      variante,
      data,
      sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
    })

    console.log(`✅ Evento "${type}" rastreado com sucesso!`)
    return event
  } catch (error) {
    console.error("❌ Erro ao rastrear evento:", error)
    // Retornar evento de erro para não quebrar o fluxo
    return {
      id: generateId(),
      type: "error",
      variante: "error",
      timestamp: new Date().toISOString(),
      data: { error: String(error) },
    }
  }
}

// Função para verificar se o sistema de tracking está funcionando
export function testTracking(): boolean {
  console.log("🧪 Testando sistema de tracking...")

  try {
    // Verificar localStorage
    if (!checkLocalStorage()) {
      console.error("❌ localStorage não está funcionando")
      return false
    }

    // Tentar salvar um evento de teste
    const testEvent = trackEvent("test_event", { test: true })

    // Verificar se o evento foi salvo
    const events = getAllEvents()
    const found = events.some((e) => e.id === testEvent.id)

    if (found) {
      console.log("✅ Sistema de tracking está funcionando corretamente!")
      return true
    } else {
      console.error("❌ Evento de teste não foi encontrado após salvar")
      return false
    }
  } catch (error) {
    console.error("❌ Erro ao testar sistema de tracking:", error)
    return false
  }
}
