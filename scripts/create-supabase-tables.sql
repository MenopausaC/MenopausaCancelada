-- Criar tabela para leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  idade TEXT,
  categoria TEXT,
  pontuacao INTEGER,
  variante TEXT,
  tempo_total INTEGER,
  respostas JSONB,
  analise JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para views/sessões
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variante TEXT,
  user_agent TEXT,
  url TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_variante ON leads(variante);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_variante ON sessions(variante);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir inserção e leitura
CREATE POLICY IF NOT EXISTS "Allow insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow select leads" ON leads FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow insert sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow select sessions" ON sessions FOR SELECT USING (true);
