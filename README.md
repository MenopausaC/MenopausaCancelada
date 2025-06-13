# Avaliação Nutricional para Menopausa - Sistema de Variantes e Analytics

Este projeto implementa um sistema completo de avaliação nutricional especializada para mulheres na menopausa com múltiplas variantes para testes A/B e dashboard de analytics em tempo real.

## 🌿 Funcionalidades

### Avaliação Nutricional com Variantes
- **6 variantes diferentes** (testbx4 a testbx9) com funcionalidades específicas
- **Sistema de tracking completo** para monitoramento de performance
- **Depoimentos de transformação** com troca automática a cada 5 segundos
- **Animações e efeitos visuais** sutis para melhor experiência
- **Integração com ActiveCampaign** para automação de marketing
- **Integração com CRM Nectar** para gestão de leads
- **Integração com Make.com** para automação avançada
- **Dashboard com dados do Supabase** em tempo real
- **Foco em tratamento natural** sem remédios ou hormônios

### Dashboard de Analytics
- **Autenticação simples** para acesso restrito
- **Métricas em tempo real** por variante
- **Dados do Supabase** integrados
- **Gráficos e visualizações** de performance
- **Exportação de dados** em formato JSON
- **Filtros por variante e período**

## 🥗 Variantes Disponíveis

### testbx4 - Base Completa
- Avaliação nutricional completa para menopausa
- Sistema de tracking integrado
- Integração com ActiveCampaign
- Foco em alimentação natural

### testbx5 - Com Agendamento
- Todas as funcionalidades da Base
- Botão de agendamento para consulta nutricional
- Valor fixo de R$197 para consulta
- Foco em tratamento sem remédios

### testbx6 - Com Depoimentos
- Todas as funcionalidades anteriores
- Depoimentos de transformação nutricional em todas as perguntas
- Histórias de sucesso sem medicamentos
- Design com foco em resultados naturais

### testbx7 - Texto Alterado
- Todas as funcionalidades anteriores
- Ênfase em "Avaliação Nutricional"
- Destaque para tratamento sem hormônios
- Copy otimizado para nutrição natural

### testbx8 - Botões Continuar
- Todas as funcionalidades anteriores
- Botões "Continuar" visíveis em perguntas de input
- Mantém "Obter Avaliação Nutricional" na última pergunta
- Fluxo de navegação mais claro

### testbx9 - Efeitos Visuais
- Todas as funcionalidades anteriores
- Efeito fade/pulse na badge "Avaliação Nutricional Gratuita"
- Animações sutis com glow effect verde
- Experiência visual focada em saúde natural

## 🛠️ Como Usar

### Acessar uma Variante Específica
\`\`\`
https://seudominio.com/?variante=testbx9&direct=true
\`\`\`

### Dashboard Nutricional
Acesse `/` para o dashboard administrativo:
\`\`\`
https://seudominio.com/
\`\`\`

**Credenciais de acesso:**
- Usuário: `admin`
- Senha: `menopausa2024`

### Dashboard com Supabase
Para métricas em tempo real do Supabase:
\`\`\`
https://seudominio.com/dashboard-supabase
\`\`\`

### Avaliação Direta
Para ir direto à avaliação sem dashboard:
\`\`\`
https://seudominio.com/?admin=false&direct=true
\`\`\`

## 📊 Métricas Monitoradas

### Por Variante
- **Taxa de conclusão** da avaliação
- **Taxa de conversão** (cliques no botão de agendamento)
- **Tempo médio** de interação por pergunta
- **Número de visualizações** de depoimentos
- **Dados de performance** (tempo de carregamento, erros)

### Eventos Trackados
- `session_start` - Início da sessão
- `question_view` - Visualização de pergunta
- `question_answered` - Resposta a pergunta
- `navigation_back` - Navegação para trás
- `navigation_next` - Navegação para frente
- `input_change` - Mudança em campos de input
- `quiz_completed` - Conclusão da avaliação
- `agendamento_click` - Clique no botão de agendamento
- `resultado_concluir` - Conclusão da tela de resultado

## 🔧 Configuração Técnica

### Dependências
- **React 18** com hooks
- **Tailwind CSS** para estilização (tema verde/natural)
- **Lucide React** para ícones
- **shadcn/ui** para componentes
- **Supabase** para banco de dados
- **Make.com** para automação

### Estrutura de Arquivos
\`\`\`
/app
  /page.tsx                 # Página principal (dashboard ou avaliação)
  /dashboard/page.tsx       # Dashboard de analytics (local)
  /dashboard-supabase/page.tsx  # Dashboard com dados do Supabase
  /selector/page.tsx        # Seletor de variantes
  /api/webhook/route.ts     # Webhook para receber dados do Make
/components
  /quiz-menopausa-variantes.tsx    # Componente principal da avaliação
  /dashboard-analytics.tsx         # Componente do dashboard local
  /dashboard-supabase.tsx          # Componente do dashboard Supabase
  /admin-dashboard.tsx            # Dashboard administrativo
  /ui/                           # Componentes shadcn/ui
/lib
  /supabase.ts                   # Cliente Supabase
  /supabase-analytics.ts         # Funções de analytics do Supabase
\`\`\`

### Sistema de Tracking
O sistema salva eventos tanto localmente quanto no Supabase:
- **Local:** `localStorage` com chave `quiz_tracking_events`
- **Supabase:** Tabela `QUIZ_DASHBOARD` com dados estruturados

## 🌱 Foco em Nutrição Natural

### Abordagem Diferenciada
- **Sem medicamentos** ou hormônios
- **Tratamento 100% natural** através da alimentação
- **Nutricionista especializada** em menopausa
- **Plano alimentar personalizado** para cada caso
- **Resultados comprovados** através de depoimentos reais

### Perguntas Específicas
A avaliação inclui perguntas sobre:
- Hábitos alimentares atuais
- Compulsão por doces
- Ganho de peso
- Energia e disposição
- Hidratação
- Exercícios físicos
- Suplementação
- Digestão

## 🚀 Deploy e Produção

### Variáveis de Ambiente Necessárias
\`\`\`env
# Supabase (obrigatório para dashboard em tempo real)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configurações do sistema
NEXT_PUBLIC_DEFAULT_VARIANT=testbx9
ADMIN_API_KEY=your_admin_key

# Webhooks (opcional - para integrações)
CRM_WEBHOOK_URL=your_webhook_url
CRM_API_KEY=your_api_key
\`\`\`

**⚠️ Importante:** Nunca exponha chaves de API sensíveis no código cliente. Use apenas variáveis `NEXT_PUBLIC_` para dados que podem ser públicos.

### Build e Deploy
\`\`\`bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Iniciar servidor
npm start
\`\`\`

## 📈 Análise de Performance

### Métricas Recomendadas
- **Taxa de conclusão** > 60%
- **Tempo médio** entre 3-8 minutos
- **Taxa de conversão** > 15%
- **Bounce rate** < 30%

### Otimizações Implementadas
- **Lazy loading** de componentes
- **Debounce** em inputs
- **Compressão** de dados de tracking
- **Cache** de configurações
- **Tema verde** para transmitir naturalidade
- **Fallback** para dados locais quando Supabase não disponível

## 🔒 Segurança

### Autenticação
- Dashboard protegido por login simples
- Credenciais hardcoded (para demo)
- Em produção: implementar autenticação robusta

### Dados Sensíveis
- Dados pessoais criptografados antes do envio
- Logs de tracking anonimizados
- Compliance com LGPD
- Chaves de API protegidas no servidor

## 🔄 Integração com Make.com

### Fluxo de Dados
1. **Questionário preenchido** → 
2. **Dados enviados para Make** → 
3. **Make processa e envia para webhook** → 
4. **Webhook salva no Supabase** → 
5. **Dashboard mostra métricas em tempo real**

### Configuração do Make
- **Webhook:** `/api/webhook`
- **Formato:** JSON estruturado
- **Campos:** Todos os dados do questionário + análise

## 🐛 Debug e Troubleshooting

### Logs de Debug
Todos os eventos são logados no console do navegador:
\`\`\`javascript
console.log('📊 Tracking:', eventData)
\`\`\`

### Problemas Comuns

#### Variante não carrega
- Verificar parâmetro URL `?variante=ID&direct=true`
- Confirmar ID da variante (testbx4 a testbx9)

#### Dashboard sem dados
- Completar pelo menos uma avaliação
- Verificar conexão com Supabase
- Verificar localStorage do navegador
- Limpar cache se necessário

#### Tracking não funciona
- Verificar console para erros JavaScript
- Confirmar que localStorage está habilitado
- Testar em modo incógnito
- Verificar conexão com Supabase

#### Erro de deployment
- Verificar se todas as variáveis de ambiente estão configuradas
- Não expor chaves sensíveis no código cliente
- Usar apenas `NEXT_PUBLIC_` para dados públicos

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs no console do navegador
2. Testar em diferentes navegadores
3. Limpar cache e cookies
4. Verificar configurações de privacidade
5. Verificar conexão com Supabase

## 🔄 Atualizações Futuras

### Roadmap
- [ ] Integração com Google Analytics
- [ ] Testes A/B automatizados
- [ ] Dashboard em tempo real com WebSockets
- [ ] Exportação para Excel/CSV
- [ ] API REST para integrações externas
- [ ] Notificações push para leads quentes
- [ ] Relatórios automatizados por email
- [ ] Calculadora de IMC integrada
- [ ] Planos alimentares automáticos

### Versionamento
- **v1.0** - Sistema básico com 6 variantes (foco médico)
- **v1.1** - Dashboard de analytics
- **v1.2** - Migração para foco nutricional
- **v1.3** - Integração com Supabase e Make.com (atual)
- **v2.0** - Sistema de A/B testing automatizado (planejado)
