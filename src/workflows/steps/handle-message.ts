import { ConversationHandler } from '../../ai/conversation-handler';
import { BookingFlow } from '../booking-flow';

export async function handleMessage(context: any): Promise<any> {
  const { userId, message } = context.steps['parse-event'].output;
  
  if (message.type !== 'text') {
    return { response: 'テキストメッセージのみ対応しています。' };
  }

  const conversationHandler = new ConversationHandler();
  const bookingFlow = new BookingFlow();
  
  const aiResponse = await conversationHandler.processMessage(message.text, userId);
  
  if (aiResponse.includes('利用可能な時間帯')) {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    await bookingFlow.getAvailableSlots(
      today.toISOString(),
      nextWeek.toISOString(),
      userId
    );
  }

  return { response: aiResponse };
}
