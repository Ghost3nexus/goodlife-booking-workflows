import { createHmac } from 'crypto';
import { CONFIG } from '../../config';

export async function validateSquareSignature(context: any): Promise<any> {
  const { headers, body } = context.request;
  const signature = headers['x-square-signature'];
  
  if (!signature) {
    throw new Error('Missing Square signature');
  }

  const hash = createHmac('sha256', CONFIG.SQUARE_WEBHOOK_SECRET || '')
    .update(body)
    .digest('base64');

  if (signature !== hash) {
    throw new Error('Invalid Square signature');
  }

  return { valid: true };
}
