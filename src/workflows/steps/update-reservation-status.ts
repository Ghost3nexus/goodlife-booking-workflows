import { SupabaseService } from '../../services/supabase';
import { ReservationStatus } from '../../types';

export async function updateReservationStatus(context: any): Promise<any> {
  const { payment } = context.steps['update-payment-status'].output;
  const { status } = context.steps['parse-payment-event'].output;
  
  if (status === 'COMPLETED' || status === 'paid') {
    const supabase = new SupabaseService();
    const reservation = await supabase.updateReservationStatus(
      payment.reservation_id,
      ReservationStatus.CONFIRMED
    );
    
    return { reservation, updated: true };
  }
  
  return { updated: false };
}
