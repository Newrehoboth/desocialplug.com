const POCKETFI_API_BASE = 'https://api.pocketfi.ng/api/v1';
const apiToken = '11293|kxpMg4zii2l3UzhRu4XDyQlNJ7q62VibTC5RKXDs9c1021ad';
const businessId = '29682';

async function testCreateVA() {
  const payload = {
    first_name: 'danielogbowu19',
    last_name: 'User',
    phone: '09000000000',
    email: 'danielogbowu19@gmail.com',
    businessId: businessId,
    bank: 'paga'
  };

  console.log('Testing payload:', payload);

  const res = await fetch(`${POCKETFI_API_BASE}/virtual-accounts/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log('Response:', data);
}

testCreateVA();
