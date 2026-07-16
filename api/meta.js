// /api/meta.js — Vercel Serverless Function
// Dashboard RETAI0726 · João Menna

const GRAPH = 'https://graph.facebook.com/v19.0';
const FIELDS_CAMPAIGN = 'campaign_name,impressions,clicks,inline_link_clicks,reach,frequency,spend,cpc,ctr,date_start,date_stop';
const FIELDS_AD = 'ad_name,campaign_name,adset_name,impressions,inline_link_clicks,spend,ctr,actions';
const LAUNCH_TAG = 'RETAI0726';
const CACHE_TTL = 5 * 60 * 1000;

const cache = {};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token   = process.env.META_TOKEN;
  const account = process.env.META_ACCOUNT_ID;
  if (!token || !account) return res.status(500).json({ error: 'Variáveis de ambiente não configuradas' });

  let { since, until } = req.query;
  if (!since || !until) return res.status(400).json({ error: 'since e until obrigatórios' });

  const cacheKey = `${since}_${until}`;
  const cached = cache[cacheKey];
  if (cached && (Date.now() - cached.ts) < CACHE_TTL) {
    return res.status(200).json({ ...cached.data, cached: true });
  }

  const actId     = `act_${account}`;
  const timeRange = JSON.stringify({ since, until });

  try {
    const campUrl = `${GRAPH}/${actId}/insights?fields=${FIELDS_CAMPAIGN}&time_range=${encodeURIComponent(timeRange)}&time_increment=1&level=campaign&limit=500&timezone=America/Sao_Paulo&access_token=${token}`;
    const adUrl   = `${GRAPH}/${actId}/insights?fields=${FIELDS_AD}&time_range=${encodeURIComponent(timeRange)}&level=ad&limit=200&timezone=America/Sao_Paulo&access_token=${token}`;

    const [campRes, adRes] = await Promise.all([fetch(campUrl), fetch(adUrl)]);
    const [campJson, adJson] = await Promise.all([campRes.json(), adRes.json()]);

    if (campJson.error) return res.status(400).json({ error: campJson.error.message });

    const campData = (campJson.data || []).filter(r => (r.campaign_name || '').toUpperCase().includes(LAUNCH_TAG));
    const adData   = (adJson.data   || []).filter(r => (r.campaign_name || '').toUpperCase().includes(LAUNCH_TAG));

    const diario = campData.map(r => ({
      data:         r.date_start,
      campanha:     r.campaign_name,
      impressoes:   parseInt(r.impressions || 0),
      cliques:      parseInt(r.inline_link_clicks || r.clicks || 0),
      alcance:      parseInt(r.reach || 0),
      frequencia:   parseFloat(r.frequency || 0),
      investimento: parseFloat(r.spend || 0),
      cpc:          parseFloat(r.cpc || 0),
      ctr:          parseFloat(r.ctr || 0),
    }));

    const totais = diario.reduce((acc, r) => ({
      impressoes:   acc.impressoes   + r.impressoes,
      cliques:      acc.cliques      + r.cliques,
      alcance:      acc.alcance      + r.alcance,
      investimento: acc.investimento + r.investimento,
    }), { impressoes: 0, cliques: 0, alcance: 0, investimento: 0 });

    const por_anuncio = adData.map(r => {
      const leads = (r.actions || []).find(a => a.action_type === 'lead');
      return {
        ad_name:      r.ad_name,
        campanha:     r.campaign_name,
        adset_name:   r.adset_name,
        impressoes:   parseInt(r.impressions || 0),
        cliques:      parseInt(r.inline_link_clicks || 0),
        investimento: parseFloat(r.spend || 0),
        ctr:          parseFloat(r.ctr || 0),
        leads:        leads ? parseInt(leads.value) : 0,
      };
    });

    const payload = { diario, totais, por_anuncio, periodo: { since, until }, updated_at: new Date().toISOString() };
    cache[cacheKey] = { data: payload, ts: Date.now() };

    return res.status(200).json(payload);

  } catch (err) {
    console.error('[meta.js]', err);
    return res.status(500).json({ error: err.message });
  }
}
