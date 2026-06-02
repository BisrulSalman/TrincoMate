const http = require('http');
const url = process.argv[2] || 'http://localhost:5000/api/services/sqUilcc5r0knRr1A7B0t';

http.get(url, (res) => {
  let out = '';
  res.on('data', (chunk) => out += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(out);
      const svc = data.service || data.services || data;
      console.log(JSON.stringify({
        coverImage: svc.coverImage || svc.image || svc.cover || null,
        raw: svc,
      }, null, 2));
    } catch (err) {
      console.error('Parse error', err.message);
      console.log(out);
    }
  });
}).on('error', (e) => console.error('Request error', e.message));
