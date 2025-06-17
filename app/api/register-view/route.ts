import { NextResponse } from "next/server"

const makeViewWebhookUrl = process.env.MAKE_VIEW_WEBHOOK_URL

// Funções de detecção de informações do dispositivo (mantidas as mesmas)
function detectarInformacoesDispositivo(userAgent: string) {
  const detectarDispositivo = (ua: string) => {
    if (/Mobile|Android|iPhone/.test(ua)) return "Mobile"
    if (/Tablet|iPad/.test(ua)) return "Tablet"
    return "Desktop"
  }

  const detectarSO = (ua: string) => {
    if (/Windows NT 10/.test(ua)) return "Windows 10"
    if (/Windows NT/.test(ua)) return "Windows"
    if (/Mac OS X/.test(ua)) return "macOS"
    if (/Linux/.test(ua)) return "Linux"
    if (/Android/.test(ua)) return "Android"
    if (/iPhone|iPad/.test(ua)) return "iOS"
    return "Desconhecido"
  }

  const detectarNavegador = (ua: string) => {
    if (/Edg/.test(ua)) return "Edge"
    if (/Chrome/.test(ua)) return "Chrome"
    if (/Firefox/.test(ua)) return "Firefox"
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari"
    return "Desconhecido"
  }

  return {
    dispositivo: detectarDispositivo(userAgent),
    sistema_operacional: detectarSO(userAgent),
    navegador: detectarNavegador(userAgent),
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    console.log("🎯 Webhook de View recebeu requisição")

    let dados
    try {
      dados = await request.json()
    } catch (error) {
      console.error("❌ Erro ao parsear JSON da view:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Dados JSON inválidos para view",
          error: "invalid_json",
        },
        { status: 400 },
      )
    }

    const userAgent = request.headers.get("user-agent") || ""
    const infoDispositivo = detectarInformacoesDispositivo(userAgent)

    const dadosProcessados = {
      ...dados,
      user_agent: userAgent,
      dispositivo: infoDispositivo.dispositivo,
      sistema_operacional: infoDispositivo.sistema_operacional,
      navegador: infoDispositivo.navegador,
      ip_address:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        "unknown",
      referrer: request.headers.get("referer") || null,
      timestamp: dados.timestamp || new Date().toISOString(),
    }

    console.log("📦 Dados de view recebidos e processados:", dadosProcessados)

    if (makeViewWebhookUrl) {
      try {
        console.log("📤 Enviando dados de view para Make webhook...")
        const makeResponse = await fetch(makeViewWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosProcessados),
        })

        if (makeResponse.ok) {
          console.log("✅ Dados de view enviados com sucesso para Make")
          const processTime = Date.now() - startTime
          return NextResponse.json({
            success: true,
            message: "View processada e encaminhada com sucesso para Make.com",
            processTime: `${processTime}ms`,
            timestamp: new Date().toISOString(),
            forwarded_data: dadosProcessados,
          })
        } else {
          const errorText = await makeResponse.text()
          console.error("❌ Erro ao enviar view para Make:", errorText)
          return NextResponse.json(
            {
              success: false,
              message: "Erro ao encaminhar view para Make.com",
              make_error: errorText,
            },
            { status: 500 },
          )
        }
      } catch (makeError) {
        console.error("❌ Erro ao chamar Make webhook de view:", makeError)
        return NextResponse.json(
          {
            success: false,
            message: "Erro ao chamar Make.com para view",
            error: (makeError as Error).message,
          },
          { status: 500 },
        )
      }
    } else {
      console.warn("⚠️ MAKE_VIEW_WEBHOOK_URL não configurado. Dados de view não enviados para Make.")
      return NextResponse.json({
        success: true,
        message: "Dados de view processados (MAKE_VIEW_WEBHOOK_URL não configurado)",
        processTime: `${Date.now() - startTime}ms`,
        processed_data: dadosProcessados,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    const processTime = Date.now() - startTime
    console.error("❌ Erro crítico ao processar webhook de view:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor ao processar view",
        error: (error as Error).message,
        processTime: `${processTime}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook de View está funcionando",
    timestamp: new Date().toISOString(),
    make_view_webhook_configured: !!makeViewWebhookUrl,
  })
}
