const POOLS = {
  default: {
    numeros: ['5511915887485', '5511910532881', '5511949808009', '5511934134821'],
    mensagem: 'Olá, vim do site! E quero comprar no atacado.',
    option_key: 'ta_rotador_idx_global_v1',
  },
  'grupos-antigos': {
    numeros: ['5511915887485', '5511910532881', '5511949808009', '5511934134821'],
    mensagem: 'Olá, vim do site! E quero comprar no atacado.',
    option_key: 'ta_rotador_idx_grupos_antigos',
  },
};

const memoryCounters = new Map();

function sanitizeNumbers(numeros) {
  return numeros.map((n) => String(n).replace(/\D+/g, '')).filter(Boolean);
}

async function redisIncr(key) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
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
  const nums = sanitizeNumbers(cfg.numeros);

  if (nums.length === 0) {
    return res.status(400).json({ error: 'Sem números configurados' });
  }

  try {
    let counter = await redisIncr(cfg.option_key);
    if (counter === null) counter = memoryIncr(cfg.option_key);

    const idx = (counter - 1) % nums.length;
    const numero = nums[idx];
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(cfg.mensagem)}`;

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ numero, indice: idx, total: nums.length, contador: counter, url });
  } catch (err) {
    return res.status(500).json({ error: 'Falha no rotador', detail: String(err.message || err) });
  }
}
