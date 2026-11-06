// List of Nigerian banks with their codes (from Paystack/Flutterwave)
export const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044', slug: 'access-bank' },
  { name: 'Access Bank (Diamond)', code: '063', slug: 'access-bank-diamond' },
  { name: 'Citibank Nigeria', code: '023', slug: 'citibank' },
  { name: 'Ecobank Nigeria', code: '050', slug: 'ecobank' },
  { name: 'Fidelity Bank', code: '070', slug: 'fidelity-bank' },
  { name: 'First Bank of Nigeria', code: '011', slug: 'first-bank' },
  { name: 'First City Monument Bank (FCMB)', code: '214', slug: 'fcmb' },
  { name: 'Globus Bank', code: '00103', slug: 'globus-bank' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058', slug: 'gtbank' },
  { name: 'Heritage Bank', code: '030', slug: 'heritage-bank' },
  { name: 'Jaiz Bank', code: '301', slug: 'jaiz-bank' },
  { name: 'Keystone Bank', code: '082', slug: 'keystone-bank' },
  { name: 'Kuda Bank', code: '50211', slug: 'kuda-bank' },
  { name: 'Moniepoint MFB', code: '50515', slug: 'moniepoint' },
  { name: 'Opay', code: '999992', slug: 'opay' },
  { name: 'PalmPay', code: '999991', slug: 'palmpay' },
  { name: 'VFD Microfinance Bank', code: '566', slug: 'vfd-mfb' },
  { name: 'FairMoney MFB', code: '51318', slug: 'fairmoney-mfb' },
  { name: 'Parallex Bank', code: '526', slug: 'parallex-bank' },
  { name: 'Polaris Bank', code: '076', slug: 'polaris-bank' },
  { name: 'Providus Bank', code: '101', slug: 'providus-bank' },
  { name: 'Stanbic IBTC Bank', code: '221', slug: 'stanbic-ibtc' },
  { name: 'Standard Chartered Bank', code: '068', slug: 'standard-chartered' },
  { name: 'Sterling Bank', code: '232', slug: 'sterling-bank' },
  { name: 'SunTrust Bank', code: '100', slug: 'suntrust-bank' },
  { name: 'Titan Trust Bank', code: '102', slug: 'titan-trust-bank' },
  { name: 'Union Bank of Nigeria', code: '032', slug: 'union-bank' },
  { name: 'United Bank for Africa (UBA)', code: '033', slug: 'uba' },
  { name: 'Unity Bank', code: '215', slug: 'unity-bank' },
  { name: 'Wema Bank', code: '035', slug: 'wema-bank' },
  { name: 'Zenith Bank', code: '057', slug: 'zenith-bank' },
];

/**
 * Search banks by name or code
 */
export function searchBanks(query: string) {
  if (!query) return NIGERIAN_BANKS;
  
  const q = query.toLowerCase().trim();
  return NIGERIAN_BANKS.filter(
    (bank) =>
      bank.name.toLowerCase().includes(q) ||
      bank.code.includes(q) ||
      bank.slug.includes(q)
  );
}

/**
 * Get bank by code
 */
export function getBankByCode(code: string) {
  return NIGERIAN_BANKS.find((bank) => bank.code === code);
}

/**
 * Get bank by name (fuzzy match)
 */
export function getBankByName(name: string) {
  const normalized = name.toLowerCase().trim();
  return NIGERIAN_BANKS.find((bank) => 
    bank.name.toLowerCase().includes(normalized) ||
    normalized.includes(bank.name.toLowerCase())
  );
}
