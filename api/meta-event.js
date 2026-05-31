const PIXEL_ID = process.env.META_PIXEL_ID || '881981060699779';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'META_ACCESS_TOKEN not configured' });
  }

  const { event_name, event_id, event_source_url, fbp, fbc } = req.body || {};

  if (!event_name || !event_id || !event_source_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const allowed = ['PageView', 'Lead', 'Contact'];
  if (!allowed.includes(event_name)) {
    return res.status(400).json({ error: 'Invalid event_name' });
  }

  const userAgent = req.headers['user-agent'] || '';
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : '')?.trim() || req.headers['x-real-ip'] || '';

  const user_data = {};
  if (ip) user_data.client_ip_address = ip;
  if (userAgent) user_data.client_user_agent = userAgent;
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;

  const payload = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        event_source_url,
        action_source: 'website',
        user_data,
      },
    ],
    access_token: accessToken,
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ success: true, events_received: data.events_received });
  } catch {
    return res.status(502).json({ error: 'Failed to reach Meta API' });
  }
}
