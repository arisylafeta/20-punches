'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { emailLogin, signup } from "./actions";
import { OAuthButtons } from "./oauth-signin";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Login() {
  const { toast } = useToast()
  const [isLogin, setIsLogin] = useState(true)

  async function handleSubmit(formData: FormData) {
    const action = isLogin ? emailLogin : signup
    const result = await action(formData)
    
    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      })
    } else if (result?.success) {
      toast({
        title: "Success",
        description: result.success,
      })
      // If it's a login success, we don't need to show toast as we'll redirect
      if (!isLogin) {
        setIsLogin(true) // Switch back to login mode after successful signup
      }
    }
  }

  const formAction = async (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    handleSubmit(formData)
  }

  return (
    <section className="h-[calc(100vh-57px)] flex justify-center items-center">
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 dark:text-white">Welcome to 20Punches</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Sign in to your account or create a new one to start investing like Warren Buffett</p>
        </div>
        <Card className="mx-auto w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Enter your email below to login to your account' : 'Create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={formAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  minLength={6}
                  name="password"
                  id="password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isLogin ? 'Login' : 'Sign Up'}
              </Button>
            </form>
            <div className="text-center text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="underline hover:text-primary transition-colors"
                type="button"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </div>
            <OAuthButtons />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}