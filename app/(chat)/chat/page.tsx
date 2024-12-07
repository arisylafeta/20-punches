'use client';

import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';
import { useEffect } from 'react';

export default function ChatPage() {
  const router = useRouter();
  
  useEffect(() => {
    const id = generateUUID();
    router.replace(`/chat/${id}`);
  }, [router]);

  return null; // or a loading spinner if desired
}
