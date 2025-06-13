"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPanel() {
  const [eventos, setEventos] = useState<any[]>([])
  const [isListening, setIsListening] = useState(true) // Começa escutando por padrão
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    // Carregar eventos existentes imediatamente
    loadEventos()

    // Escutar mudanças no localStorage
    const interval = setInterval(() => {
      if (isListening) {
        loadEventos()
      }
    }, 1000)

    // Adicionar listener para eventos de storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "quiz_tracking_events" && isListening) {
        console.log("🔄 Debug Panel: Mudança detectada no localStorage")
        loadEventos()
      }
    }

    // Adicionar listener para eventos customizados
    const handleCustomEvent = () => {
      if (isListening) {
        console.log("🔄 Debug Panel: Evento customizado detectado")
        loadEventos()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("quiz:tracking", handleCustomEvent)
    window.addEventListener("menopausa:tracking", handleCustomEvent)
    window.addEventListener("analytics-update", handleCustomEvent)

    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("quiz:tracking", handleCustomEvent)
      window.removeEventListener("menopausa:tracking", handleCustomEvent)
      window.removeEventListener("analytics-update", handleCustomEvent)
    }
  }, [isListening])

  const loadEventos = () => {
    try {
      const eventosString = localStorage.getItem("quiz_tracking_events")
      if (eventosString) {
        const eventosArray = JSON.parse(eventosString)
        setEventos(eventosArray)
        setLastUpdate(new Date())
        console.log("🔄 Debug Panel: Eventos carregados:", eventosArray.length)
      } else {
        setEventos([])
        setLastUpdate(new Date())
        console.log("🔄 Debug Panel: Nenhum evento encontrado")
      }
    } catch (error) {
      console.error("❌ Debug Panel: Erro ao carregar eventos:", error)
      setEventos([])
    }
  }

  const criarEventoTeste = () => {
    const eventoTeste = {
      event: "quiz_completed",
      type: "quiz_completed", // Adicionado para compatibilidade
      id: `debug_${Date.now()}`,
      data: {
        dadosContato: {
          nome: "Teste Debug Panel",
          email: "teste@debug.com",
          telefone: "11999999999",
          idade: "45",
        },
        analise: {
          pontuacaoTotal: 75,
          categoria: "Sintomas Moderados",
          descricao: "Teste de funcionamento",
          urgencia: "media",
          sintomas: [
            {
              nome: "Calores Frequentes",
              urgencia: "alta",
              explicacao: "Teste de sintoma",
            },
          ],
        },
        respostas: {
          sintoma_principal: {
            pergunta: "sintoma_principal",
            resposta: "Calores repentinos",
            pontos: 8,
            tempo: 5000,
          },
        },
        tempoTotal: 300000,
      },
      timestamp: new Date().toISOString(),
      sessionId: `debug_session_${Date.now()}`,
      variante: "testbx9",
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    console.log("🧪 Criando evento de teste:", eventoTeste)

    try {
      const eventosExistentes = JSON.parse(localStorage.getItem("quiz_tracking_events") || "[]")
      eventosExistentes.push(eventoTeste)
      localStorage.setItem("quiz_tracking_events", JSON.stringify(eventosExistentes))

      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent("quiz:tracking", { detail: { type: "event_added", event: eventoTeste } }))

      console.log("✅ Evento de teste criado com sucesso")
      loadEventos()

      alert("Evento de teste criado! Verifique o painel.")
    } catch (error) {
      console.error("❌ Erro ao criar evento de teste:", error)
      alert("Erro ao criar evento de teste. Verifique o console.")
    }
  }

  const limparEventos = () => {
    if (confirm("Tem certeza que deseja limpar todos os eventos?")) {
      localStorage.removeItem("quiz_tracking_events")
      localStorage.removeItem("menopausa_data") // Limpar também os dados de analytics
      setEventos([])
      console.log("🗑️ Eventos limpos")

      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent("quiz:tracking", { detail: { type: "events_cleared" } }))

      alert("Eventos limpos com sucesso!")
    }
  }

  const verificarLocalStorage = () => {
    try {
      // Teste básico
      localStorage.setItem("teste_debug", "funcionando")
      const teste = localStorage.getItem("teste_debug")
      localStorage.removeItem("teste_debug")

      if (teste === "funcionando") {
        alert("✅ localStorage está funcionando corretamente!")
        console.log("✅ localStorage OK")
      } else {
        alert("❌ localStorage não está funcionando como esperado")
        console.error("❌ localStorage com problema")
      }

      // Verificar todas as chaves
      console.log("🔍 Todas as chaves do localStorage:")
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        const value = localStorage.getItem(key)
        console.log(`- ${key}: ${value?.substring(0, 100)}...`)
      }
    } catch (error) {
      alert("❌ Erro ao acessar localStorage: " + (error as Error).message)
      console.error("❌ Erro localStorage:", error)
    }
  }

  const forcarSincronizacao = () => {
    try {
      // Forçar sincronização entre sistemas
      const eventosString = localStorage.getItem("quiz_tracking_events")
      if (eventosString) {
        const eventosArray = JSON.parse(eventosString)

        // Contar visualizações e conclusões
        const views = eventosArray.filter((e: any) => e.event === "session_start" || e.type === "session_start").length
        const completions = eventosArray.filter(
          (e: any) => e.event === "quiz_completed" || e.type === "quiz_completed",
        ).length

        // Criar objeto de analytics
        const analytics = {
          views,
          completions,
          leads: eventosArray
            .filter((e: any) => e.event === "quiz_completed" || e.type === "quiz_completed")
            .map((e: any) => {
              const dadosContato = e.data?.dadosContato || {}
              return {
                id: Date.now(),
                nome: dadosContato.nome || "Nome não informado",
                email: dadosContato.email || "Email não informado",
                telefone: dadosContato.telefone || "Telefone não informado",
                idade: dadosContato.idade || "N/A",
                categoria: e.data?.analise?.categoria || "Sem categoria",
                timestamp: new Date().toISOString(),
              }
            }),
        }

        // Salvar no localStorage
        localStorage.setItem("menopausa_data", JSON.stringify(analytics))

        // Disparar evento
        window.dispatchEvent(new CustomEvent("analytics-update", { detail: analytics }))

        console.log("🔄 Sincronização forçada concluída:", analytics)
        alert(`Sincronização concluída! Views: ${views}, Leads: ${completions}`)
      } else {
        alert("Nenhum evento encontrado para sincronizar")
      }
    } catch (error) {
      console.error("❌ Erro na sincronização:", error)
      alert("Erro na sincronização. Verifique o console.")
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-hidden z-50">
      <Card className="border-2 border-purple-500 bg-white shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            🔍 Debug Panel
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={isListening ? "destructive" : "default"}
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? "⏸️" : "▶️"}
              </Button>
              <Button size="sm" variant="outline" onClick={loadEventos}>
                🔄
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <strong>Total de eventos: {eventos.length}</strong>
            {lastUpdate && (
              <span className="text-xs text-gray-500 ml-2">Atualizado: {lastUpdate.toLocaleTimeString()}</span>
            )}
          </div>

          <div className="text-xs space-y-1">
            <div>
              Session Start: {eventos.filter((e) => e.event === "session_start" || e.type === "session_start").length}
            </div>
            <div>
              Question Answered:{" "}
              {eventos.filter((e) => e.event === "question_answered" || e.type === "question_answered").length}
            </div>
            <div>
              Quiz Completed:{" "}
              {eventos.filter((e) => e.event === "quiz_completed" || e.type === "quiz_completed").length}
            </div>
            <div>
              Agendamento Click:{" "}
              {eventos.filter((e) => e.event === "agendamento_click" || e.type === "agendamento_click").length}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <Button size="sm" onClick={criarEventoTeste} className="text-xs">
              Criar Teste
            </Button>
            <Button size="sm" onClick={verificarLocalStorage} variant="outline" className="text-xs">
              Verificar LS
            </Button>
            <Button size="sm" onClick={forcarSincronizacao} variant="default" className="text-xs bg-green-600">
              Sincronizar
            </Button>
            <Button size="sm" onClick={limparEventos} variant="destructive" className="text-xs">
              Limpar
            </Button>
          </div>

          {eventos.length > 0 && (
            <div className="max-h-32 overflow-y-auto text-xs space-y-1">
              <div className="font-semibold">Últimos eventos:</div>
              {eventos
                .slice(-5)
                .reverse()
                .map((evento, index) => (
                  <div key={index} className="p-1 bg-gray-100 rounded text-xs">
                    <div className="font-medium">{evento.event || evento.type}</div>
                    <div className="text-gray-600">
                      {evento.sessionId?.substring(0, 15)}... | {evento.variante}
                    </div>
                    <div className="text-gray-500">{new Date(evento.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
