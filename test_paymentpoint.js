const fetch = require('node-fetch');

async function test() {
  const url = 'https://api.paymentpoint.co/api/v1/createVirtualAccount';
  const apiSecret = 'b6c78bbe842c103548b6e93360def7a9fee8d89b847e7579ac648206898149e699abec0fc05518faefbc86ce43269dcb90a7e9665895993cfa930fe0';
  const apiKey = '51f95b6c653949ce47d04a3455a6dd1245ca54a6';
  
  const payload = {
    email: 'test' + Date.now() + '@example.com',
    name: 'Test User',
    phoneNumber: '08123456789',
    bankCode: ['20946'],
    businessId: '731a954915ce7768e190acd29eb08e8a853c3ab8'
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiSecret}`,
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  const data = await resp.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
