"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"

export default function DebugOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [localStorageStatus, setLocalStorageStatus] = useState<boolean | null>(null)
  const [sessionStorageStatus, setSessionStorageStatus] = useState<boolean | null>(null)

  useEffect(() => {
    checkStorageStatus()
    loadEvents()

    // Atualizar a cada 5 segundos
    const interval = setInterval(() => {
      checkStorageStatus()
      loadEvents()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const checkStorageStatus = () => {
    try {
      // Testar localStorage
      localStorage.setItem("debug_test", "ok")
      const lsResult = localStorage.getItem("debug_test") === "ok"
      localStorage.removeItem("debug_test")
      setLocalStorageStatus(lsResult)

      // Testar sessionStorage
      sessionStorage.setItem("debug_test", "ok")
      const ssResult = sessionStorage.getItem("debug_test") === "ok"
      sessionStorage.removeItem("debug_test")
      setSessionStorageStatus(ssResult)
    } catch (error) {
      console.error("Erro ao verificar status de armazenamento:", error)
      setLocalStorageStatus(false)
      setSessionStorageStatus(false)
    }
  }

  const loadEvents = () => {
    try {
      const eventsData = localStorage.getItem("quiz_tracking_events")
      if (eventsData) {
        setEvents(JSON.parse(eventsData))
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error)
      setEvents([])
    }
  }

  const createTestEvent = () => {
    try {
      const newEvent = {
        id: `test_${Date.now()}`,
        type: "test_event",
        timestamp: new Date().toISOString(),
        data: { test: true },
      }

      const currentEvents = [...events]
      currentEvents.push(newEvent)
      localStorage.setItem("quiz_tracking_events", JSON.stringify(currentEvents))

      loadEvents()
      return true
    } catch (error) {
      console.error("Erro ao criar evento de teste:", error)
      return false
    }
  }

  const clearEvents = () => {
    try {
      localStorage.removeItem("quiz_tracking_events")
      setEvents([])
    } catch (error) {
      console.error("Erro ao limpar eventos:", error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Debug"
      >
        <AlertTriangle size={20} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-800">Debug System</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Status de armazenamento */}
        <div className="p-2 bg-gray-100 rounded">
          <div className="flex items-center">
            <span className="mr-2">localStorage:</span>
            {localStorageStatus === null ? (
              <RefreshCw size={16} className="animate-spin text-gray-500" />
            ) : localStorageStatus ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <AlertTriangle size={16} className="text-red-500" />
            )}
          </div>
          <div className="flex items-center mt-1">
            <span className="mr-2">sessionStorage:</span>
            {sessionStorageStatus === null ? (
              <RefreshCw size={16} className="animate-spin text-gray-500" />
            ) : sessionStorageStatus ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <AlertTriangle size={16} className="text-red-500" />
            )}
          </div>
        </div>

        {/* Contagem de eventos */}
        <div className="p-2 bg-gray-100 rounded">
          <div className="flex justify-between">
            <span>Total de eventos:</span>
            <span className="font-medium">{events.length}</span>
          </div>
          <div className="flex justify-between">
            <span>quiz_completed:</span>
            <span className="font-medium">{events.filter((e) => e.type === "quiz_completed").length}</span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const result = createTestEvent()
              alert(result ? "Evento criado com sucesso!" : "Falha ao criar evento")
            }}
            className="flex-1 bg-blue-500 text-white py-1 px-2 rounded text-xs"
          >
            Criar Evento Teste
          </button>
          <button
            onClick={() => {
              if (confirm("Limpar todos os eventos?")) {
                clearEvents()
              }
            }}
            className="flex-1 bg-red-500 text-white py-1 px-2 rounded text-xs"
          >
            Limpar Eventos
          </button>
          <button
            onClick={() => {
              loadEvents()
              checkStorageStatus()
            }}
            className="bg-gray-500 text-white py-1 px-2 rounded text-xs"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Últimos eventos */}
        <div className="mt-2">
          <div className="text-xs font-medium mb-1">Últimos eventos:</div>
          <div className="max-h-32 overflow-y-auto bg-gray-100 rounded p-1">
            {events.length > 0 ? (
              events
                .slice(-5)
                .reverse()
                .map((event, index) => (
                  <div key={index} className="text-xs border-b border-gray-200 py-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{event.type}</span>
                      <span className="text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-xs text-gray-500 text-center py-2">Nenhum evento</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
