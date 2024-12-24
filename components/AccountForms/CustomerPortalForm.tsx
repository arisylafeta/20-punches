'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { createStripePortal } from '@/utils/stripe/server';
import { getStatusRedirect } from '@/utils/helpers';
import { useRouter } from 'next/navigation';

export default function CustomerPortalForm() {
  const router = useRouter();

  const handleCustomerPortal = async () => {
    try {
      const { url } = await createStripePortal();
      if (url) window.location.href = url;
    } catch (error) {
      console.error(error);
      router.push(
        getStatusRedirect(
          '/settings',
          'Error',
          'Unable to access customer portal. Please try again later.'
        )
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Portal</CardTitle>
        <CardDescription>
          Manage your subscription and billing information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Access Stripe&apos;s customer portal to manage your subscription, payment methods,
          and billing history.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCustomerPortal}>
          Open Customer Portal
        </Button>
      </CardFooter>
    </Card>
  );
}
