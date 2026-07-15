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
| `META_TOKEN` | Token de acesso Meta Ads (Long-Lived, 60 dias) |
| `META_ACCOUNT_ID` | `4798045303543957` |

> Token expira em ~60 dias. Para renovar: gere um novo token curto no Graph API Explorer e troque pelo long-lived via URL de exchange.

---

## Fontes de dados

**Meta Ads** — via Vercel Serverless Function (`/api/meta.js`)
- Filtra automaticamente campanhas com `RETAI0826` no nome
- Puxa dados por campanha (diário) e por anúncio

**Google Sheets** — CSV publicado, carregado direto no browser via PapaParse
- URL configurada no `index.html` linha ~310
- Colunas: `Data · nome · email · telefone · source · campaign · medium · content · term · url · slug · id`

---

## Separação orgânico × tráfego

Leads são classificados automaticamente:

- **Orgânico**: `utm_campaign = cap_org` OU `utm_term` contendo "organico/orgânico"
- **Tráfego**: qualquer outro UTM

O CPL é calculado **só sobre leads de tráfego** — os orgânicos não entram no custo.

---

## Filtros de período

| Botão | Comportamento |
|-------|--------------|
| Hoje | Só o dia atual |
| Ontem | Só o dia anterior |
| Últimos X dias | X dias fechados, sem hoje |
| Período Total | 13/07/2026 até hoje |
| Personalizar | Intervalo livre |

> Data mínima absoluta: **13/07/2026** (início do lançamento). Leads anteriores são ignorados.

---

## Métricas disponíveis

**KPIs principais:** Investimento · Leads Tráfego · CPL Tráfego · Leads Orgânico · Total de Leads

**KPIs de tráfego:** CPM · CTR · CPC · Conv. Página · Connect Rate · Frequência

**Funil:** Impressões → Cliques → Leads captados

**Gráficos:** Investimento × Leads/dia · CTR/CPC/CPM/dia · CPL por campanha · CTR por campanha

**Breakdowns:** Source · Campaign · Medium · Slug (teste de página)

**Tabelas:** Resultados diários · Performance por anúncio · Leads captados (últimos 100, com badge Orgânico/Tráfego)

---

## Renovar o token Meta Ads

1. Acessa [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Seleciona o app **Dash RETAI0826**
3. Gera novo token curto com permissão `ads_read`
4. Cola essa URL no navegador:
```
https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=2237062350377846&client_secret=SEU_APP_SECRET&fb_exchange_token=TOKEN_CURTO
```
5. Copia o `access_token` retornado
6. Vercel → Settings → Environment Variables → edita `META_TOKEN`
7. Deployments → Redeploy

---

## Deploy e atualizações

Qualquer push no GitHub atualiza o Vercel automaticamente.
Para forçar sem cache: Vercel → Deployments → Redeploy → desmarcar "Use existing Build Cache".
