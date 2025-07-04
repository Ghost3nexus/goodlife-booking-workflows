import { createHmac } from 'crypto';
import { CONFIG } from '../../config';

export async function validateLineSignature(context: any): Promise<any> {
  const { headers, body } = context.request;
  const signature = headers['x-line-signature'];
  
  if (!signature) {
    throw new Error('Missing LINE signature');
  }

  const hash = createHmac('sha256', CONFIG.LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');

  if (signature !== hash) {
    throw new Error('Invalid LINE signature');
  }

  return { valid: true };
}
