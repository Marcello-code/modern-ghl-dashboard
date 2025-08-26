// Vercel serverless function for GHL API proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint } = req.query;
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(400).json({ error: 'Missing x-api-key header' });
  }

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  try {
    const BASE_URL = 'https://services.leadconnectorhq.com';
    const VERSION = '2021-07-28';
    
    // Extract location_id from JWT token
    let locationId;
    try {
      const payload = JSON.parse(atob(apiKey.split('.')[1]));
      locationId = payload.location_id;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }
    
    let ghlUrl;
    switch (endpoint) {
      case 'contacts':
        ghlUrl = `${BASE_URL}/contacts/?locationId=${locationId}`;
        break;
      case 'calendars':
        ghlUrl = `${BASE_URL}/calendars/?locationId=${locationId}`;
        break;
      case 'appointments':
        ghlUrl = `${BASE_URL}/calendars/events/?locationId=${locationId}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }

    const response = await fetch(ghlUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': VERSION,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('GHL Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

