import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase = null
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Interface para dados da Hubla
interface HublaWebhookData {
  event: string // 'payment.approved', 'payment.pending', 'payment.cancelled'
  payment: {
    id: string
    status: string
    amount: number
    currency: string
    created_at: string
    approved_at?: string
  }
  customer: {
    id: string
    name: string
    email: string
    phone?: string
    document?: string
  }
  product: {
    id: string
    name: string
    price: number
  }
  metadata?: {
    lead_id?: string
    variante?: string
    utm_source?: string
    utm_campaign?: string
  }
}

// Função para correlacionar lead com compra
async function correlacionarLeadCompra(dadosHubla: HublaWebhookData) {
  if (!supabase) {
    console.warn("⚠️ Supabase não configurado")
    return null
  }

  try {
    const { customer, payment, metadata } = dadosHubla

    // 1. Buscar lead pelo email (principal)
    let { data: leadEncontrado } = await supabase
      .from("QUIZ_DASHBOARD")
      .select("*")
      .eq("email", customer.email.toLowerCase().trim())
      .order("criado_em", { ascending: false })
      .limit(1)

    // 2. Se não encontrou pelo email, tentar pelo telefone
    if (!leadEncontrado || leadEncontrado.length === 0) {
      if (customer.phone) {
        const telefoneFormatado = customer.phone.replace(/\D/g, "")
        const { data: leadPorTelefone } = await supabase
          .from("QUIZ_DASHBOARD")
          .select("*")
          .or(`telefone.ilike.%${telefoneFormatado}%`)
          .order("criado_em", { ascending: false })
          .limit(1)

        leadEncontrado = leadPorTelefone
      }
    }

    // 3. Se não encontrou pelo telefone, tentar pelo nome
    if (!leadEncontrado || leadEncontrado.length === 0) {
      const nomeFormatado = customer.name.toLowerCase().trim()
      const { data: leadPorNome } = await supabase
        .from("QUIZ_DASHBOARD")
        .select("*")
        .ilike("nome", `%${nomeFormatado}%`)
        .order("criado_em", { ascending: false })
        .limit(1)

      leadEncontrado = leadPorNome
    }

    if (leadEncontrado && leadEncontrado.length > 0) {
      const lead = leadEncontrado[0]

      console.log("✅ Lead correlacionado:", {
        leadId: lead.id,
        nome: lead.nome,
        email: lead.email,
        variante: lead.versao_questionario,
        paymentId: payment.id,
      })

      return lead
    }

    console.log("⚠️ Lead não encontrado para:", {
      email: customer.email,
      nome: customer.name,
      telefone: customer.phone,
    })

    return null
  } catch (error) {
    console.error("❌ Erro ao correlacionar lead:", error)
    return null
  }
}

// Função para registrar a conversão
async function registrarConversao(lead: any, dadosHubla: HublaWebhookData) {
  if (!supabase) return null

  try {
    const { payment, customer, product } = dadosHubla

    // Dados da conversão
    const conversaoData = {
      // Dados do lead original
      lead_id: lead.id,
      lead_email: lead.email,
      lead_nome: lead.nome,
      lead_variante: lead.versao_questionario,
      lead_categoria: lead.categoria_lead,
      lead_pontuacao: lead.pontuacao_total,
      lead_criado_em: lead.criado_em,

      // Dados da compra
      payment_id: payment.id,
      payment_status: payment.status,
      payment_amount: payment.amount,
      payment_currency: payment.currency,
      payment_created_at: payment.created_at,
      payment_approved_at: payment.approved_at,

      // Dados do cliente
      customer_id: customer.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_document: customer.document,

      // Dados do produto
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,

      // Métricas de conversão
      tempo_para_conversao:
        payment.created_at && lead.criado_em
          ? Math.floor((new Date(payment.created_at).getTime() - new Date(lead.criado_em).getTime()) / 1000)
          : null,

      // Metadados
      evento_hubla: dadosHubla.event,
      metadata: dadosHubla.metadata || {},

      // Timestamp
      criado_em: new Date().toISOString(),
    }

    // Salvar na tabela de conversões
    const { data, error } = await supabase.from("conversoes").insert([conversaoData]).select()

    if (error) {
      console.error("❌ Erro ao salvar conversão:", error)
      return null
    }

    console.log("✅ Conversão registrada:", data[0])

    // Atualizar o lead original com dados da conversão
    await supabase
      .from("QUIZ_DASHBOARD")
      .update({
        converteu: true,
        payment_id: payment.id,
        valor_conversao: payment.amount,
        data_conversao: payment.approved_at || payment.created_at,
        tempo_para_conversao: conversaoData.tempo_para_conversao,
      })
      .eq("id", lead.id)

    return data[0]
  } catch (error) {
    console.error("❌ Erro ao registrar conversão:", error)
    return null
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    console.log("🎯 Webhook Hubla recebeu requisição")

    // Verificar autenticação (opcional)
    const authHeader = request.headers.get("authorization")
    const expectedToken = process.env.HUBLA_WEBHOOK_SECRET

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.warn("⚠️ Token de autenticação inválido")
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    // Obter dados do webhook
    let dadosHubla: HublaWebhookData
    try {
      dadosHubla = await request.json()
    } catch (error) {
      console.error("❌ Erro ao parsear JSON:", error)
      return NextResponse.json({ success: false, message: "JSON inválido" }, { status: 400 })
    }

    console.log("📦 Dados da Hubla:", {
      event: dadosHubla.event,
      paymentId: dadosHubla.payment?.id,
      customerEmail: dadosHubla.customer?.email,
      amount: dadosHubla.payment?.amount,
    })

    // Processar apenas eventos de pagamento aprovado
    if (dadosHubla.event === "payment.approved") {
      // Correlacionar lead com compra
      const lead = await correlacionarLeadCompra(dadosHubla)

      if (lead) {
        // Registrar conversão
        const conversao = await registrarConversao(lead, dadosHubla)

        const processTime = Date.now() - startTime

        return NextResponse.json({
          success: true,
          message: "Conversão registrada com sucesso",
          data: {
            leadId: lead.id,
            conversaoId: conversao?.id,
            variante: lead.versao_questionario,
            valor: dadosHubla.payment.amount,
            processTime: `${processTime}ms`,
          },
          timestamp: new Date().toISOString(),
        })
      } else {
        // Lead não encontrado - registrar compra órfã
        console.log("⚠️ Compra sem lead correspondente")

        const processTime = Date.now() - startTime

        return NextResponse.json({
          success: true,
          message: "Pagamento processado - lead não encontrado",
          data: {
            paymentId: dadosHubla.payment.id,
            customerEmail: dadosHubla.customer.email,
            processTime: `${processTime}ms`,
          },
          timestamp: new Date().toISOString(),
        })
      }
    } else {
      // Outros eventos (pending, cancelled, etc.)
      console.log(`📝 Evento ${dadosHubla.event} recebido mas não processado`)

      return NextResponse.json({
        success: true,
        message: `Evento ${dadosHubla.event} recebido`,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    const processTime = Date.now() - startTime
    console.error("❌ Erro crítico no webhook Hubla:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: (error as Error).message,
        processTime: `${processTime}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Método GET para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook Hubla está funcionando",
    timestamp: new Date().toISOString(),
    supabase_configured: !!supabase,
  })
}
