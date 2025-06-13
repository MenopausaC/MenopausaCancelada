-- Verificar os valores atuais das variantes
SELECT 
  versao_questionario, 
  variante, 
  origem, 
  COUNT(*) as total 
FROM 
  QUIZ_DASHBOARD 
GROUP BY 
  versao_questionario, 
  variante, 
  origem 
ORDER BY 
  total DESC;

-- Atualizar registros onde a variante está em um formato incorreto
UPDATE QUIZ_DASHBOARD
SET variante = REGEXP_REPLACE(variante, '.*?(testbx[0-9]+).*', '\1')
WHERE variante LIKE '%testbx%';

UPDATE QUIZ_DASHBOARD
SET versao_questionario = REGEXP_REPLACE(versao_questionario, '.*?(testbx[0-9]+).*', '\1')
WHERE versao_questionario LIKE '%testbx%';

-- Verificar novamente após a correção
SELECT 
  versao_questionario, 
  variante, 
  origem, 
  COUNT(*) as total 
FROM 
  QUIZ_DASHBOARD 
GROUP BY 
  versao_questionario, 
  variante, 
  origem 
ORDER BY 
  total DESC;

-- Verificar a qualificação dos leads
SELECT 
  categoria_lead, 
  COUNT(*) as total 
FROM 
  QUIZ_DASHBOARD 
GROUP BY 
  categoria_lead 
ORDER BY 
  total DESC;

-- Verificar a distribuição de pontuação
SELECT 
  MIN(pontuacao_total) as min_pontuacao,
  MAX(pontuacao_total) as max_pontuacao,
  AVG(pontuacao_total) as media_pontuacao,
  COUNT(*) as total_leads
FROM 
  QUIZ_DASHBOARD;

-- Verificar leads por variante com qualificação
SELECT 
  COALESCE(variante, versao_questionario, origem, 'desconhecido') as variante_detectada,
  categoria_lead,
  COUNT(*) as total_leads
FROM 
  QUIZ_DASHBOARD 
GROUP BY 
  variante_detectada, 
  categoria_lead 
ORDER BY 
  variante_detectada, 
  categoria_lead;
