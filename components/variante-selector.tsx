"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Play } from "lucide-react"

const VARIANTES = [
  {
    id: "testbx4",
    nome: "Base Completa",
    descricao: "Versão Base com Questionário Completo",
    features: ["Questionário médico completo", "Sistema de tracking", "Integração ActiveCampaign"],
    cor: "bg-blue-500",
  },
  {
    id: "testbx5",
    nome: "Com Agendamento",
    descricao: "Versão com Botão para Agendamento",
    features: ["Todas as features da Base", "Botão de agendamento", "Valor fixo R$197"],
    cor: "bg-green-500",
  },
  {
    id: "testbx6",
    nome: "Com Depoimentos",
    descricao: "Versão com Depoimentos e Empatia",
    features: ["Todas as features anteriores", "Depoimentos rotativos", "Design empático"],
    cor: "bg-purple-500",
  },
  {
    id: "testbx7",
    nome: "Texto Alterado",
    descricao: "Versão com Alterações de Texto",
    features: ["Todas as features anteriores", "Copy otimizado", "Messaging atualizado"],
    cor: "bg-orange-500",
  },
  {
    id: "testbx8",
    nome: "Botões Continuar",
    descricao: "Versão com Botões Continuar",
    features: ["Todas as features anteriores", "Botões 'Continuar' visíveis", "UX melhorada"],
    cor: "bg-pink-500",
  },
  {
    id: "testbx9",
    nome: "Efeitos Visuais",
    descricao: "Versão com Efeitos Visuais",
    features: ["Todas as features anteriores", "Animações sutis", "Efeitos visuais"],
    cor: "bg-indigo-500",
  },
]

export default function VarianteSelector() {
  const [varianteSelecionada, setVarianteSelecionada] = useState("testbx9")

  const abrirVariante = (varianteId: string) => {
    const url = `/?variante=${varianteId}`
    window.open(url, "_blank")
  }

  const abrirDashboard = () => {
    window.open("/dashboard", "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Quiz Menopausa - Seletor de Variantes</h1>
          <p className="text-gray-600 mb-6">Escolha uma variante para testar ou acesse o dashboard de analytics</p>
          <Button onClick={abrirDashboard} className="mb-8">
            <Settings className="w-4 h-4 mr-2" />
            Acessar Dashboard
          </Button>
        </div>

        {/* Grid de Variantes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VARIANTES.map((variante) => (
            <Card key={variante.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-4 h-4 rounded-full ${variante.cor}`} />
                  <Badge variant="outline">{variante.id}</Badge>
                </div>
                <CardTitle className="text-lg">{variante.nome}</CardTitle>
                <p className="text-sm text-gray-600">{variante.descricao}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <h4 className="font-semibold text-sm">Funcionalidades:</h4>
                  <ul className="space-y-1">
                    {variante.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => abrirVariante(variante.id)}
                  className="w-full"
                  variant={varianteSelecionada === variante.id ? "default" : "outline"}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Testar Variante
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Para testar uma variante:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Clique em "Testar Variante" no card desejado</li>
                <li>Uma nova aba será aberta com a variante selecionada</li>
                <li>Complete o questionário para gerar dados de tracking</li>
                <li>Acesse o dashboard para ver as métricas</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Para acessar diretamente via URL:</h4>
              <p className="text-sm text-gray-600 mb-2">
                Adicione o parâmetro <code className="bg-gray-100 px-1 rounded">?variante=ID</code> na URL:
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">https://seudominio.com/?variante=testbx9</div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Dashboard de Analytics:</h4>
              <p className="text-sm text-gray-600">
                Acesse <code className="bg-gray-100 px-1 rounded">/dashboard</code> para ver métricas detalhadas.
                <br />
                <strong>Login:</strong> admin | <strong>Senha:</strong> menopausa2024
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
