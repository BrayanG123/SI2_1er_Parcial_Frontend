import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })
export class StripeBrowserService {
  load(publishableKey: string): Promise<Stripe | null> {
    return loadStripe(publishableKey);
  }
}
