import { GoogleCalendarService } from '../../services/calendar';

export async function fetchCalendarEvents(context: any): Promise<any> {
  const calendar = new GoogleCalendarService();
  
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const events = await calendar.getAvailableSlots(startDate, endDate);
  
  return { events };
}
