import { SupabaseService } from '../services/supabase';
import { SquareService } from '../services/square';
import { LineService } from '../services/line';
import { SlackService } from '../services/slack';
import { WorkflowContext, PaymentStatus, ReservationStatus } from '../types';

export class PaymentFlow {
  private supabase: SupabaseService;
  private square: SquareService;
  private line: LineService;
  private slack: SlackService;

  constructor() {
    this.supabase = new SupabaseService();
    this.square = new SquareService();
    this.line = new LineService();
    this.slack = new SlackService();
  }

  async createPaymentLink(reservationId: string, amount: number = 3000): Promise<string> {
    try {
      const paymentUrl = await this.square.createCheckoutLink(reservationId, amount);
      
      const payment = await this.supabase.createPayment({
        reservation_id: reservationId,
        transaction_id: `res_${reservationId}_${Date.now()}`,
        status: PaymentStatus.PENDING,
        amount,
        currency: 'JPY'
      });

      return paymentUrl;

    } catch (error) {
      await this.slack.sendAlert(`Payment link creation failed: ${error}`, 'error');
      throw error;
    }
  }

  async sendPaymentLink(reservationId: string, lineUid: string): Promise<void> {
    try {
      const paymentUrl = await this.createPaymentLink(reservationId);
      await this.line.sendPaymentLink(lineUid, paymentUrl);

    } catch (error) {
      await this.slack.sendAlert(`Failed to send payment link: ${error}`, 'error');
      throw error;
    }
  }

  async processPaymentWebhook(webhookData: any): Promise<WorkflowContext> {
    const context: WorkflowContext = {};

    try {
      const { payment_id, status, transaction_id } = webhookData;

      const payment = await this.supabase.updatePaymentStatus(transaction_id, status);
      context.payment = payment;

      if (status === 'COMPLETED' || status === 'paid') {
        const reservation = await this.supabase.updateReservationStatus(
          payment.reservation_id, 
          ReservationStatus.CONFIRMED
        );
        context.reservation = reservation;

        const user = await this.supabase.getUserByLineUid(''); // Need to get user from reservation
        if (user) {
          await this.line.sendTextMessage(
            user.line_uid,
            '✅ 決済が完了しました！ご利用ありがとうございました。'
          );
        }

        await this.slack.sendBookingAlert('payment_completed', `Payment completed for reservation ${payment.reservation_id}`);
      }

      return context;

    } catch (error) {
      context.error = error instanceof Error ? error.message : 'Unknown error';
      await this.slack.sendAlert(`Payment webhook processing failed: ${context.error}`, 'error');
      throw error;
    }
  }

  async retryFailedPayments(): Promise<void> {
    try {
      console.log('Retrying failed payments...');
      
    } catch (error) {
      await this.slack.sendAlert(`Payment retry failed: ${error}`, 'error');
    }
  }
}
