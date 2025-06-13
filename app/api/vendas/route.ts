import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("🎯 Webhook de vendas recebeu uma requisição")

    // Obter os dados do corpo da requisição
    const dados = await request.json()

    console.log("📦 Dados de venda recebidos:", JSON.stringify(dados, null, 2))

    // Extrair informações da venda
    const {
      nome,
      email,
      telefone,
      valor,
      produto,
      variante,
      timestamp = new Date().toISOString(),
      ...outrosDados
    } = dados

    // Validar dados obrigatórios
    if (!nome && !email && !telefone) {
      console.error("❌ Dados insuficientes para identificar a venda")
      return NextResponse.json(
        {
          success: false,
          message: "Dados insuficientes - é necessário pelo menos nome, email ou telefone",
          error: "missing_identification_data",
        },
        { status: 400 },
      )
    }

    // Estruturar dados da venda
    const vendaData = {
      nome: nome || "Não informado",
      email: email || "Não informado",
      telefone: telefone || "Não informado",
      valor: Number.parseFloat(valor) || 0,
      produto: produto || "Consulta Nutricional",
      variante: variante || "desconhecida",
      timestamp,
      dadosCompletos: outrosDados,
      origem: "webhook-vendas",
    }

    console.log("✅ Venda processada:", vendaData)

    // Aqui você pode:
    // 1. Salvar no banco de dados
    // 2. Enviar para analytics
    // 3. Integrar com outros sistemas
    // 4. Disparar automações

    // Simular salvamento (em produção, salvar no banco)
    console.log("💾 Salvando venda no sistema...")

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: "Venda registrada com sucesso",
      vendaId: `venda_${Date.now()}`,
      timestamp: new Date().toISOString(),
      dadosProcessados: vendaData,
    })
  } catch (error) {
    console.error("❌ Erro ao processar venda:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar venda",
        error: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 },
    )
  }
}

// Endpoint para detectar vendas baseado em dados do quiz
export async function PUT(request: Request) {
  try {
    console.log("🔍 Detectando venda baseada em dados do quiz")

    const { nome, email, telefone, valor = 197, produto = "Consulta Nutricional", variante } = await request.json()

    // Buscar no localStorage se há dados correspondentes
    // (Em produção, isso seria uma consulta no banco de dados)

    const vendaDetectada = {
      nome,
      email,
      telefone,
      valor,
      produto,
      variante,
      timestamp: new Date().toISOString(),
      origem: "deteccao-automatica",
      status: "detectada",
    }

    console.log("✅ Venda detectada automaticamente:", vendaDetectada)

    return NextResponse.json({
      success: true,
      message: "Venda detectada e registrada",
      venda: vendaDetectada,
    })
  } catch (error) {
    console.error("❌ Erro na detecção de venda:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Erro na detecção de venda",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
