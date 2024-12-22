import { Controller, Post, Body, Headers, HttpCode, Logger, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Request } from 'express';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private configService: ConfigService,
    private readonly stripeService:StripeService
  ) {
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  @Post('webhook')
  @HttpCode(200)
  async handleStripeEvent(
    @Req() request: Request, 
    @Headers('stripe-signature') signature: string
  ) {
    console.log("Entered in hook");

    const endpointSecret = this.configService.get<string>('STRIPE_ENDPOINT_SECRET');
    let event: Stripe.Event;
    console.log(endpointSecret, "Secret");

    const body = request.body;  

    try {

      event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      this.logger.error('Webhook signature verification failed:', err.message);
      return { error: 'Webhook signature verification failed' };
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log("Entered into payment intent succeeded");
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.stripeService.updations(paymentIntent)
          
        this.logger.log(`PaymentIntent ${paymentIntent.id} was successful!`);
        break;

      default:
        this.logger.warn(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
