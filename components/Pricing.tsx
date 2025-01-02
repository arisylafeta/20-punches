'use client';

import {Button} from '@/components/ui/button';
import type { Tables } from '@/types_db';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe, createStripePortal } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({ user, products, subscription }: Props) {
  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });
    setPriceIdLoading(undefined);
  };

  const handleCustomerPortal = async () => {
    try {
      const { url } = await createStripePortal(currentPath);
      if (url) window.location.href = url;
    } catch (error) {
      console.error(error);
      router.push(
        getErrorRedirect(
          currentPath,
          'Error',
          'Unable to access customer portal. Please try again later.'
        )
      );
    }
  };

  if (!products.length) {
    return (
      <section className="bg-background">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center">
            <p className="text-4xl font-extrabold text-foreground sm:text-center sm:text-6xl">
              No subscription pricing plans found. Create them in your{' '}
              <a
                className="text-primary underline"
                href="https://dashboard.stripe.com/products"
                rel="noopener noreferrer"
                target="_blank"
              >
                Stripe Dashboard
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-center sm:text-6xl">
            Pricing Plans
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-muted-foreground sm:text-center sm:text-2xl">
            Choose the perfect plan for your trading journey
          </p>
          <div className="relative self-center mt-6 bg-muted rounded-lg p-0.5 flex sm:mt-8 border border-border">
            {intervals.includes('month') && (
              <button
                onClick={() => setBillingInterval('month')}
                type="button"
                className={`${
                  billingInterval === 'month'
                    ? 'relative w-1/2 bg-background border-border shadow-sm text-foreground'
                    : 'ml-0.5 relative w-1/2 border border-transparent text-muted-foreground hover:text-foreground transition-colors'
                } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:z-10 sm:w-auto sm:px-8`}
              >
                Monthly billing
              </button>
            )}
            {intervals.includes('year') && (
              <button
                onClick={() => setBillingInterval('year')}
                type="button"
                className={`${
                  billingInterval === 'year'
                    ? 'relative w-1/2 bg-background border-border shadow-sm text-foreground'
                    : 'ml-0.5 relative w-1/2 border border-transparent text-muted-foreground hover:text-foreground transition-colors'
                } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:z-10 sm:w-auto sm:px-8`}
              >
                Yearly billing
              </button>
            )}
          </div>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {[...products].map((product) => {
            const price = product?.prices?.find(
              (price) => price.interval === billingInterval
            );
            if (!price) return null;
            const priceString = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency ?? 'USD',
              minimumFractionDigits: 0
            }).format((price?.unit_amount || 0) / 100);

            const isHobby = product.name?.toLowerCase().includes('hobby');
            const planDescription = isHobby
              ? "Perfect for beginners. Track your trades, analyze your performance, and learn from your history."
              : "For serious traders. Advanced analytics, unlimited trade history, priority support, and exclusive features.";

            const features = isHobby ? [
              "Add and track your investments",
              "Basic Portfolio Management",
              "10 messages per day",
              "Real time News",
              "Advanced Charts"
            ] : [
              "Everything in Hobby",
              "Advanced Portfolio Management",
              "Unlimited messages everyday",
              "Access to GPT 4o, Claude 3.5",
              "Real time financial metrics",
            ];

            return (
              <div
                key={product.id}
                className={cn(
                  'rounded-lg shadow-sm divide-y divide-zinc-600 bg-card',
                  {
                    'border border-primary': subscription
                      ? product.id === subscription?.prices?.products?.id
                      : product.name === 'Premium'
                  }
                )}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold leading-6 text-foreground">
                    {product.name}
                  </h2>
                  <p className="mt-4 text-muted-foreground">{planDescription}</p>
                  <p className="mt-8">
                    <span className="text-5xl font-extrabold text-foreground">
                      {priceString}
                    </span>
                    {!isHobby && (
                      <span className="text-base font-medium text-muted-foreground">
                        /{billingInterval}
                      </span>
                    )}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className={`w-5 h-5 ${!isHobby && feature.startsWith('+') ? 'text-primary' : 'text-muted-foreground'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className={`ml-3 ${!isHobby && feature.startsWith('+') ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {!isHobby && feature.startsWith('+') ? feature.substring(1) : feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {!isHobby && (
                    <Button
                      variant={product.name === 'Premium' ? 'default' : 'outline'}
                      size="lg"
                      className="mt-8 w-full"
                      disabled={!user}
                      onClick={() => subscription ? handleCustomerPortal() : handleStripeCheckout(price)}
                    >
                      {subscription ? 'Manage' : 'Subscribe'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
