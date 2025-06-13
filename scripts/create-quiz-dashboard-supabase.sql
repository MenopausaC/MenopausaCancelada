-- Remover tabela se existir (cuidado em produção!)
DROP TABLE IF EXISTS "QUIZ_DASHBOARD" CASCADE;

-- Criar tabela QUIZ_DASHBOARD
CREATE TABLE "QUIZ_DASHBOARD" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  idade INTEGER,
  categoria_sintomas TEXT,
  pontuacao_total INTEGER,
  urgencia TEXT,
  expectativa_melhora TEXT,
  score_qualificacao INTEGER,
  categoria_lead TEXT,
  prioridade INTEGER,
  motivos_qualificacao JSONB,
  sintomas_identificados JSONB,
  respostas_detalhadas JSONB,
  tempo_total_questionario INTEGER,
  tempo_medio_resposta INTEGER,
  voltas_perguntas INTEGER,
  engajamento TEXT,
  hesitacao_perguntas TEXT,
  tempo_tela_final INTEGER,
  timestamp TIMESTAMPTZ,
  user_agent TEXT,
  origem TEXT,
  versao_questionario TEXT,
  acao TEXT,
  dispositivo TEXT,
  sistema_operacional TEXT,
  navegador TEXT,
  resolucao TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS quiz_dashboard_email_idx ON "QUIZ_DASHBOARD" (email);
CREATE INDEX IF NOT EXISTS quiz_dashboard_criado_em_idx ON "QUIZ_DASHBOARD" (criado_em);
CREATE INDEX IF NOT EXISTS quiz_dashboard_categoria_lead_idx ON "QUIZ_DASHBOARD" (categoria_lead);
CREATE INDEX IF NOT EXISTS quiz_dashboard_urgencia_idx ON "QUIZ_DASHBOARD" (urgencia);

-- Inserir dados de teste
INSERT INTO "QUIZ_DASHBOARD" (
  nome, 
  email, 
  telefone, 
  idade, 
  categoria_sintomas, 
  pontuacao_total, 
  urgencia, 
  expectativa_melhora,
  score_qualificacao,
  categoria_lead,
  prioridade,
  motivos_qualificacao,
  sintomas_identificados,
  respostas_detalhadas,
  tempo_total_questionario,
  tempo_medio_resposta,
  voltas_perguntas,
  engajamento,
  origem,
  versao_questionario,
  acao,
  dispositivo,
  sistema_operacional,
  navegador,
  ip_address
) VALUES (
  'Maria Silva Teste',
  'maria.teste@email.com',
  '11999999999',
  52,
  'Sintomas Intensos',
  67,
  'alta',
  '97% das mulheres melhoram com nutrição especializada',
  67,
  'QUENTE',
  5,
  '["Ganho de Peso Descontrolado", "Calores e Suores Frequentes"]'::jsonb,
  '[{"nome": "Ganho de Peso Descontrolado", "urgencia": "alta"}]'::jsonb,
  '{"sintoma_principal": {"resposta": "Ganho de peso descontrolado", "pontos": 9}}'::jsonb,
  180000,
  8500,
  2,
  'ALTO',
  'teste-sql',
  'testbx9',
  'lead_registrado',
  'Desktop',
  'Windows',
  'Chrome',
  '127.0.0.1'
);

-- Verificar se a tabela foi criada
SELECT 
  COUNT(*) as total_registros,
  'Tabela criada com sucesso!' as status
FROM "QUIZ_DASHBOARD";

-- Mostrar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'QUIZ_DASHBOARD'
ORDER BY ordinal_position;
