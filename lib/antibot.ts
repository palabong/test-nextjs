export async function signData(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifySignature(data: string, signature: string, secret: string): Promise<boolean> {
  const expected = await signData(data, secret);
  return expected === signature;
}

export async function createChallengeToken(secret: string): Promise<{ token: string, signature: string }> {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const expires = Date.now() + 60000; // 60s TTL
  const token = `${a},${b},${expires}`;
  const signature = await signData(token, secret);
  return { token: `${token}|${signature}`, signature };
}

export async function verifyChallengeToken(tokenString: string, answer: number, secret: string): Promise<boolean> {
  const parts = tokenString.split('|');
  if (parts.length !== 2) return false;
  const [token, signature] = parts;
  const isValidSig = await verifySignature(token, signature, secret);
  if (!isValidSig) return false;
  
  const [aStr, bStr, expiresStr] = token.split(',');
  if (Date.now() > parseInt(expiresStr, 10)) return false; // Expired
  
  const expectedAnswer = parseInt(aStr, 10) + parseInt(bStr, 10);
  return answer === expectedAnswer;
}