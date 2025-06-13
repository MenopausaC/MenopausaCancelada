-- Criar tabela para armazenar conversões (vendas)
CREATE TABLE IF NOT EXISTS conversoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Referência ao lead original
  lead_id UUID,
  lead_email TEXT,
  lead_nome TEXT,
  lead_variante TEXT,
  lead_categoria TEXT,
  lead_pontuacao INTEGER,
  lead_criado_em TIMESTAMPTZ,
  
  -- Dados da compra (Hubla)
  payment_id TEXT UNIQUE NOT NULL,
  payment_status TEXT,
  payment_amount DECIMAL(10,2),
  payment_currency TEXT DEFAULT 'BRL',
  payment_created_at TIMESTAMPTZ,
  payment_approved_at TIMESTAMPTZ,
  
  -- Dados do cliente
  customer_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_document TEXT,
  
  -- Dados do produto
  product_id TEXT,
  product_name TEXT,
  product_price DECIMAL(10,2),
  
  -- Métricas de conversão
  tempo_para_conversao INTEGER, -- em segundos
  
  -- Metadados
  evento_hubla TEXT,
  metadata JSONB,
  
  -- Timestamps
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversoes_lead_id ON conversoes(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversoes_payment_id ON conversoes(payment_id);
CREATE INDEX IF NOT EXISTS idx_conversoes_customer_email ON conversoes(customer_email);
CREATE INDEX IF NOT EXISTS idx_conversoes_lead_variante ON conversoes(lead_variante);
CREATE INDEX IF NOT EXISTS idx_conversoes_criado_em ON conversoes(criado_em);

-- Adicionar colunas na tabela QUIZ_DASHBOARD para tracking de conversão
ALTER TABLE "QUIZ_DASHBOARD" 
ADD COLUMN IF NOT EXISTS converteu BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS valor_conversao DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS data_conversao TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tempo_para_conversao INTEGER;

-- Índice para conversões na tabela principal
CREATE INDEX IF NOT EXISTS idx_quiz_dashboard_converteu ON "QUIZ_DASHBOARD"(converteu);
CREATE INDEX IF NOT EXISTS idx_quiz_dashboard_payment_id ON "QUIZ_DASHBOARD"(payment_id);
