# Configuração Detalhada do Make com Supabase

## 🚨 Problema Identificado

O erro que você está vendo indica que o campo `nome` está sendo enviado como `null`, mas a tabela tem uma constraint NOT NULL.

\`\`\`
null value in column "nome" of relation "QUIZ_DASHBOARD" violates not-null constraint
\`\`\`

## ✅ Solução Passo a Passo

### 1. **Configurar o Webhook (Primeiro Módulo)**

1. **Adicione um módulo "Webhooks > Custom webhook"**
2. **Configure a URL do webhook**: `https://hook.us1.make.com/3lqca8wvfvl6sbhvhyskarl2rkvkpff7`
3. **Teste o webhook** usando nossa página `/teste-make`

### 2. **Configurar o Supabase (Segundo Módulo)**

1. **Adicione um módulo "Supabase > Create a Row"**
2. **Configure a conexão com seu Supabase**
3. **Selecione a tabela**: `QUIZ_DASHBOARD`

### 3. **Mapeamento Correto dos Campos**

**⚠️ IMPORTANTE**: Use exatamente estes mapeamentos:

#### Campos Obrigatórios (NOT NULL):
\`\`\`
nome: {{1.dadosContato.nome}}
email: {{1.dadosContato.email}}
\`\`\`

#### Campos Opcionais:
\`\`\`
telefone: {{1.dadosContato.telefone}}
idade: {{1.dadosContato.idade}}
categoria_sintomas: {{1.analise.categoria}}
pontuacao_total: {{1.analise.pontuacaoTotal}}
urgencia: {{1.analise.urgencia}}
expectativa_melhora: {{1.analise.expectativa}}
score_qualificacao: {{1.qualificacaoLead.score}}
categoria_lead: {{1.qualificacaoLead.categoria}}
prioridade: {{1.qualificacaoLead.prioridade}}
\`\`\`

#### Campos JSON (use toString()):
\`\`\`
motivos_qualificacao: {{toString(1.qualificacaoLead.motivos)}}
sintomas_identificados: {{toString(1.analise.sintomas)}}
respostas_detalhadas: {{toString(1.respostas)}}
\`\`\`

#### Campos de Tempo:
\`\`\`
tempo_total_questionario: {{1.tempoTotal}}
tempo_medio_resposta: {{1.qualificacaoLead.comportamento.tempoMedioResposta}}
voltas_perguntas: {{1.qualificacaoLead.comportamento.voltasPerguntas}}
engajamento: {{1.qualificacaoLead.comportamento.engajamento}}
\`\`\`

#### Metadados:
\`\`\`
timestamp: {{1.timestamp}}
origem: {{1.origem}}
versao_questionario: {{1.variante}}
acao: lead_registrado
criado_em: {{now}}
\`\`\`

### 4. **Tratamento de Campos Nulos**

Para evitar erros de NOT NULL, use estas fórmulas:

#### Para o campo nome:
\`\`\`
{{if(1.dadosContato.nome; 1.dadosContato.nome; "Nome não informado")}}
\`\`\`

#### Para o campo email:
\`\`\`
{{if(1.dadosContato.email; 1.dadosContato.email; "email@nao-informado.com")}}
\`\`\`

### 5. **Campos que podem ficar em branco**

Estes campos podem ser deixados vazios ou com valores padrão:

\`\`\`
hesitacao_perguntas: (deixar vazio)
tempo_tela_final: (deixar vazio)
dispositivo: Desktop
sistema_operacional: Windows
navegador: Chrome
resolucao: (deixar vazio)
referrer: (deixar vazio)
utm_source: (deixar vazio)
utm_medium: (deixar vazio)
utm_campaign: (deixar vazio)
ip_address: (deixar vazio)
\`\`\`

## 🧪 Teste Passo a Passo

### Passo 1: Testar o Webhook
1. Vá para `/teste-make`
2. Clique em "Testar Webhook Make"
3. Verifique se o Make recebe os dados

### Passo 2: Verificar Estrutura dos Dados
Os dados chegam nesta estrutura:
\`\`\`json
{
  "dadosContato": {
    "nome": "string",
    "email": "string",
    "telefone": "string",
    "idade": "string"
  },
  "analise": {
    "categoria": "string",
    "pontuacaoTotal": number,
    "urgencia": "string",
    "expectativa": "string"
  },
  "qualificacaoLead": {
    "score": number,
    "categoria": "string",
    "prioridade": number,
    "motivos": array,
    "comportamento": object
  },
  "respostas": object,
  "variante": "string",
  "tempoTotal": number,
  "timestamp": "string",
  "origem": "string"
}
\`\`\`

### Passo 3: Configurar Mapeamento
Use os mapeamentos exatos fornecidos acima.

### Passo 4: Testar Inserção
Execute o cenário e verifique se os dados são inseridos corretamente.

## 🔧 Troubleshooting

### Erro: "null value in column nome"
- **Causa**: Campo obrigatório não está sendo mapeado
- **Solução**: Use `{{1.dadosContato.nome}}` ou a fórmula com fallback

### Erro: "invalid input syntax for type json"
- **Causa**: Tentando inserir objeto sem converter para string
- **Solução**: Use `{{toString(1.campo)}}` para campos JSONB

### Erro: "column does not exist"
- **Causa**: Nome do campo incorreto
- **Solução**: Verifique se o nome do campo está exato como na tabela

## ✅ Checklist Final

- [ ] Webhook configurado e testado
- [ ] Conexão Supabase estabelecida
- [ ] Tabela "QUIZ_DASHBOARD" selecionada
- [ ] Campos obrigatórios mapeados com fallback
- [ ] Campos JSON usando toString()
- [ ] Cenário testado com dados reais
- [ ] Dados aparecendo no Supabase
