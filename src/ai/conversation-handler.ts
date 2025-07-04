interface ChatOpenAI {
  invoke(messages: any[]): Promise<{ content: string }>;
}

interface HumanMessage {
  content: string;
}

interface ConversationState {
  messages: any[];
  intent: string;
  context: Record<string, any>;
}

export class ConversationHandler {
  private model: ChatOpenAI;

  constructor() {
    this.model = {
      async invoke(messages: any[]) {
        return { content: 'Mock AI response for development' };
      }
    };
  }


  async processMessage(userMessage: string, lineUid: string): Promise<string> {
    const startTime = Date.now();

    try {
      const intent = await this.classifyIntent(userMessage);
      let response: string;

      switch (intent) {
        case 'booking':
          response = await this.handleBookingIntent(userMessage);
          break;
        case 'cancellation':
          response = await this.handleCancellationIntent(userMessage);
          break;
        case 'inquiry':
          response = await this.handleInquiryIntent(userMessage);
          break;
        default:
          response = await this.handleUnknownIntent(userMessage);
      }

      const responseTime = Date.now() - startTime;
      if (responseTime > 1000) {
        console.warn(`AI response time exceeded 1s: ${responseTime}ms`);
      }

      return response;

    } catch (error) {
      console.error('Conversation processing error:', error);
      return 'システムエラーが発生しました。しばらくしてからもう一度お試しください。';
    }
  }

  private async classifyIntent(userMessage: string): Promise<string> {
    
    const classificationPrompt = `
    以下のメッセージの意図を分類してください：
    - booking: 予約したい
    - cancellation: キャンセルしたい
    - inquiry: 質問・問い合わせ
    - unknown: その他

    メッセージ: "${userMessage}"
    
    意図のみを回答してください（booking, cancellation, inquiry, unknown のいずれか）:
    `;

    const response = await this.model.invoke([{ content: classificationPrompt }]);
    const intent = (response.content as string).trim().toLowerCase();

    return ['booking', 'cancellation', 'inquiry'].includes(intent) ? intent : 'unknown';
  }

  private async handleBookingIntent(userMessage: string): Promise<string> {
    return '体験予約をご希望ですね！利用可能な時間帯をお調べします。少々お待ちください。';
  }

  private async handleCancellationIntent(userMessage: string): Promise<string> {
    return '予約のキャンセルをご希望ですね。ご予約の詳細を確認いたします。';
  }

  private async handleInquiryIntent(userMessage: string): Promise<string> {
    
    const inquiryPrompt = `
    GOOD LIFEの体験予約システムに関する質問に答えてください。
    以下の情報を参考にしてください：
    - 体験時間: 通常60分
    - 料金: 3,000円（体験後決済）
    - 予約変更: 前日まで可能
    - キャンセル: 当日キャンセルは料金が発生する場合があります

    質問: "${userMessage}"

    親切で丁寧な日本語で回答してください:
    `;

    const response = await this.model.invoke([{ content: inquiryPrompt }]);
    
    return response.content as string;
  }

  private async handleUnknownIntent(userMessage: string): Promise<string> {
    return 'すみません、よく理解できませんでした。\n\n以下のことができます：\n・体験予約\n・予約の変更・キャンセル\n・お問い合わせ\n\nご希望の内容を教えてください。';
  }
}
