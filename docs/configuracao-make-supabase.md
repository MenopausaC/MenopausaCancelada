# Configuração Make + Supabase para Questionário Menopausa

## 📋 Pré-requisitos

1. **Conta no Supabase** - [supabase.com](https://supabase.com)
2. **Conta no Make** - [make.com](https://make.com)
3. **Projeto Supabase configurado**
4. **API Key do Supabase**

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Defina nome do projeto: `questionario-menopausa`
5. Defina senha do banco de dados
6. Escolha região (preferencialmente Brasil)
7. Clique em "Create new project"

### 2. Executar Script de Criação das Tabelas
1. No painel do Supabase, vá em "SQL Editor"
2. Clique em "New query"
3. Cole o conteúdo do arquivo `create-supabase-tables.sql`
4. Clique em "Run" para executar

### 3. Configurar API Keys
1. Vá em "Settings" > "API"
2. Copie a "URL" do projeto
3. Copie a "anon public" key
4. Copie a "service_role" key (para o Make)

### 4. Configurar RLS (Row Level Security)
\`\`\`sql
-- Política para permitir inserção via Make
CREATE POLICY "Permitir inserção via API" ON leads_menopausa
    FOR INSERT WITH CHECK (true);

-- Política para leitura (opcional, para dashboard)
CREATE POLICY "Permitir leitura autenticada" ON leads_menopausa
    FOR SELECT USING (auth.role() = 'authenticated');
\`\`\`

## 🔗 Configuração do Make

### 1. Criar Novo Cenário
1. Acesse [make.com](https://make.com)
2. Clique em "Create a new scenario"
3. Nomeie: "Questionário Menopausa → Supabase"

### 2. Configurar Webhook (Módulo 1)
1. Adicione módulo "Webhooks" > "Custom webhook"
2. Clique em "Add" para criar novo webhook
3. Copie a URL gerada (será usada no frontend)
4. Configure:
   - **Method**: POST
   - **Response**: 
     \`\`\`json
     {
       "status": 200,
       "body": {
         "success": true,
         "message": "Dados recebidos com sucesso"
       }
     }
     \`\`\`

### 3. Configurar Conexão Supabase
1. Vá em "Connections" no Make
2. Clique em "Add" > "Supabase"
3. Configure:
   - **Connection name**: "Supabase Menopausa"
   - **Supabase URL**: URL do seu projeto
   - **API Key**: service_role key do Supabase

### 4. Adicionar Módulo Supabase - Inserir Lead (Módulo 2)
1. Adicione módulo "Supabase" > "Insert a Record"
2. Selecione a conexão criada
3. Configure:
   - **Table**: `leads_menopausa`
   - **Data**: Mapear campos do webhook conforme JSON de exemplo

### 5. Adicionar Iterator para Sintomas (Módulo 3)
1. Adicione módulo "Flow Control" > "Iterator"
2. Configure:
   - **Array**: `{{1.lead_data.sintomas_identificados}}`

### 6. Inserir Sintomas (Módulo 4)
1. Adicione módulo "Supabase" > "Insert a Record"
2. Configure:
   - **Table**: `sintomas_identificados`
   - **Data**:
     \`\`\`
     lead_id: {{2.id}}
     nome_sintoma: {{3.nome}}
     urgencia: {{3.urgencia}}
     explicacao: {{3.explicacao}}
     \`\`\`

### 7. Iterator para Respostas (Módulo 5)
1. Adicione módulo "Flow Control" > "Iterator"
2. Configure:
   - **Array**: `{{1.lead_data.respostas_detalhadas}}`

### 8. Inserir Respostas (Módulo 6)
1. Adicione módulo "Supabase" > "Insert a Record"
2. Configure:
   - **Table**: `respostas_questionario`
   - **Data**:
     \`\`\`
     lead_id: {{2.id}}
     pergunta_id: {{5.pergunta_id}}
     resposta_texto: {{5.resposta_texto}}
     pontos: {{5.pontos}}
     tempo_resposta_ms: {{5.tempo_resposta_ms}}
     \`\`\`

### 9. Filtro para Leads Quentes (Módulo 7)
1. Adicione módulo "Flow Control" > "Filter"
2. Configure condição:
   \`\`\`
   {{2.categoria_lead}} = QUENTE OR {{2.categoria_lead}} = MUITO_QUENTE
   \`\`\`

### 10. Notificação por Email (Módulo 8)
1. Adicione módulo "Email" > "Send an Email"
2. Configure:
   - **To**: vendas@suaempresa.com
   - **Subject**: 🔥 LEAD QUENTE - {{2.nome}} - Prioridade {{2.prioridade}}
   - **Content**: Template de email com dados do lead

## 🔧 Configuração do Frontend

### 1. Variável de Ambiente
\`\`\`bash
# .env.local
NEXT_PUBLIC_MAKE_WEBHOOK_URL=https://hook.integromat.com/SEU_WEBHOOK_ID
\`\`\`

### 2. Estrutura de Dados Enviados
O frontend já está configurado para enviar os dados na estrutura correta:

\`\`\`typescript
{
  lead_data: {
    // Dados de contato
    nome: string,
    email: string,
    telefone: string,
    idade: number,
    
    // Análise
    categoria_sintomas: string,
    pontuacao_total: number,
    urgencia: "baixa" | "media" | "alta",
    expectativa_melhora: string,
    
    // Qualificação
    score_qualificacao: number,
    categoria_lead: "FRIO" | "MORNO" | "QUENTE" | "MUITO_QUENTE",
    prioridade: 1 | 2 | 3 | 4 | 5,
    motivos_qualificacao: string,
    
    // Arrays para iteração
    sintomas_identificados: Array<{
      nome: string,
      urgencia: string,
      explicacao: string
    }>,
    
    respostas_detalhadas: Array<{
      pergunta_id: string,
      resposta_texto: string,
      pontos: number,
      tempo_resposta_ms: number
    }>,
    
    // Comportamento
    comportamento: {
      tempo_total_questionario: number,
      tempo_medio_resposta: number,
      voltas_perguntas: number,
      engajamento: string,
      hesitacao_perguntas: string
    },
    
    // Metadados
    timestamp: string,
    user_agent: string,
    origem: string,
    versao_questionario: string
  }
}
\`\`\`

## 📊 Queries Úteis para Análise

### Leads por Categoria
\`\`\`sql
SELECT 
    categoria_lead,
    COUNT(*) as total,
    AVG(score_qualificacao) as score_medio
FROM leads_menopausa 
GROUP BY categoria_lead 
ORDER BY score_medio DESC;
\`\`\`

### Leads de Alta Prioridade
\`\`\`sql
SELECT 
    nome,
    email,
    telefone,
    categoria_lead,
    prioridade,
    created_at
FROM leads_menopausa 
WHERE prioridade >= 4 
ORDER BY created_at DESC;
\`\`\`

### Sintomas Mais Comuns
\`\`\`sql
SELECT 
    nome_sintoma,
    urgencia,
    COUNT(*) as frequencia
FROM sintomas_identificados 
GROUP BY nome_sintoma, urgencia 
ORDER BY frequencia DESC;
\`\`\`

### Performance do Questionário
\`\`\`sql
SELECT 
    DATE(created_at) as data,
    COUNT(*) as total_leads,
    AVG(tempo_total_questionario / 1000) as tempo_medio_segundos,
    AVG(voltas_perguntas) as voltas_media
FROM leads_menopausa 
GROUP BY DATE(created_at) 
ORDER BY data DESC;
\`\`\`

## 🚨 Troubleshooting

### Erro de Conexão Supabase
1. Verifique se a API Key está correta
2. Confirme se a URL do projeto está correta
3. Verifique se as políticas RLS estão configuradas

### Webhook não Recebe Dados
1. Verifique se a URL do webhook está correta no frontend
2. Teste o webhook manualmente no Make
3. Verifique os logs do navegador para erros de CORS

### Dados não Aparecem no Supabase
1. Verifique se as tabelas foram criadas corretamente
2. Confirme se os tipos de dados estão corretos
3. Verifique os logs do Make para erros de execução

### Emails não Enviados
1. Verifique se o filtro está configurado corretamente
2. Confirme se o módulo de email está conectado após o filtro
3. Teste com um lead de categoria QUENTE

## 📈 Próximos Passos

1. **Dashboard de Analytics**: Criar views no Supabase para métricas
2. **Automação de Follow-up**: Configurar emails automáticos
3. **Integração CRM**: Conectar com HubSpot, Pipedrive, etc.
4. **Webhooks de Status**: Atualizar status dos leads
5. **Relatórios Automáticos**: Enviar relatórios diários/semanais
