import { LineService } from '../../services/line';
import { SupabaseService } from '../../services/supabase';

export async function sendPaymentConfirmation(context: any): Promise<any> {
  const { updated } = context.steps['update-reservation-status'].output;
  
  if (!updated) {
    return { sent: false };
  }
  
  const line = new LineService();
  const supabase = new SupabaseService();
  
  const { payment } = context.steps['update-payment-status'].output;
  
  const message = '✅ 決済が完了しました！ご利用ありがとうございました。';
  
  return { sent: true };
}
