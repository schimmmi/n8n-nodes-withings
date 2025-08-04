import { IHttpRequestOptions } from 'n8n-workflow';
// Use Node.js built-in modules with type declarations
import crypto from 'node:crypto';
import process from 'node:process';

/**
 * Format scope for Withings OAuth2
 * @param {string} scope - Raw scope
 * @returns {string} A formatted version of the scope
 */
export function formatScope(scope: string): string {
  return scope
    .split(',')
    .map((el) => 'user.' + el.trim())
    .join(',');
}

/**
 * Generate Signature for Withings API
 * @param {string} action - Action type
 * @param {string} clientId - Withings client ID
 * @param {string} clientSecret - Withings client Secret
 * @param {string} baseValue - The signature influencer (timestamp or nonce)
 * @returns {string} - The Generated signature
 */
export function generateSignature(
  action: string,
  clientId: string,
  clientSecret: string,
  baseValue: string | number,
): string {
  const signature = `${action},${clientId},${baseValue}`;
  const hmac = crypto.createHmac('sha256', clientSecret);
  const data = hmac.update(signature);
  return data.digest('hex');
}

/**
 * Generate nonce for Withings API
 * @param {string} clientId - Withings client ID
 * @param {string} clientSecret - Withings client secret
 * @param {Function} makeRequest - Function to make HTTP requests
 * @returns {Promise<string>} Generated nonce
 */
export async function getNonce(
  clientId: string,
  clientSecret: string,
  makeRequest: (options: IHttpRequestOptions) => Promise<any>,
): Promise<string> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);

    const options: IHttpRequestOptions = {
      method: 'POST',
      url: 'https://wbsapi.withings.net/v2/signature',
      body: {
        action: 'getnonce',
        client_id: clientId,
        timestamp,
        signature: generateSignature('getnonce', clientId, clientSecret, timestamp),
      },
      json: true,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      timeout: 10000,
    };

    const response = await makeRequest(options);

    if (response.body && response.body.nonce) {
      return response.body.nonce;
    } else {
      throw new Error('Failed to retrieve nonce from Withings API');
    }
  } catch (error) {
    // Use a safer approach than console.error for TypeScript compatibility
    if (process && process.stderr && process.stderr.write) {
      process.stderr.write(`Error getting nonce: ${error}\n`);
    }
    throw error;
  }
}

/**
 * Normalize month (add leading zero if needed)
 * @param {number} month - Month (0-11)
 * @returns {string} - Normalized month (01-12)
 */
export function normalizeMonth(month: number): string {
  return month < 10 ? '0' + (month + 1) : '' + (month + 1);
}

/**
 * Normalize day (add leading zero if needed)
 * @param {number} day - Day (1-31)
 * @returns {string} - Normalized day (01-31)
 */
export function normalizeDay(day: number): string {
  return day < 10 ? '0' + day : '' + day;
}
