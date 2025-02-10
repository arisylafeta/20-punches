'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

export default function ClarityAnalytics() {
  useEffect(() => {
    // Initialize Clarity
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CLARITY_ID) {
      clarity.init(process.env.NEXT_PUBLIC_CLARITY_ID);
    }
  }, []);

  return null;
}
