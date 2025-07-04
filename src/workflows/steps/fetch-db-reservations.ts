import { SupabaseService } from '../../services/supabase';

export async function fetchDbReservations(context: any): Promise<any> {
  const supabase = new SupabaseService();
  const { events } = context.steps['fetch-calendar-events'].output;
  
  const reservationsByEvent: Record<string, any[]> = {};
  
  for (const event of events) {
    const reservations = await supabase.getReservationsByEventId(event.id);
    reservationsByEvent[event.id] = reservations;
  }
  
  return { reservationsByEvent };
}
