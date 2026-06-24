const POOLS = {
  default: {
    tipo: 'numero',
    numeros: ['5511915887485', '5511910532881', '5511949808009', '5511934134821'],
    mensagem: 'Olá, vim do site! E quero comprar no atacado.',
    option_key: 'ta_rotador_idx_global_v1',
  },
  'grupos-antigos': {
    tipo: 'grupo',
    destinos: [
      'https://chat.whatsapp.com/KYaHV4xJhqd9gWUQmOiDf7',
      'https://chat.whatsapp.com/DNnxdVnXyYC5MD1ZXcJgdH',
      'https://chat.whatsapp.com/Hbg1akV5qM68mAzKQu81Ky',
      'https://chat.whatsapp.com/HqgwG1uobyt2prpm8eL0Vm',
    ],
    option_key: 'ta_rotador_idx_grupos_antigos',
  },
  'grupo-novo': {
    tipo: 'grupo',
    destinos: ['https://chat.whatsapp.com/LBZlQRdMQd4A1sWPyFUsAD'],
    option_key: 'ta_rotador_idx_grupo_novo',
  },
};

const memoryCounters = new Map();

function sanitizeNumbers(numeros) {
  return numeros.map((n) => String(n).replace(/\D+/g, '')).filter(Boolean);
}

function sanitizeGroupUrls(destinos) {
  return destinos
    .map((url) => String(url).trim())
    .filter((url) => /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(url))
    .map((url) => url.split('?')[0]);
}

function buildDestinoUrl(cfg, item) {
  if (cfg.tipo === 'grupo') {
    return item;
  }
  return `https://wa.me/${item}?text=${encodeURIComponent(cfg.mensagem)}`;
}

function getPoolItems(cfg) {
  if (cfg.tipo === 'grupo') {
    return { items: sanitizeGroupUrls(cfg.destinos), tipo: 'grupo' };
  }
  return { items: sanitizeNumbers(cfg.numeros), tipo: 'numero' };
}

async function redisIncr(key) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Redis INCR failed: ${response.status}`);

  const data = await response.json();
  return typeof data.result === 'number' ? data.result : Number(data.result);
}

function memoryIncr(key) {
  const current = memoryCounters.get(key) || 0;
  const next = current + 1;
  memoryCounters.set(key, next);
  return next;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const poolName = typeof req.query.pool === 'string' ? req.query.pool : 'default';
  const cfg = POOLS[poolName] || POOLS.default;
  const { items, tipo } = getPoolItems(cfg);

  if (items.length === 0) {
    return res.status(400).json({ error: 'Sem destinos configurados' });
  }

  try {
    let counter = await redisIncr(cfg.option_key);
    if (counter === null) counter = memoryIncr(cfg.option_key);

    const idx = (counter - 1) % items.length;
    const destino = items[idx];
    const url = buildDestinoUrl(cfg, destino);

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({
      tipo,
      destino,
      indice: idx,
      total: items.length,
      contador: counter,
      pool: poolName,
      url,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Falha no rotador', detail: String(err.message || err) });
  }
}
