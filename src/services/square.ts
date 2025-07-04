import { Client, Environment } from 'square';
import { CONFIG } from '../config';

export class SquareService {
  private client: Client;

  constructor() {
    this.client = new Client({
      accessToken: CONFIG.SQUARE_ACCESS_TOKEN,
      environment: CONFIG.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox
    });
  }

  async createCheckoutLink(
    reservationId: string,
    amount: number,
    currency: string = 'JPY'
  ): Promise<string> {
    const { result } = await this.client.checkoutApi.createPaymentLink({
      idempotencyKey: `reservation_${reservationId}_${Date.now()}`,
      quickPay: {
        name: 'GOOD LIFE 体験料金',
        priceMoney: {
          amount: BigInt(amount),
          currency
        },
        locationId: process.env.SQUARE_LOCATION_ID!
      },
      checkoutOptions: {
        redirectUrl: `${CONFIG.BASE_URL}/payment/success?reservation_id=${reservationId}`,
        askForShippingAddress: false
      }
    });

    return result.paymentLink?.url || '';
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    const { result } = await this.client.paymentsApi.getPayment(paymentId);
    return result.payment?.status || 'UNKNOWN';
  }

  async processWebhook(signature: string, body: string): Promise<any> {
    return JSON.parse(body);
  }
}
