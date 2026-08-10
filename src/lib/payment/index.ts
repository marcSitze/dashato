import Stripe from 'stripe';

export interface PaymentIntentRequest {
  orderId: string;
  orderNumber: string;
  amount: number; // In main currency unit (e.g. 99.99)
  currency: string; // e.g. "usd"
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  provider: 'STRIPE' | 'PAYPAL' | 'SIMULATED';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  message?: string;
  clientSecret?: string;
}

export interface IPaymentProvider {
  createPaymentIntent(req: PaymentIntentRequest): Promise<PaymentResult>;
  confirmPayment(transactionId: string): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount: number): Promise<PaymentResult>;
}

class StripePaymentProvider implements IPaymentProvider {
  private stripe: Stripe | null = null;

  constructor() {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-01-27.acacia' as any,
      });
    }
  }

  async createPaymentIntent(req: PaymentIntentRequest): Promise<PaymentResult> {
    if (!this.stripe) {
      // Fallback for demo/development when no Stripe key is configured
      return {
        success: true,
        transactionId: `sim_tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        provider: 'SIMULATED',
        status: 'COMPLETED',
        message: 'Payment processed successfully via simulated gateway.',
      };
    }

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(req.amount * 100), // Convert to cents
        currency: req.currency.toLowerCase(),
        receipt_email: req.customerEmail,
        metadata: {
          orderId: req.orderId,
          orderNumber: req.orderNumber,
        },
      });

      return {
        success: true,
        transactionId: intent.id,
        provider: 'STRIPE',
        status: 'PENDING',
        clientSecret: intent.client_secret || undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId: '',
        provider: 'STRIPE',
        status: 'FAILED',
        message: err.message || 'Failed to create Stripe payment intent',
      };
    }
  }

  async confirmPayment(transactionId: string): Promise<PaymentResult> {
    if (transactionId.startsWith('sim_tx_')) {
      return {
        success: true,
        transactionId,
        provider: 'SIMULATED',
        status: 'COMPLETED',
      };
    }

    if (!this.stripe) {
      return { success: true, transactionId, provider: 'SIMULATED', status: 'COMPLETED' };
    }

    try {
      const intent = await this.stripe.paymentIntents.retrieve(transactionId);
      return {
        success: intent.status === 'succeeded',
        transactionId: intent.id,
        provider: 'STRIPE',
        status: intent.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId,
        provider: 'STRIPE',
        status: 'FAILED',
        message: err.message,
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<PaymentResult> {
    if (transactionId.startsWith('sim_tx_')) {
      return {
        success: true,
        transactionId: `refund_${transactionId}`,
        provider: 'SIMULATED',
        status: 'COMPLETED',
        message: `Refund of $${amount.toFixed(2)} processed successfully.`,
      };
    }

    if (!this.stripe) {
      return { success: true, transactionId, provider: 'SIMULATED', status: 'COMPLETED' };
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: transactionId,
        amount: Math.round(amount * 100),
      });

      return {
        success: refund.status === 'succeeded',
        transactionId: refund.id,
        provider: 'STRIPE',
        status: 'COMPLETED',
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId,
        provider: 'STRIPE',
        status: 'FAILED',
        message: err.message,
      };
    }
  }
}

export const paymentProvider: IPaymentProvider = new StripePaymentProvider();
