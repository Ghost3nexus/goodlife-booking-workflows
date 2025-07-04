import { Client, MessageAPIResponseBase, TextMessage, QuickReply, QuickReplyItem } from '@line/bot-sdk';
import { CONFIG } from '../config';

export class LineService {
  private client: Client;

  constructor() {
    this.client = new Client({
      channelAccessToken: CONFIG.LINE_CHANNEL_ACCESS_TOKEN,
      channelSecret: CONFIG.LINE_CHANNEL_SECRET
    });
  }

  async sendTextMessage(userId: string, text: string): Promise<MessageAPIResponseBase> {
    const message: TextMessage = {
      type: 'text',
      text
    };

    return this.client.pushMessage(userId, message);
  }

  async sendQuickReplyMessage(
    userId: string, 
    text: string, 
    quickReplyItems: QuickReplyItem[]
  ): Promise<MessageAPIResponseBase> {
    const quickReply: QuickReply = {
      items: quickReplyItems
    };

    const message: TextMessage = {
      type: 'text',
      text,
      quickReply
    };

    return this.client.pushMessage(userId, message);
  }

  async sendBookingConfirmation(userId: string, eventDetails: string): Promise<MessageAPIResponseBase> {
    const text = `✅ 予約が確定しました！\n\n${eventDetails}\n\n体験後に決済リンクをお送りします。`;
    return this.sendTextMessage(userId, text);
  }

  async sendPaymentLink(userId: string, paymentUrl: string): Promise<MessageAPIResponseBase> {
    const text = `💳 お疲れ様でした！\n\n体験はいかがでしたか？\n以下のリンクから決済をお願いします：\n\n${paymentUrl}`;
    return this.sendTextMessage(userId, text);
  }

  async sendBookingCancellation(userId: string, eventDetails: string): Promise<MessageAPIResponseBase> {
    const text = `❌ 予約をキャンセルしました\n\n${eventDetails}\n\nまたのご利用をお待ちしております。`;
    return this.sendTextMessage(userId, text);
  }

  createTimeSlotQuickReply(slots: Array<{id: string, time: string}>): QuickReplyItem[] {
    return slots.map(slot => ({
      type: 'action',
      action: {
        type: 'postback',
        label: slot.time,
        data: `action=book&event_id=${slot.id}`
      }
    }));
  }
}
