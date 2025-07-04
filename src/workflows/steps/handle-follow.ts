import { LineService } from '../../services/line';

export async function handleFollow(context: any): Promise<any> {
  const { userId } = context.steps['parse-event'].output;
  
  const line = new LineService();
  
  const welcomeMessage = `GOOD LIFEへようこそ！🎉

体験予約をご希望の場合は「予約したい」とメッセージしてください。

ご利用方法：
・体験予約
・予約の変更・キャンセル
・お問い合わせ

何かご不明な点がございましたら、お気軽にお声かけください！`;

  await line.sendTextMessage(userId, welcomeMessage);
  
  return { response: 'welcome_sent' };
}
