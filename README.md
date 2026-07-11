# Dashboard · RETAAI0726 · João Menna

Dashboard de performance do lançamento RetratAÍ — Meta Ads + Leads via Google Sheets.

---

## Estrutura do projeto

```
retaai0726/
├── index.html          ← Frontend completo (KPIs, gráficos, tabelas, UTM breakdown)
├── api/
│   └── meta.js         ← Serverless Function Vercel (proxy Meta Ads API)
├── vercel.json         ← Configuração de rotas Vercel
├── package.json
└── .gitignore
```

---

## Deploy: passo a passo

### 1. Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome sugerido: `dashboard-retaai0726-joaomenna`
3. Visibilidade: **Privado** (recomendado — contém lógica da API)
4. Clique em **Create repository**

### 2. Subir os arquivos

**Opção A — pelo navegador (mais fácil):**
1. No repositório criado, clique em **Add file → Upload files**
2. Arraste todos os arquivos desta pasta
3. Atenção: crie a pasta `api/` manualmente no GitHub e faça upload do `meta.js` dentro dela

**Opção B — pelo terminal (Git):**
```bash
cd retaai0726
git init
git add .
git commit -m "feat: dashboard RETAAI0726 João Menna"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/dashboard-retaai0726-joaomenna.git
git push -u origin main
```

### 3. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Selecione o repositório `dashboard-retaai0726-joaomenna`
3. Framework Preset: **Other** (sem framework)
4. Clique em **Deploy**

### 4. Configurar variáveis de ambiente no Vercel

No painel do projeto Vercel → **Settings → Environment Variables**, adicione:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `META_TOKEN` | `EAAfymKq8E3YBR8A...` (token gerado no Graph API Explorer) | Production, Preview |
| `META_ACCOUNT_ID` | `4798045303543957` | Production, Preview |

> Após adicionar as variáveis, vá em **Deployments → Redeploy** para aplicar.

### 5. Configurar a planilha de leads

No `index.html`, linha ~215, substitua:
```js
const SHEET_LEADS_URL = 'COLE_AQUI_URL_DA_PLANILHA_CSV';
```
pela URL pública do CSV da planilha de leads do Google Sheets.

**Como gerar a URL:**
1. Abra a planilha de leads no Google Sheets
2. Arquivo → Compartilhar → **Publicar na Web**
3. Selecione a aba correta → Formato: **CSV**
4. Clique em **Publicar** → copie a URL gerada

---

## Colunas esperadas da planilha

| Coluna | Descrição |
|--------|-----------|
| `Data` | Data de captação (YYYY-MM-DD ou DD/MM/YYYY) |
| `nome` | Nome do lead |
| `email` | Email |
| `telefone` | Telefone |
| `source` | utm_source |
| `campaign` | utm_campaign |
| `medium` | utm_medium |
| `content` | utm_content |
| `term` | utm_term |
| `url` | URL completa |
| `slug` | Identificador da página (teste A/B) |
| `id` | ID interno |

---

## Como funciona a API

O arquivo `/api/meta.js` é uma **Vercel Serverless Function** que:
- Recebe os parâmetros `since` e `until` (datas) via query string
- Faz a chamada autenticada para a **Meta Ads API v19.0**
- Retorna dados em dois níveis:
  - `diario[]` — métricas por campanha × por dia
  - `por_anuncio[]` — métricas agregadas por anúncio
  - `totais{}` — soma do período

O frontend chama `fetch('/api/meta?since=YYYY-MM-DD&until=YYYY-MM-DD')` — sem expor o token no browser.

---

## Métricas disponíveis

**KPIs principais:** Investimento · Leads · CPL · Impressões · Alcance

**KPIs de tráfego:** CPM · CTR · CPC · Conversão de Página · Connect Rate · Close Rate

**Funil:** Impressões → Cliques → Leads → Atendidos → Vendas

**Gráficos:** Investimento × Leads/dia · CTR/CPC/CPM/dia · CPL por campanha · CTR por campanha

**Breakdowns:** Source · Campaign · Medium · Slug (teste de página)

**Tabelas:** Resultados diários · Performance por anúncio · Leads captados (últimos 100)

---

## Atualizações

Para atualizações futuras, basta editar os arquivos e fazer `git push`. O Vercel faz o redeploy automaticamente.
