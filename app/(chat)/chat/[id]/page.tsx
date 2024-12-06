'use client';
import Chat from '@/components/chat';

interface PageProps { params: { id: string; } }


export default function Page({ params }: PageProps) {
   return (
      <Chat id={params.id} initialMessages={[]} />
    ); 
    }
