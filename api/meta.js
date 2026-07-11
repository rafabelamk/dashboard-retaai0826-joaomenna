// /api/meta.js — Vercel Serverless Function
// Proxy para Meta Ads API · Dashboard RETAAI0726 · João Menna
// Variáveis de ambiente necessárias (Vercel Dashboard → Settings → Environment Variables):
//   META_TOKEN       → Token de acesso Meta Ads (EAAxxxxx...)
//   META_ACCOUNT_ID  → ID da conta (sem "act_") ex: 1234567890

const GRAPH = 'https://graph.facebook.com/v19.0';

// Campos por nível
const FIELDS_CAMPAIGN =
  'campaign_name,impressions,clicks,inline_link_clicks,reach,frequency,spend,cpc,ctr,date_start,date_stop';

const FIELDS_AD =
  'ad_name,campaign_name,adset_name,impressions,inline_link_clicks,spend,ctr,date_start,' +
  'actions,cost_per_action_type';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token   = process.env.META_TOKEN;
  const account = process.env.META_ACCOUNT_ID; // sem "act_"

  if (!token || !account) {
    return res.status(500).json({ error: 'META_TOKEN ou META_ACCOUNT_ID não configurados' });
  }

  const { since, until, level = 'campaign' } = req.query;

  if (!since || !until) {
    return res.status(400).json({ error: 'Parâmetros since e until são obrigatórios' });
  }

  const timeRange = JSON.stringify({ since, until });
  const actId     = `act_${account}`;

  try {
    // ── 1. Dados por campanha (diário) ───────────────────────────────────────
    const campaignUrl =
      `${GRAPH}/${actId}/insights` +
      `?fields=${FIELDS_CAMPAIGN}` +
      `&time_range=${encodeURIComponent(timeRange)}` +
      `&time_increment=1` +
      `&level=campaign` +
      `&limit=500` +
      `&access_token=${token}`;

    // ── 2. Dados por anúncio (totais no período) ──────────────────────────────
    const adUrl =
      `${GRAPH}/${actId}/insights` +
      `?fields=${FIELDS_AD}` +
      `&time_range=${encodeURIComponent(timeRange)}` +
      `&level=ad` +
      `&limit=200` +
      `&access_token=${token}`;

    const [campRes, adRes] = await Promise.all([
      fetch(campaignUrl),
      fetch(adUrl),
    ]);

    const [campJson, adJson] = await Promise.all([
      campRes.json(),
      adRes.json(),
    ]);

    if (campJson.error) {
      return res.status(400).json({ error: campJson.error.message });
    }

    // Normaliza dados de campanha por dia
    const diario = (campJson.data || []).map(r => ({
      data:          r.date_start,
      campanha:      r.campaign_name,
      impressoes:    parseInt(r.impressions  || 0),
      cliques:       parseInt(r.inline_link_clicks || r.clicks || 0),
      cliques_total: parseInt(r.clicks || 0),
      alcance:       parseInt(r.reach || 0),
      frequencia:    parseFloat(r.frequency || 0),
      investimento:  parseFloat(r.spend || 0),
      cpc:           parseFloat(r.cpc   || 0),
      ctr:           parseFloat(r.ctr   || 0),
    }));

    // Agrega totais
    const totais = diario.reduce((acc, r) => ({
      impressoes:   acc.impressoes   + r.impressoes,
      cliques:      acc.cliques      + r.cliques,
      alcance:      acc.alcance      + r.alcance,
      investimento: acc.investimento + r.investimento,
    }), { impressoes: 0, cliques: 0, alcance: 0, investimento: 0 });

    // Normaliza por anúncio
    const por_anuncio = (adJson.data || []).map(r => {
      const actions = r.actions || [];
      const leads   = actions.find(a => a.action_type === 'lead');
      return {
        ad_name:     r.ad_name,
        campanha:    r.campaign_name,
        adset_name:  r.adset_name,
        impressoes:  parseInt(r.impressions || 0),
        cliques:     parseInt(r.inline_link_clicks || 0),
        investimento:parseFloat(r.spend || 0),
        ctr:         parseFloat(r.ctr || 0),
        leads:       leads ? parseInt(leads.value) : 0,
      };
    });

    return res.status(200).json({
      diario,
      totais,
      por_anuncio,
      periodo: { since, until },
      updated_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[meta.js] Erro:', err);
    return res.status(500).json({ error: err.message });
  }
}
