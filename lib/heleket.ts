// Heleket Payment API Integration
// Payment Provider: heleket.com
// API Docs: https://doc.heleket.com/methods/payments/creating-invoice

import crypto from 'crypto';

interface PaymentRequest {
  amount: string;
  currency: string;
  order_id: string;
  url_return?: string;
  url_success?: string;
  url_callback?: string;
  to_currency?: string;
  payer_email?: string;
}

interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  uuid?: string;
  error?: string;
  message?: string;
}

interface HeleketeApiResponse {
  state: number;
  result?: {
    uuid: string;
    url: string;
    [key: string]: any;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

export const HELEKET_CONFIG = {
  merchantId: process.env.HELEKET_MERCHANT_ID || 'f908b316-96bf-41b0-88e8-334911ea3af7',
  apiKey: process.env.HELEKET_API_KEY || 'sWsCPzvadAXGSLNwTTdqTOIlstwGLE91eBFuEu5QMoIDOFquzb2b158iQ5fahdK9EpwhH3iA8T2xPmoKxaDrJG9cA3QEm2tljGbO34vCvzF36nQ2ZVHC5KqDJ3sV3FXk',
  apiBaseUrl: 'https://api.heleket.com/v1',
};

/**
 * Generate signature for Heleket API requests
 * Signature = MD5(base64(JSON body) + API_KEY)
 */
function generateSignature(jsonBody: string): string {
  const base64Body = Buffer.from(jsonBody).toString('base64');
  const signString = `${base64Body}${HELEKET_CONFIG.apiKey}`;
  return crypto.createHash('md5').update(signString).digest('hex');
}

/**
 * Create a payment request with Heleket
 */
export async function createHeleketePaymentLink(
  merchantData: {
    userId: string;
    email: string;
    name: string;
  },
  paymentData: {
    amount: number;
    currency: string;
    description: string;
  },
  callbackUrls: {
    callbackUrl: string;
    returnUrl: string;
  },
): Promise<PaymentResponse> {
  try {
    const orderId = `${merchantData.userId}-${Date.now()}`;

    const payload: PaymentRequest = {
      amount: paymentData.amount.toString(),
      currency: paymentData.currency,
      order_id: orderId,
      url_return: callbackUrls.returnUrl,
      url_success: callbackUrls.returnUrl,
      url_callback: callbackUrls.callbackUrl,
      payer_email: merchantData.email,
    };

    console.log('Creating Heleket invoice with payload:', {
      ...payload,
      order_id: orderId,
      amount: payload.amount,
    });

    // Prepare JSON body for signature calculation
    const jsonBody = JSON.stringify(payload);
    const signature = generateSignature(jsonBody);

    // Make API request to Heleket
    const response = await fetch(`${HELEKET_CONFIG.apiBaseUrl}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant': HELEKET_CONFIG.merchantId,
        'sign': signature,
      },
      body: jsonBody,
    });

    const data: HeleketeApiResponse = await response.json();

    console.log('Heleket API response:', {
      state: data.state,
      hasUrl: !!data.result?.url,
      uuid: data.result?.uuid,
    });

    if (data.state === 0 && data.result?.url) {
      return {
        success: true,
        payment_url: data.result.url,
        transaction_id: data.result.uuid || orderId,
        uuid: data.result.uuid,
      };
    } else {
      const errorMsg = data.message || 'Failed to create payment invoice';
      console.error('Heleket API error:', errorMsg, data.errors);
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error: any) {
    console.error('Heleket payment creation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment',
    };
  }
}

/**
 * Verify payment signature from Heleket webhook
 * Heleket computes: MD5(base64(JSON with sorted keys) + API_KEY)
 * Keys MUST be sorted alphabetically — JSON.stringify without sorting will always fail.
 */
export function verifyHeleketeSignature(
  data: Record<string, any>,
  signature: string,
): boolean {
  try {
    // We use the original key order from the parsed JSON, 
    // as Heleket's PHP server likely signs the JSON in its original received order.
    // Sorting alphabetically is removed as it caused mismatches in live tests.

    // Stringify the object as it is
    const jsonData = JSON.stringify(data);
    // Base64 encode
    const base64Data = Buffer.from(jsonData).toString('base64');
    // Concatenate with API key
    const signString = `${base64Data}${HELEKET_CONFIG.apiKey}`;
    // MD5 hash
    const calculatedSignature = crypto.createHash('md5').update(signString).digest('hex');

    const isValid = calculatedSignature === signature;

    if (!isValid) {
      console.warn('🔐 Webhook signature check: ❌ INVALID');
      console.log(`   Received: ${signature}`);
      console.log(`   Calculated: ${calculatedSignature}`);
      console.log(`   JSON used: ${jsonData.substring(0, 100)}...`);
    } else {
      console.log('🔐 Webhook signature check: ✅ VALID');
    }

    return isValid;
  } catch (error: any) {
    console.error('❌ Signature verification ERROR:', error.message);
    return false;
  }
}
