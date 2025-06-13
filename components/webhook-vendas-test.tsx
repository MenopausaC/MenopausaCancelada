"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Send, CheckCircle, AlertTriangle, Utensils } from "lucide-react"

export default function WebhookVendasTest() {
  const [formData, setFormData] = useState({
    nome: "Maria Silva",
    email: "maria.silva@email.com",
    telefone: "(11) 99999-9999",
    valor: "197",
    produto: "Consulta Nutricional",
    variante: "testbx9",
  })
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [vendasDetectadas, setVendasDetectadas] = useState<any[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const enviarWebhookVenda = async () => {
    setLoading(true)
    setResultado(null)

    try {
      const response = await fetch("/api/vendas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()
      setResultado(data)

      if (data.success) {
        const vendasExistentes = JSON.parse(localStorage.getItem("vendas_detectadas") || "[]")
        vendasExistentes.push({
          ...formData,
          valor: Number.parseFloat(formData.valor),
          timestamp: new Date().toISOString(),
        })
        localStorage.setItem("vendas_detectadas", JSON.stringify(vendasExistentes))
        setVendasDetectadas(vendasExistentes)
      }
    } catch (error) {
      setResultado({
        success: false,
        message: "Erro na requisição",
        error: (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  const detectarVendaAutomatica = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/vendas", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResultado(data)
    } catch (error) {
      setResultado({
        success: false,
        message: "Erro na detecção automática",
        error: (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  const limparVendas = () => {
    localStorage.removeItem("vendas_detectadas")
    setVendasDetectadas([])
    alert("Vendas detectadas removidas!")
  }

  useEffect(() => {
    const vendas = JSON.parse(localStorage.getItem("vendas_detectadas") || "[]")
    setVendasDetectadas(vendas)
  }, [])

  return (
    <div className="min-h-screen bg-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-purple-900 mb-2">Teste de Webhook de Vendas</h1>
          <p className="text-gray-600">Sistema de detecção de vendas para avaliação nutricional</p>
        </div>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <Send className="w-5 h-5 mr-2" />
              Simular Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-800">Nome</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  className="border-purple-300 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-800">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="border-purple-300 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-800">Telefone</label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  className="border-purple-300 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-800">Valor (R$)</label>
                <Input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => handleInputChange("valor", e.target.value)}
                  className="border-purple-300 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-800">Produto</label>
                <Input
                  value={formData.produto}
                  onChange={(e) => handleInputChange("produto", e.target.value)}
                  className="border-purple-300 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-800">Variante</label>
                <select
                  value={formData.variante}
                  onChange={(e) => handleInputChange("variante", e.target.value)}
                  className="w-full border border-purple-300 rounded px-3 py-2 focus:border-purple-500"
                >
                  <option value="testbx4">Base Completa</option>
                  <option value="testbx5">Com Agendamento</option>
                  <option value="testbx6">Com Depoimentos</option>
                  <option value="testbx7">Texto Alterado</option>
                  <option value="testbx8">Botões Continuar</option>
                  <option value="testbx9">Efeitos Visuais</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={enviarWebhookVenda}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Enviando..." : "Enviar Webhook de Venda"}
              </Button>
              <Button
                onClick={detectarVendaAutomatica}
                disabled={loading}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Utensils className="w-4 h-4 mr-2" />
                Detectar Venda Automática
              </Button>
            </div>
          </CardContent>
        </Card>

        {resultado && (
          <Card
            className={`border-2 ${resultado.success ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}
          >
            <CardHeader>
              <CardTitle className={`flex items-center ${resultado.success ? "text-green-800" : "text-red-800"}`}>
                {resultado.success ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertTriangle className="w-5 h-5 mr-2" />
                )}
                {resultado.success ? "Venda Registrada com Sucesso!" : "Erro no Processamento"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-white p-4 rounded border overflow-auto">
                {JSON.stringify(resultado, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="border-purple-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-purple-800">
                <DollarSign className="w-5 h-5 mr-2" />
                Vendas Detectadas ({vendasDetectadas.length})
              </CardTitle>
              <Button onClick={limparVendas} variant="outline" size="sm" className="border-red-300 text-red-600">
                Limpar Vendas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {vendasDetectadas.length > 0 ? (
              <div className="space-y-3">
                {vendasDetectadas
                  .slice(-10)
                  .reverse()
                  .map((venda, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                    >
                      <div>
                        <p className="font-medium text-purple-800">{venda.nome}</p>
                        <p className="text-sm text-purple-600">
                          {venda.email} • {venda.telefone}
                        </p>
                        <div className="flex space-x-2 mt-1">
                          <Badge variant="outline" className="border-purple-300 text-purple-700 text-xs">
                            {venda.variante}
                          </Badge>
                          <Badge variant="outline" className="border-purple-300 text-purple-700 text-xs">
                            {venda.produto}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-700">R$ {venda.valor}</p>
                        <p className="text-xs text-gray-500">{new Date(venda.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <p className="text-purple-600">Nenhuma venda detectada ainda</p>
                <p className="text-sm text-gray-500">Simule uma venda usando o formulário acima</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Como Integrar com seu Sistema de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold mb-2 text-purple-800">Endpoint para Receber Vendas:</h4>
              <code className="text-sm bg-white p-2 rounded block border border-purple-200">POST /api/vendas</code>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold mb-2 text-purple-800">Formato dos Dados (JSON):</h4>
              <pre className="text-sm bg-white p-2 rounded border border-purple-200 overflow-auto">
                {`{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "(11) 99999-9999",
  "valor": 197,
  "produto": "Consulta Nutricional",
  "variante": "testbx9",
  "timestamp": "2024-01-01T10:00:00Z"
}`}
              </pre>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-800">Detecção Automática:</h4>
              <p className="text-sm text-blue-700">
                O sistema pode detectar vendas automaticamente comparando dados de email, nome ou telefone entre as
                avaliações completadas e as vendas registradas. Isso permite rastrear qual variante gerou cada venda.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
