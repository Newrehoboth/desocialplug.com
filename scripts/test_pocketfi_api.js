const POCKETFI_API_BASE = 'https://api.pocketfi.ng/api/v1';
const apiToken = '11293|kxpMg4zii2l3UzhRu4XDyQlNJ7q62VibTC5RKXDs9c1021ad';
const businessId = '29682';

async function probePocketFi() {
  const routes = [
    { url: `${POCKETFI_API_BASE}/virtual-accounts`, method: 'GET' },
    { url: `${POCKETFI_API_BASE}/virtual-accounts?businessId=${businessId}`, method: 'GET' },
    { url: `${POCKETFI_API_BASE}/virtual-accounts/transactions?businessId=${businessId}`, method: 'GET' },
    { url: `${POCKETFI_API_BASE}/virtual-accounts/history?accountNumber=1354727669`, method: 'GET' },
    { url: `${POCKETFI_API_BASE}/virtual-accounts/1354727669`, method: 'GET' },
    { url: `${POCKETFI_API_BASE}/transactions?businessId=${businessId}`, method: 'GET' },
    { url: `${POCKETFI_API_BASE}/transactions`, method: 'GET' },
    { url: `${POCKETFI_API_BASE}/settlements`, method: 'GET' },
    { url: `${POCKETFI_API_BASE}/wallet/balance`, method: 'GET' },
    { url: `${POCKETFI_API_BASE}/business/${businessId}/transactions`, method: 'GET' },
  ];

  for (const r of routes) {
    try {
      const res = await fetch(r.url, {
        method: r.method,
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log(`[${r.method}] ${r.url} -> Status: ${res.status}`);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        console.log('   JSON:', JSON.stringify(json).slice(0, 400));
      } catch {
        console.log('   Text:', text.slice(0, 200));
      }
    } catch (err) {
      console.log(`[${r.method}] ${r.url} -> Error:`, err.message);
    }
  }
}

probePocketFi();
