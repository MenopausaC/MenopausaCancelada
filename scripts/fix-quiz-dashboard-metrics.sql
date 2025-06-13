-- Verificar e corrigir estrutura da tabela QUIZ_DASHBOARD
-- Adicionar colunas que podem estar faltando

-- Verificar se as colunas existem e adicionar se necessário
DO $$ 
BEGIN
    -- Adicionar coluna urgencia se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QUIZ_DASHBOARD' AND column_name = 'urgencia') THEN
        ALTER TABLE "QUIZ_DASHBOARD" ADD COLUMN urgencia TEXT;
    END IF;

    -- Adicionar coluna expectativa_melhora se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QUIZ_DASHBOARD' AND column_name = 'expectativa_melhora') THEN
        ALTER TABLE "QUIZ_DASHBOARD" ADD COLUMN expectativa_melhora TEXT;
    END IF;

    -- Adicionar coluna converteu se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QUIZ_DASHBOARD' AND column_name = 'converteu') THEN
        ALTER TABLE "QUIZ_DASHBOARD" ADD COLUMN converteu BOOLEAN DEFAULT FALSE;
    END IF;

    -- Adicionar coluna valor_conversao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QUIZ_DASHBOARD' AND column_name = 'valor_conversao') THEN
        ALTER TABLE "QUIZ_DASHBOARD" ADD COLUMN valor_conversao DECIMAL(10,2);
    END IF;

    -- Adicionar coluna data_conversao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QUIZ_DASHBOARD' AND column_name = 'data_conversao') THEN
        ALTER TABLE "QUIZ_DASHBOARD" ADD COLUMN data_conversao TIMESTAMP;
    END IF;

    -- Adicionar coluna tempo_para_conversao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QUIZ_DASHBOARD' AND column_name = 'tempo_para_conversao') THEN
        ALTER TABLE "QUIZ_DASHBOARD" ADD COLUMN tempo_para_conversao INTEGER;
    END IF;

END $$;

-- Atualizar dados existentes com valores padrão se necessário
UPDATE "QUIZ_DASHBOARD" 
SET urgencia = 'media' 
WHERE urgencia IS NULL;

UPDATE "QUIZ_DASHBOARD" 
SET converteu = FALSE 
WHERE converteu IS NULL;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'QUIZ_DASHBOARD' 
ORDER BY ordinal_position;
