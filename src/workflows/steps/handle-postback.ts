import { BookingFlow } from '../booking-flow';

export async function handlePostback(context: any): Promise<any> {
  const { userId, postback } = context.steps['parse-event'].output;
  const data = new URLSearchParams(postback.data);
  
  const action = data.get('action');
  const eventId = data.get('event_id');

  if (action === 'book' && eventId) {
    const bookingFlow = new BookingFlow();
    
    try {
      await bookingFlow.processBookingRequest({
        line_uid: userId,
        event_id: eventId,
        user_name: 'LINE User' // This would be obtained from LINE profile API
      });
      
      return { response: 'booking_confirmed' };
    } catch (error) {
      return { response: 'booking_failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  return { response: 'unknown_postback' };
}
