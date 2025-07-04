export async function parsePaymentEvent(context: any): Promise<any> {
  const { body } = context.request;
  const data = JSON.parse(body);
  
  if (!data.data || !data.data.object) {
    throw new Error('Invalid Square webhook payload');
  }

  const payment = data.data.object.payment;
  
  return {
    payment_id: payment.id,
    status: payment.status,
    amount: payment.amount_money.amount,
    currency: payment.amount_money.currency,
    order_id: payment.order_id,
    transaction_id: payment.reference_id
  };
}
