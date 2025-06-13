import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Obter os dados do corpo da requisição
    const data = await request.json()

    // Estruturar a resposta no formato solicitado
    const response = {
      dadosContatoCollection: {
        nome: data.nome || "Desconhecido",
        email: data.email || "no-email@example.com",
        telefone: data.telefone || "00000000000",
        idade: data.idade || 0,
      },
      analiseCollection: {
        categoria: data.categoria_sintomas || data.categoria || "",
        pontuacaoTotal: data.pontuacao_total || data.pontuacaoTotal || 0,
        urgencia: data.urgencia || "",
        expectativa: data.expectativa_melhora || data.expectativa || "",
        sintomas: data.sintomas_identificados || data.sintomas || {},
      },
      qualificacaoLeadCollection: {
        score: data.score_qualificacao || data.score || 0,
        categoria: data.categoria_lead || "",
        prioridade: data.prioridade || 0,
        motivos: data.motivos_qualificacao
          ? typeof data.motivos_qualificacao === "string"
            ? JSON.parse(data.motivos_qualificacao)
            : data.motivos_qualificacao
          : [],
        comportamento: {
          tempoMedioResposta: data.tempo_medio_resposta || 0,
          tempoTotalQuestionario: data.tempo_total_questionario || data.tempoTotal || 0,
          voltasPerguntas: data.voltas_perguntas || 0,
          engajamento: data.engajamento || "MEDIO",
        },
      },
      respostasCollection: data.respostas_detalhadas || data.respostas || {},
      variante: data.versao_questionario || data.variante || "",
      tempoTotal: data.tempo_total_questionario || data.tempoTotal || 0,
      timestamp: data.timestamp || new Date().toISOString(),
      origem: data.origem || "",
      dispositivo: data.dispositivo || "",
      navegador: data.navegador || "",
      sistema: data.sistema_operacional || "",
    }

    console.log("✅ Dados formatados com sucesso:", {
      nome: response.dadosContatoCollection.nome,
      email: response.dadosContatoCollection.email,
      categoria: response.analiseCollection.categoria,
      origem: response.origem,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Erro ao formatar dados:", error)

    return NextResponse.json(
      {
        error: "Erro ao processar os dados",
        message: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

// Método GET para verificar se a API está funcionando
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API de formatação de dados está funcionando",
    timestamp: new Date().toISOString(),
  })
}
