import { CONFIG } from '../config';

export class SlackService {
  async sendAlert(message: string, severity: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    const emoji = {
      info: '💡',
      warning: '⚠️',
      error: '🚨'
    };

    const payload = {
      text: `${emoji[severity]} GOOD LIFE Booking Alert`,
      attachments: [{
        color: severity === 'error' ? 'danger' : severity === 'warning' ? 'warning' : 'good',
        text: message,
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    try {
      const fetchFn = typeof fetch !== 'undefined' ? fetch : async () => ({ ok: true, status: 200, statusText: 'OK' });
      
      const response = await fetchFn(CONFIG.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Failed to send Slack alert:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending Slack alert:', error);
    }
  }

  async sendBookingAlert(type: 'created' | 'cancelled' | 'payment_completed', details: string): Promise<void> {
    const messages = {
      created: `新しい予約が作成されました: ${details}`,
      cancelled: `予約がキャンセルされました: ${details}`,
      payment_completed: `決済が完了しました: ${details}`
    };

    await this.sendAlert(messages[type], 'info');
  }

  async sendIntegrityAlert(message: string): Promise<void> {
    await this.sendAlert(`整合性チェック: ${message}`, 'warning');
  }
}
