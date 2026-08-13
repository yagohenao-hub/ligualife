const https = require('https');

const data = JSON.stringify({
  fields: {
    "Teacher Observations": "Santiago demostró un progreso excelente hoy. Logró aplicar los verbos modales en contextos de negocios y mantuvo la fluidez durante todo el debate. Para la próxima sesión, reforzaríamos el uso de conectores avanzados."
  }
});

const req = https.request({
  hostname: 'api.airtable.com',
  path: '/v0/appPeywPrGvW30R1y/Session%20Participants/rec8uaxI7HSROvkB4',
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ' + process.env.AIRTABLE_API_KEY,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let result = '';
  res.on('data', d => result += d);
  res.on('end', () => console.log('Response:', result));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
