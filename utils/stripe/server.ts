'use server';

import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { createOrRetrieveCustomer } from '@/utils/supabase/admin';
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp
} from '@/utils/helpers';
import { Tables } from '@/types_db';
import { getUser } from '@/lib/db/users';

type Price = Tables<'prices'>;

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

export async function checkoutWithStripe(
  price: Price,
  redirectPath: string = '/account'
): Promise<CheckoutResponse> {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);
    
    if (!user) {
      throw new Error('Could not get user session.');
    }

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id,
        email: user.email || ''
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer,
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      cancel_url: getURL(redirectPath),
      success_url: getURL(redirectPath),
      mode: 'subscription',
      subscription_data: {
        metadata: {
          userId: user.id
        }
      }
    };

    // If there is a trial period, add it to the subscription
    const trialEndTimestamp = calculateTrialEndUnixTimestamp(
      price.trial_period_days
    );
    if (trialEndTimestamp) {
      params.subscription_data!.trial_end = trialEndTimestamp;
    }

    const session = await stripe.checkout.sessions.create(params);

    return {
      sessionId: session.id
    };
  } catch (err) {
    console.error(err);
    return {
      errorRedirect: getErrorRedirect(
        redirectPath,
        'An error occurred.',
        'Please try again later or contact support.'
      )
    };
  }
}

export async function createStripePortal(
  currentPath: string = '/account'
): Promise<{ errorRedirect?: string; url?: string }> {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      throw new Error('Could not get user session.');
    }

    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id,
        email: user.email || ''
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: getURL(currentPath)
    });

    return { url };
  } catch (err) {
    console.error(err);
    return {
      errorRedirect: getErrorRedirect(
        currentPath,
        'An error occurred.',
        'Please try again later or contact support.'
      )
    };
  }
}