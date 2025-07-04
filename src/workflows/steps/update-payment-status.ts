import { SupabaseService } from '../../services/supabase';

export async function updatePaymentStatus(context: any): Promise<any> {
  const { transaction_id, status } = context.steps['parse-payment-event'].output;
  const supabase = new SupabaseService();
  
  const payment = await supabase.updatePaymentStatus(transaction_id, status);
  
  return { payment };
}
