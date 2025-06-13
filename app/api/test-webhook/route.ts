import { NextResponse } from "next/server"

// Esta rota permite testar o webhook do CRM
// Você pode chamar esta rota para enviar dados de teste para o CRM

export async function POST(request: Request) {
  try {
    // Verificar autenticação (você deve implementar uma autenticação adequada)
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    // Verificar o token (substitua por sua lógica de autenticação)
    if (token !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Token inválido" }, { status: 403 })
    }

    // Criar dados de teste
    const dadosTeste = {
      dadosContato: {
        nome: "Maria Teste",
        email: "maria.teste@exemplo.com",
        telefone: "(11) 99999-9999",
        idade: "55",
      },
      respostas: {
        sintoma_principal: {
          pergunta: "sintoma_principal",
          resposta: "Calores repentinos e suores",
          pontos: 8,
          tempo: 5000,
        },
        frequencia_fogachos: {
          pergunta: "frequencia_fogachos",
          resposta: "Todo dia pelo menos uma vez",
          pontos: 8,
          tempo: 3000,
        },
      },
      analise: {
        pontuacaoTotal: 45,
        categoria: "Sintomas Moderados",
        descricao: "Sua avaliação mostra que você precisa de cuidados.",
        expectativa: "96% das mulheres melhoram muito",
        urgencia: "media",
        sintomas: [
          {
            nome: "Calores e Suores Frequentes",
            urgencia: "alta",
            explicacao: "Esses calores atrapalham seu dia a dia e precisam de atenção médica.",
          },
        ],
      },
      qualificacaoLead: {
        score: 65,
        categoria: "QUENTE",
        prioridade: 4,
        motivos: ["Múltiplos sintomas severos", "Tempo de reflexão adequado"],
        comportamento: {
          tempoMedioResposta: 4000,
          tempoTotalQuestionario: 180000,
          tempoTelaFinal: 45000,
          voltasPerguntas: 1,
          hesitacaoPerguntas: [],
          engajamento: "ALTO",
        },
      },
      timestamp: new Date().toISOString(),
      metadados: {
        voltasPerguntas: 1,
        userAgent: "Teste de API",
        origem: "teste-webhook",
      },
    }

    // Enviar dados para o webhook do CRM
    const crmUrl = process.env.CRM_WEBHOOK_URL

    if (!crmUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "URL do webhook não configurada",
        },
        { status: 400 },
      )
    }

    const crmResponse = await fetch(crmUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRM_API_KEY || ""}`,
      },
      body: JSON.stringify({
        nome: dadosTeste.dadosContato.nome,
        email: dadosTeste.dadosContato.email,
        telefone: dadosTeste.dadosContato.telefone,
        idade: dadosTeste.dadosContato.idade,
        respostas: dadosTeste.respostas,
        pontuacao: dadosTeste.analise.pontuacaoTotal,
        categoria: dadosTeste.analise.categoria,
        qualificacao: dadosTeste.qualificacaoLead.categoria,
        prioridade: dadosTeste.qualificacaoLead.prioridade,
        sintomas: dadosTeste.analise.sintomas.map((s: any) => s.nome).join(", "),
        timestamp: dadosTeste.timestamp,
        origem: "teste-webhook",
      }),
    })

    if (!crmResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao enviar para CRM",
          error: await crmResponse.text(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Dados de teste enviados com sucesso",
      dadosEnviados: dadosTeste,
    })
  } catch (error) {
    console.error("Erro ao testar webhook:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao testar webhook",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
