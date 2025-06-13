-- Criar tabela QUIZ DASHBOARD se não existir
CREATE TABLE IF NOT EXISTS public."QUIZ DASHBOARD" (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  nome text NOT NULL,
  email text NOT NULL,
  telefone text NULL,
  idade integer NULL,
  categoria_sintomas text NULL,
  pontuacao_total integer NULL,
  urgencia text NULL,
  expectativa_melhora text NULL,
  score_qualificacao integer NULL,
  categoria_lead text NULL,
  prioridade integer NULL,
  motivos_qualificacao text NULL,
  sintomas_identificados jsonb NULL,
  respostas_detalhadas jsonb NULL,
  tempo_total_questionario integer NULL,
  tempo_medio_resposta integer NULL,
  voltas_perguntas integer NULL,
  engajamento text NULL,
  hesitacao_perguntas text NULL,
  tempo_tela_final integer NULL,
  timestamp timestamp with time zone NULL,
  user_agent text NULL,
  origem text NULL,
  versao_questionario text NULL,
  acao text NULL,
  dispositivo text NULL,
  sistema_operacional text NULL,
  navegador text NULL,
  resolucao text NULL,
  referrer text NULL,
  utm_source text NULL,
  utm_medium text NULL,
  utm_campaign text NULL,
  ip_address text NULL,
  criado_em timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT quiz_respostas_duplicate_pkey PRIMARY KEY (id)
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS quiz_respostas_duplicate_email_idx 
ON public."QUIZ DASHBOARD" USING btree (email);

CREATE INDEX IF NOT EXISTS quiz_respostas_duplicate_criado_em_idx 
ON public."QUIZ DASHBOARD" USING btree (criado_em);

CREATE INDEX IF NOT EXISTS quiz_respostas_duplicate_categoria_lead_idx 
ON public."QUIZ DASHBOARD" USING btree (categoria_lead);

CREATE INDEX IF NOT EXISTS quiz_respostas_duplicate_urgencia_idx 
ON public."QUIZ DASHBOARD" USING btree (urgencia);

-- Inserir dados de teste para verificar se está funcionando
INSERT INTO public."QUIZ DASHBOARD" (
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
  '["Ganho de Peso Descontrolado", "Calores e Suores Frequentes"]',
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
) ON CONFLICT (email) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 
  nome, 
  email, 
  categoria_sintomas, 
  categoria_lead, 
  criado_em 
FROM public."QUIZ DASHBOARD" 
WHERE email = 'maria.teste@email.com';

-- Mostrar estatísticas da tabela
SELECT 
  COUNT(*) as total_registros,
  COUNT(DISTINCT categoria_lead) as categorias_lead,
  COUNT(DISTINCT urgencia) as tipos_urgencia,
  AVG(pontuacao_total) as pontuacao_media
FROM public."QUIZ DASHBOARD";
