import { SlackService } from '../../services/slack';

export async function notifyPaymentSlack(context: any): Promise<any> {
  const { updated } = context.steps['update-reservation-status'].output;
  
  if (!updated) {
    return { sent: false };
  }
  
  const slack = new SlackService();
  const { payment } = context.steps['update-payment-status'].output;
  
  await slack.sendBookingAlert('payment_completed', `Payment completed: ${payment.transaction_id}`);
  
  return { sent: true };
}
