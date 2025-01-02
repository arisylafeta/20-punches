'use client'

import { Button } from "@/components/ui/button"
import { ChevronRight, BarChart3, MessageSquare, Target, AlertCircle, DollarSign, Brain, TrendingUp, ChartBar, Search, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WarrenQuotesCarousel } from "@/components/warren-quotes-carousel"
import Image from "next/image"

const features = [
  {
    title: "Track Your Trades",
    description: "Keep track of up to 20 positions in your portfolio with real-time data and beautiful charts.",
    icon: BarChart3
  },
  {
    title: "AI-Powered Insights",
    description: "Get personalized trading advice from Warren, your AI investment assistant.",
    icon: MessageSquare
  },
  {
    title: "Focus on Quality",
    description: "Follow Warren Buffett's principle of concentrated investing with our 20-punch card system.",
    icon: Target
  }
]
const problemItems = [
  {
    icon: AlertCircle,
    title: "Limited Time",
    description: "You have a life outside of investing, but keeping up with market trends and news can be overwhelming. It's hard to find the time to properly analyze stocks and make informed decisions."
  },
  {
    icon: DollarSign,
    title: "Fear of Loss",
    description: "The fear of losing money can be paralyzing. It can make you hesitant to invest or make a move, even when it's the right decision. You want to avoid making a mistake that could cost you money."
  },
  {
    icon: Brain,
    title: "Information Overload",
    description: "There is so much information available about the stock market, but it can be hard to sift through it all. You want to make informed decisions, but it's easy to get overwhelmed by all the data."
  }
]

const solutionItems = [
  {
    icon: TrendingUp,
    title: "No Time? No Problem.",
    description: "Our multi-agent system works 24/7 analyzing market data and news, doing the heavy lifting that institutional investors do. You'll get actionable insights that help you make informed decisions, even when you don't have the time."
  },
  {
    icon: ChartBar,
    title: "Easy Backtesting",
    description: "Backtesting is a powerful tool that helps you see how a strategy would have performed in the past. It can help you make more informed decisions, but it can be a tedious process. We make it easy, so you can focus on what matters most."
  },
  {
    icon: Search,
    title: "Cut Through the Noise",
    description: "Access real-time financial information, news, and market data. Learn from decades of investment wisdom, and get actionable insights that will help you make informed decisions."
  }]

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for trying out Warren's wisdom",
    price: "$0",
    interval: "forever",
    features: [
      "Add and track your investments",
      "Basic Portfolio Management",
      "10 messages per day",
      "Real time News",
      "Advanced Charts"
    ]
  },
  {
    name: "Pro",
    description: "For serious value investors",
    price: "$4.99",
    interval: "per month",
    features: [
      "Everything in Hobby",
      "Advanced Portfolio Management",
      "Unlimited messages everyday",
      "Access to GPT 4o, Claude 3.5",
      "Real time financial metrics",
    ]
  }
]
const faqItems = [
  {
    question: "What is 20Punches?",
    answer: "20Punches is an AI-powered investment platform that helps you invest like Warren Buffett. We analyze stocks using value investing principles and provide clear, actionable insights."
  },
  {
    question: "How does the AI analysis work?",
    answer: "Our AI analyzes company financials, market trends, and business fundamentals using Warren Buffett's investment principles. It provides insights in plain English, making complex investment decisions easier to understand."
  },
  {
    question: "Is my investment data secure?",
    answer: "Yes, we take security seriously. All data is encrypted, and we use industry-standard security practices to protect your information. We never share your data with third parties."
  },
  {
    question: "Can I try it for free?",
    answer: "Yes! Our Starter plan is completely free and includes basic features to help you get started with value investing. You can upgrade to Pro anytime for advanced features."
  },
  {
    question: "What makes 20Punches different?",
    answer: "Unlike other platforms, we focus specifically on value investing using Warren Buffett's principles. Our AI is trained on decades of investment wisdom and provides clear, actionable insights."
  }
]

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Center Logo */}
      {/* <header className="flex items-center justify-center py-4">
        <Image
          src="/favicon.svg"
          alt="20Punches Logo"
          width={50}
          height={50}
        />
      </header> */}

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  <span 
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent hover:cursor-pointer relative overflow-hidden animate-shine"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {isHovered ? 'Invest' : 'Think'} like Warren Buffett
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-base sm:text-lg text-gray-500 dark:text-gray-400">
                  We turn financially anxious millennial investors into confident wealth builders.
                </p>
              </div>
              <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
                <Link href="/login">
                  <Button className="w-full sm:w-auto gap-2">
                    Get Started
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Image of Product */}
        Demo Here

        {/* Features Section */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <Card key={i} className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-200">
                  <CardHeader>
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-fit mb-4">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm sm:text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Problem and Solution section */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900 dark:text-white">Why 20Punches?</h2>
            <Tabs defaultValue="problem" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto mb-8 grid-cols-2">
                <TabsTrigger value="problem">🤔 Problem</TabsTrigger>
                <TabsTrigger value="solution">✨ Solution</TabsTrigger>
              </TabsList>
              <TabsContent value="problem" className="space-y-4 sm:space-y-6">
                {problemItems.map((item, i) => (
                  <Card key={i} className="flex flex-col sm:flex-row overflow-hidden">
                    <div className="flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-500 to-purple-500 sm:w-auto">
                      <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="p-4 sm:p-6 flex-1">
                      <CardTitle className="mb-2 text-lg sm:text-xl">{item.title}</CardTitle>
                      <CardDescription className="text-sm sm:text-base">{item.description}</CardDescription>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="solution" className="space-y-4 sm:space-y-6">
                {solutionItems.map((item, i) => (
                  <Card key={i} className="flex flex-col sm:flex-row overflow-hidden">
                    <div className="flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-green-500 to-teal-500 sm:w-auto">
                      <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="p-4 sm:p-6 flex-1">
                      <CardTitle className="mb-2 text-lg sm:text-xl">{item.title}</CardTitle>
                      <CardDescription className="text-sm sm:text-base">{item.description}</CardDescription>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* How Warren Works */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 dark:text-white">How BuffetAgent Works</h2>
            <Image src="/agent-workflow.png" alt="Agent Work" width={1000} height={1000} className="w-full h-auto" />
          </div>
        </section>

        {/* Warren Quotes (Carousel) */}
        <section className="w-full py-6 sm:py-8 md:py-12 lg:py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-2 sm:px-4 md:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 dark:text-white">Warren&lsquo;s Wisdom</h2>
            <WarrenQuotesCarousel />
          </div>
        </section>

        {/* Pricing */}
                {/* Pricing Section */}
                <section className="w-full py-6 sm:py-8 md:py-12 lg:py-16">
          <div className="container mx-auto px-2 sm:px-4 md:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 sm:mb-12">Choose the plan that best fits your investment journey</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card key={plan.name} className="relative flex flex-col w-full">
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">{plan.interval}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Link href="/login">
                      <Button className="w-full" variant={plan.name === "Pro" ? "default" : "outline"}>
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full py-6 sm:py-8 md:py-12 lg:py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-2 sm:px-4 md:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 dark:text-white">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqItems.map((item, i) => (
                  <Card key={i} className="overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                        <h3 className="text-lg font-medium">{item.question}</h3>
                        <div className="transform transition-transform duration-200 group-open:rotate-180">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </summary>
                      <div className="p-4 pt-0">
                        <p className="text-gray-500 dark:text-gray-400">{item.answer}</p>
                      </div>
                    </details>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}