import { NextResponse } from "next/server"

// Esta rota permite configurar a URL do webhook do CRM
// Você pode chamar esta rota para atualizar a URL do webhook sem precisar reimplantar a aplicação

export async function POST(request: Request) {
  try {
    // Verificar autenticação (você deve implementar uma autenticação adequada)
    // Este é apenas um exemplo simples
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    // Verificar o token (substitua por sua lógica de autenticação)
    if (token !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Token inválido" }, { status: 403 })
    }

    // Obter os dados da requisição
    const { webhookUrl, apiKey } = await request.json()

    if (!webhookUrl) {
      return NextResponse.json({ error: "URL do webhook é obrigatória" }, { status: 400 })
    }

    // Em um ambiente real, você salvaria essas configurações em um banco de dados
    // Aqui estamos apenas simulando a configuração

    // Atualizar as variáveis de ambiente (isso não funciona em produção, é apenas ilustrativo)
    // Em produção, você deve usar um banco de dados ou serviço de configuração
    process.env.CRM_WEBHOOK_URL = webhookUrl
    if (apiKey) {
      process.env.CRM_API_KEY = apiKey
    }

    return NextResponse.json({
      success: true,
      message: "Configuração atualizada com sucesso",
      config: {
        webhookUrl,
        apiKeyConfigured: !!apiKey,
      },
    })
  } catch (error) {
    console.error("Erro ao atualizar configuração:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao atualizar configuração",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
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

  // Retornar a configuração atual
  return NextResponse.json({
    webhookUrl: process.env.CRM_WEBHOOK_URL || null,
    apiKeyConfigured: !!process.env.CRM_API_KEY,
  })
}
