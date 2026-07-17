# Dashboard · RETAI0726 · João Menna

Dashboard de performance do lançamento RetratAÍ — Meta Ads + Leads via Google Sheets.

---

## Estrutura do projeto

```
retai0826/
├── index.html          ← Frontend completo
├── api/
│   └── meta.js         ← Serverless Function Vercel (proxy Meta Ads API)
├── vercel.json         ← Configuração de rotas
├── package.json
└── .gitignore
```

---

## Variáveis de ambiente (Vercel)

Vercel → Settings → Environment Variables:

| Nome | Valor |
|------|-------|
| `META_TOKEN` | Token de acesso Meta Ads (Long-Lived, ~60 dias) |
| `META_ACCOUNT_ID` | ID numérico da conta (sem "act_") |

---

## Fontes de dados

**Meta Ads** — via Vercel Serverless Function (`/api/meta.js`)
- Filtra automaticamente campanhas com `RETAI0726` no nome
- Cache de 5 minutos em memória para evitar timeout
- Puxa dados por campanha (diário) e por anúncio

**Google Sheets** — CSV publicado, carregado direto no browser via PapaParse
- URL configurada no `index.html` linha ~310
- Colunas: `Data · nome · email · telefone · source · campaign · medium · content · term · url · slug · id`

---

## Separação orgânico × tráfego pago

| Tipo | Critério |
|------|----------|
| **Tráfego pago** | `utm_source = meta_ads` **E** `utm_campaign` contém `RETAI0726` |
| **Orgânico** | Qualquer outro lead |

O CPL é calculado **só sobre leads de tráfego** — os orgânicos não entram no custo.

---

## Filtros de período

| Botão | Comportamento |
|-------|--------------|
| Hoje | Só o dia atual |
| Ontem | Só o dia anterior |
| Últimos X dias | X dias fechados, sem hoje |
| Período Total | 13/07/2026 até hoje inclusive |
| Personalizar | Intervalo livre |

> Data mínima absoluta: **13/07/2026** (início do lançamento). Leads anteriores são ignorados.

---

## Métricas disponíveis

**KPIs principais:** Investimento · Leads Tráfego · CPL Tráfego · Leads Orgânico · Total de Leads

**KPIs de tráfego:** CPM · CTR · CPC · Conv. Página · Connect Rate · Frequência

**Funil:** Impressões → Cliques → Leads captados

**Gráficos:** Investimento × Leads/dia · CTR/CPC/CPM/dia · CPL por campanha · CTR por campanha

**Breakdowns:** Source · Campaign · Medium · Slug (teste de página)

**Tabelas:** Resultados diários · Performance por anúncio (com conjunto de anúncio) · Leads captados com badge Orgânico/Tráfego

---

## Como atualizar os dados

- **Planilha:** automático ao abrir ou clicar Sync — PapaParse busca direto do Google Sheets
- **Meta Ads:** clica em **Sync Meta Ads** — busca da API ou retorna do cache (5min)
- **Cache zerado:** Vercel → Deployments → Redeploy (sem Build Cache)

---

## Renovar o token Meta Ads (~60 dias)

1. [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Seleciona o app **Dash RETAI0826** → **Get User Access Token** → `ads_read` → Generate
3. Cola essa URL no navegador (substituindo TOKEN_CURTO):
```
https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=2237062350377846&client_secret=40a578f1aec681dff117d829abeb6b71&fb_exchange_token=TOKEN_CURTO
```
4. Copia o `access_token` retornado
5. Vercel → Settings → Environment Variables → edita `META_TOKEN` → Redeploy

---

## Trocar conta Meta Ads

1. Vercel → Settings → Environment Variables
2. Edita `META_ACCOUNT_ID` com o novo ID (só números, sem "act_")
3. Gera novo token da nova conta (ver passo acima)
4. Atualiza `META_TOKEN`
5. Redeploy
6. No `api/meta.js`, confirma que `LAUNCH_TAG = 'RETAI0726'` bate com o nome das campanhas na nova conta

---

## Deploy e atualizações

Qualquer push no GitHub atualiza o Vercel automaticamente em ~15 segundos.
