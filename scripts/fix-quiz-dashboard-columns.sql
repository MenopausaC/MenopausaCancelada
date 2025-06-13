-- Adicionar colunas que estão faltando na tabela QUIZ_DASHBOARD
ALTER TABLE "QUIZ_DASHBOARD" 
ADD COLUMN IF NOT EXISTS tempo_total INTEGER;

-- Verificar se todas as colunas necessárias existem
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'QUIZ_DASHBOARD'
AND column_name IN (
  'tempo_total',
  'tempo_total_questionario', 
  'pontuacao_total',
  'categoria_sintomas',
  'motivos_qualificacao',
  'sintomas_identificados'
)
ORDER BY column_name;

-- Mostrar estrutura completa da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'QUIZ_DASHBOARD'
ORDER BY ordinal_position;

-- Teste de inserção com os campos corretos
INSERT INTO "QUIZ_DASHBOARD" (
  nome, 
  email, 
  idade,
  tempo_total,
  pontuacao_total,
  categoria_sintomas,
  urgencia,
  prioridade,
  origem
) VALUES (
  'Teste Make',
  'teste.make@email.com',
  55,
  18121,
  100,
  'Ganho de Peso Descontrolado',
  'alta',
  5,
  'testbx4'
);

SELECT 'Teste inserido com sucesso!' as status;
