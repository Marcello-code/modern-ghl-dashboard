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
    // Use correct base URL and headers based on Make.com documentation
    const BASE_URL = 'https://services.leadconnectorhq.com';
    const VERSION = '2021-07-28';
    
    // Check if it's a Private Integration Token (starts with 'pit-')
    let locationId;
    if (apiKey.startsWith('pit-')) {
      // For Private Integration Tokens, we need to get locationId from request or use a default
      locationId = req.query.locationId || null;
    } else {
      // Extract location_id from JWT token
      try {
        const payload = JSON.parse(atob(apiKey.split('.')[1]));
        locationId = payload.location_id;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid API key format' });
      }
    }
    
    let ghlUrl, method = 'GET';
    switch (endpoint) {
      case 'contacts':
        if (locationId) {
          // Use deprecated contacts endpoint with locationId parameter
          ghlUrl = `${BASE_URL}/contacts/?locationId=${locationId}`;
        } else {
          // Try to get locations first to find available location IDs
          ghlUrl = `${BASE_URL}/locations/search`;
          method = 'POST';
        }
        break;
      case 'locations':
        ghlUrl = `${BASE_URL}/locations/search`;
        method = 'POST';
        break;
      case 'calendars':
        if (locationId) {
          ghlUrl = `${BASE_URL}/calendars/?locationId=${locationId}`;
        } else {
          return res.status(400).json({ error: 'Location ID required for calendars' });
        }
        break;
      case 'appointments':
        if (locationId) {
          ghlUrl = `${BASE_URL}/calendars/events/?locationId=${locationId}`;
        } else {
          return res.status(400).json({ error: 'Location ID required for appointments' });
        }
        break;
      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }

    // Use correct headers as specified in Make.com documentation
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Version': VERSION,
      'Accept': 'application/json'
    };

    // Add Content-Type for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(ghlUrl, {
      method: method,
      headers: headers,
      body: method === 'POST' && endpoint === 'locations' ? JSON.stringify({}) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Handle pagination for contacts endpoint
    if (endpoint === 'contacts' && data.contacts && data.meta && data.meta.nextPageUrl) {
      let allContacts = [...data.contacts];
      let nextPageUrl = data.meta.nextPageUrl;
      
      // Fetch all pages (limit to 10 pages to prevent infinite loops)
      let pageCount = 1;
      while (nextPageUrl && pageCount < 10) {
        try {
          const nextResponse = await fetch(nextPageUrl, {
            method: 'GET',
            headers: headers
          });
          
          if (nextResponse.ok) {
            const nextData = await nextResponse.json();
            if (nextData.contacts && nextData.contacts.length > 0) {
              allContacts = [...allContacts, ...nextData.contacts];
              nextPageUrl = nextData.meta?.nextPageUrl;
              pageCount++;
            } else {
              break;
            }
          } else {
            break;
          }
        } catch (error) {
          console.error('Pagination error:', error);
          break;
        }
      }
      
      // Return all contacts with updated meta
      return res.status(200).json({
        ...data,
        contacts: allContacts,
        meta: {
          ...data.meta,
          total: allContacts.length,
          currentPage: 1,
          nextPageUrl: null // No more pages since we fetched all
        }
      });
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

