// ─────────────────────────────────────────────────────────────
// JWT Helper – Client-Side HS256 signing using Web Crypto API
// ─────────────────────────────────────────────────────────────

/**
 * Converts an ArrayBuffer to a URL-safe Base64 string.
 * @param {ArrayBuffer} buffer 
 * @returns {string}
 */
function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Signs a payload with HS256 algorithm and a secret key.
 * @param {object} payload 
 * @param {string} secret 
 * @returns {Promise<string>}
 */
export async function signJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Base64Url encode header
  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  // Base64Url encode payload
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret || 'your-supabase-jwt-secret-placeholder');
  const messageData = encoder.encode(tokenInput);
  
  // Import raw key data into WebCrypto HMAC
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  
  // Sign the inputs
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const encodedSignature = arrayBufferToBase64Url(signature);
  
  return `${tokenInput}.${encodedSignature}`;
}
