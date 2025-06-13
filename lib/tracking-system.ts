// Sistema de tracking robusto com múltiplos métodos de armazenamento

// Tipos
export interface TrackingEvent {
  id: string
  type: string
  event?: string // Para compatibilidade
  timestamp: string
  data?: any
  sessionId?: string
  variante?: string
}

// Constantes
const STORAGE_KEY = "quiz_tracking_events"
const BACKUP_KEY = "quiz_tracking_backup"
const SESSION_ID_KEY = "quiz_session_id"

// Classe principal do sistema de tracking
export class TrackingSystem {
  private static instance: TrackingSystem
  private events: TrackingEvent[] = []
  private sessionId = ""
  private variante = "default"
  private initialized = false
  private storageAvailable = false
  private listeners: Array<(event: TrackingEvent) => void> = []

  // Singleton
  public static getInstance(): TrackingSystem {
    if (!TrackingSystem.instance) {
      TrackingSystem.instance = new TrackingSystem()
    }
    return TrackingSystem.instance
  }

  // Construtor privado
  private constructor() {
    this.init()
  }

  // Inicializar o sistema
  private init(): void {
    try {
      console.log("🔧 Inicializando sistema de tracking...")

      // Verificar se localStorage está disponível
      this.storageAvailable = this.checkStorage()
      console.log(`🔍 Storage disponível: ${this.storageAvailable}`)

      // Carregar eventos existentes
      if (this.storageAvailable) {
        this.loadEvents()
      }

      // Obter ou criar sessionId
      this.sessionId = this.getOrCreateSessionId()
      console.log(`🆔 Session ID: ${this.sessionId}`)

      // Obter variante
      this.variante = this.getVariante()
      console.log(`🏷️ Variante: ${this.variante}`)

      this.initialized = true
      console.log("✅ Sistema de tracking inicializado com sucesso")

      // Disparar evento de inicialização
      this.dispatchCustomEvent("tracking_initialized", {
        sessionId: this.sessionId,
        variante: this.variante,
        storageAvailable: this.storageAvailable,
      })

      // Registrar evento de início de sessão
      this.track("session_start", {
        url: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("❌ Erro ao inicializar sistema de tracking:", error)
      this.initialized = false
    }
  }

  // Verificar se localStorage está disponível
  private checkStorage(): boolean {
    try {
      const testKey = "test_storage"
      localStorage.setItem(testKey, "test")
      const result = localStorage.getItem(testKey) === "test"
      localStorage.removeItem(testKey)
      return result
    } catch (error) {
      console.warn("⚠️ localStorage não disponível:", error)
      return false
    }
  }

  // Carregar eventos existentes
  private loadEvents(): void {
    try {
      // Tentar carregar do localStorage
      const eventsJson = localStorage.getItem(STORAGE_KEY)
      if (eventsJson) {
        this.events = JSON.parse(eventsJson)
        console.log(`📂 ${this.events.length} eventos carregados do localStorage`)
      } else {
        // Tentar carregar do backup
        const backupJson = localStorage.getItem(BACKUP_KEY)
        if (backupJson) {
          this.events = JSON.parse(backupJson)
          console.log(`📂 ${this.events.length} eventos carregados do backup`)
          // Salvar no localStorage principal
          this.saveToStorage()
        } else {
          this.events = []
          console.log("📂 Nenhum evento encontrado, iniciando lista vazia")
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar eventos:", error)
      this.events = []
    }
  }

  // Obter ou criar sessionId
  private getOrCreateSessionId(): string {
    try {
      // Tentar obter do sessionStorage
      let id = sessionStorage.getItem(SESSION_ID_KEY)
      if (!id) {
        // Criar novo ID
        id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        sessionStorage.setItem(SESSION_ID_KEY, id)
        console.log(`🆕 Novo session ID criado: ${id}`)
      } else {
        console.log(`🔄 Session ID existente: ${id}`)
      }
      return id
    } catch (error) {
      // Fallback para ID em memória
      const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      console.warn("⚠️ Usando session ID em memória:", id)
      return id
    }
  }

  // Obter variante da URL ou usar padrão
  private getVariante(): string {
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search)
        const varianteParam = urlParams.get("variante")
        if (varianteParam) {
          console.log(`🎯 Variante detectada na URL: ${varianteParam}`)
          return varianteParam
        }
      }
      console.log("🎯 Usando variante padrão: default")
      return "default"
    } catch (error) {
      console.warn("⚠️ Erro ao detectar variante:", error)
      return "default"
    }
  }

  // Salvar eventos no localStorage
  private saveToStorage(): boolean {
    if (!this.storageAvailable) {
      console.warn("⚠️ localStorage não disponível, não foi possível salvar eventos")
      return false
    }

    try {
      const eventsJson = JSON.stringify(this.events)

      // Salvar no localStorage principal
      localStorage.setItem(STORAGE_KEY, eventsJson)

      // Salvar no backup
      localStorage.setItem(BACKUP_KEY, eventsJson)

      console.log(`💾 ${this.events.length} eventos salvos no localStorage`)

      // Sincronizar com o sistema de analytics
      this.syncWithAnalytics()

      return true
    } catch (error) {
      console.error("❌ Erro ao salvar eventos:", error)
      return false
    }
  }

  // Sincronizar com o sistema de analytics
  private syncWithAnalytics(): void {
    try {
      // Importar funções do analytics dinamicamente para evitar dependência circular
      import("./analytics")
        .then((analytics) => {
          // Contar visualizações (session_start)
          const views = this.events.filter((e) => e.type === "session_start").length

          // Contar conclusões (quiz_completed)
          const completions = this.events.filter((e) => e.type === "quiz_completed").length

          // Extrair leads dos eventos quiz_completed
          const leads = this.events
            .filter((e) => e.type === "quiz_completed")
            .map((e) => {
              const dadosContato = e.data?.dadosContato || {}
              return {
                id: e.id || Date.now(),
                nome: dadosContato.nome || "Nome não informado",
                email: dadosContato.email || "Email não informado",
                telefone: dadosContato.telefone || "Telefone não informado",
                idade: dadosContato.idade || "N/A",
                categoria: e.data?.analise?.categoria || "Sem categoria",
                timestamp: e.timestamp || new Date().toISOString(),
              }
            })

          // Salvar no localStorage do analytics
          const analyticsData = { views, completions, leads }
          localStorage.setItem("menopausa_data", JSON.stringify(analyticsData))

          // Disparar evento de atualização
          window.dispatchEvent(new CustomEvent("analytics-update", { detail: analyticsData }))

          console.log("🔄 Analytics sincronizado:", analyticsData)
        })
        .catch((error) => {
          console.error("❌ Erro ao importar analytics:", error)
        })
    } catch (error) {
      console.error("❌ Erro ao sincronizar com analytics:", error)
    }
  }

  // Disparar evento customizado
  private dispatchCustomEvent(type: string, detail: any): void {
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("quiz:tracking", {
            detail: { type, ...detail, totalEvents: this.events.length },
          }),
        )
        console.log(`📡 Evento customizado disparado: ${type}`)
      } catch (error) {
        console.warn("⚠️ Erro ao disparar evento customizado:", error)
      }
    }
  }

  // Adicionar evento
  public track(type: string, data?: any): TrackingEvent | null {
    try {
      console.log(`📊 Tentando registrar evento: ${type}`)

      if (!this.initialized) {
        console.warn("⚠️ Sistema de tracking não inicializado, tentando inicializar...")
        this.init()
      }

      // Criar evento
      const event: TrackingEvent = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        event: type, // Para compatibilidade
        timestamp: new Date().toISOString(),
        data: data || {},
        sessionId: this.sessionId,
        variante: this.variante,
      }

      // Adicionar ao array
      this.events.push(event)
      console.log(`✅ Evento "${type}" adicionado com ID: ${event.id}`)
      console.log(`📊 Total de eventos: ${this.events.length}`)

      // Salvar no localStorage
      const saved = this.saveToStorage()
      if (!saved) {
        console.warn("⚠️ Evento salvo apenas em memória")
      }

      // Notificar listeners
      this.notifyListeners(event)

      // Disparar evento customizado
      this.dispatchCustomEvent("event_added", { event })

      // Disparar evento específico para o tipo
      if (type === "quiz_completed") {
        window.dispatchEvent(new CustomEvent("quiz:completed", { detail: event }))
      }

      return event
    } catch (error) {
      console.error("❌ Erro ao adicionar evento:", error)
      return null
    }
  }

  // Obter todos os eventos
  public getAllEvents(): TrackingEvent[] {
    console.log(`📊 Retornando ${this.events.length} eventos`)
    return [...this.events]
  }

  // Limpar todos os eventos
  public clearAllEvents(): boolean {
    try {
      console.log("🗑️ Limpando todos os eventos...")
      this.events = []

      if (this.storageAvailable) {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(BACKUP_KEY)
      }

      console.log("🗑️ Todos os eventos foram limpos")

      // Disparar evento customizado
      this.dispatchCustomEvent("events_cleared", { totalEvents: 0 })

      return true
    } catch (error) {
      console.error("❌ Erro ao limpar eventos:", error)
      return false
    }
  }

  // Adicionar listener
  public addListener(listener: (event: TrackingEvent) => void): void {
    this.listeners.push(listener)
    console.log(`👂 Listener adicionado. Total: ${this.listeners.length}`)
  }

  // Remover listener
  public removeListener(listener: (event: TrackingEvent) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener)
    console.log(`👂 Listener removido. Total: ${this.listeners.length}`)
  }

  // Notificar listeners
  private notifyListeners(event: TrackingEvent): void {
    this.listeners.forEach((listener, index) => {
      try {
        listener(event)
        console.log(`👂 Listener ${index} notificado`)
      } catch (error) {
        console.error(`❌ Erro em listener ${index}:`, error)
      }
    })
  }

  // Criar lead de teste
  public createTestLead(): TrackingEvent | null {
    console.log("🧪 Criando lead de teste...")
    return this.track("quiz_completed", {
      dadosContato: {
        nome: `Maria Teste ${Math.floor(Math.random() * 1000)}`,
        email: `maria${Math.floor(Math.random() * 1000)}@teste.com`,
        telefone: "11999999999",
        idade: "45",
      },
      analise: {
        pontuacaoTotal: Math.floor(Math.random() * 100),
        categoria: "Sintomas Moderados",
        urgencia: "media",
      },
      tempoTotal: 120000,
      metadados: {
        teste: true,
        timestamp: new Date().toISOString(),
      },
    })
  }

  // Verificar se o sistema está funcionando
  public testSystem(): boolean {
    try {
      console.log("🧪 Testando sistema de tracking...")

      // Verificar storage
      const storageOk = this.checkStorage()
      console.log(`🔍 Storage OK: ${storageOk}`)

      // Tentar adicionar evento de teste
      const testEvent = this.track("test_event", { test: true, timestamp: new Date().toISOString() })
      console.log(`🧪 Evento de teste criado: ${!!testEvent}`)

      // Verificar se foi adicionado
      const allEvents = this.getAllEvents()
      const eventAdded = allEvents.some((e) => e.id === testEvent?.id)
      console.log(`🔍 Evento encontrado na lista: ${eventAdded}`)

      const result = storageOk && eventAdded
      console.log(`🧪 Resultado do teste: ${result}`)

      return result
    } catch (error) {
      console.error("❌ Erro ao testar sistema:", error)
      return false
    }
  }

  // Verificar se localStorage está disponível (método público)
  public checkLocalStorage(): boolean {
    return this.checkStorage()
  }

  // Exportar eventos como JSON
  public exportEvents(): string {
    return JSON.stringify(this.events, null, 2)
  }

  // Obter estatísticas
  public getStats(): any {
    const stats = {
      totalEvents: this.events.length,
      sessionId: this.sessionId,
      variante: this.variante,
      initialized: this.initialized,
      storageAvailable: this.storageAvailable,
      eventTypes: {} as Record<string, number>,
      lastEvent: this.events.length > 0 ? this.events[this.events.length - 1] : null,
    }

    // Contar eventos por tipo
    this.events.forEach((event) => {
      stats.eventTypes[event.type] = (stats.eventTypes[event.type] || 0) + 1
    })

    return stats
  }
}

// Funções auxiliares para uso fácil
export function trackEvent(type: string, data?: any): TrackingEvent | null {
  console.log(`📊 trackEvent chamado: ${type}`)
  const result = TrackingSystem.getInstance().track(type, data)
  console.log(`📊 trackEvent resultado: ${!!result}`)
  return result
}

export function getAllEvents(): TrackingEvent[] {
  return TrackingSystem.getInstance().getAllEvents()
}

export function clearAllEvents(): boolean {
  return TrackingSystem.getInstance().clearAllEvents()
}

export function createTestLead(): TrackingEvent | null {
  return TrackingSystem.getInstance().createTestLead()
}

export function testTrackingSystem(): boolean {
  return TrackingSystem.getInstance().testSystem()
}

export function checkLocalStorage(): boolean {
  return TrackingSystem.getInstance().checkLocalStorage()
}

export function exportEvents(): string {
  return TrackingSystem.getInstance().exportEvents()
}

export function getTrackingStats(): any {
  return TrackingSystem.getInstance().getStats()
}
