'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from "@/hooks/use-toast"

export default function EmailForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setEmail(profile.email || '');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/account/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update email');
      }

      toast({
        title: "Success",
        description: "Your email has been updated. Please check your inbox for verification.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>Please enter your email address.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid gap-1">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || isLoading}
              className="w-full p-3 rounded-md border"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Updating...' : 'Update Email'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
