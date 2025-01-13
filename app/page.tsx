'use client'

import { Button } from "@/components/ui/button"
import { ChevronRight, BarChart3, MessageSquare, Target, AlertCircle, DollarSign, Brain, TrendingUp, ChartBar, Search, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WarrenQuotesCarousel } from "@/components/warren-quotes-carousel"
import Image from "next/image"
import { AuthRedirect } from "@/components/auth-redirect"
import Typewriter from 'typewriter-effect';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
    name: "Free",
    price: "$0",
    interval: "/month",
    description: "Start your investment journey",
    popular: false,
    features: {
      "AI Advisory": [
        "30 monthly chats with Warren Buffett AI",
        "Basic investment recommendations",
      ],
      "Portfolio Management": [
        "Build your first 20 Punchcard Portfolio",
        "Basic portfolio tracking (up to 5 stocks)",
      ],
      "Market Intelligence": [
        "Basic market data and analysis",
        "Access to fundamental indicator",
      ],
    },
  },
  {
    name: "Premium",
    price: "$4.99",
    interval: "/month",
    description: "For confident wealth builders",
    popular: true,
    features: {
      "Enhanced AI Advisory": [
        "Unlimited AI interactions with Warren Buffett",
        "Chat with multiple AI experts (GPT-4, Claude 3.5 Sonnet)",
        "Multi-agent analysis for deeper insights",
      ],
      "Advanced Portfolio Tools": [
        "Unlimited portfolio tracking",
        "Advanced portfolio insights and analytics",
        "Custom investment strategies",
      ],
      "Premium Market Intelligence": [
        "Real-time market alerts and opportunities",
        "Access to Buffett Newsletter",
        "Deep-dive market analysis reports",
      ],
    },
  },
]

const faqItems = [
  {
    category: "Product",
    items: [
      {
        question: "Why does 20 Punches exist?",
        answer: "We believe that everyone should feel optimistic about their financial future. By bridging the gap between institutional investors and retail investors through our Warren Buffet SmartAgent, we turn anxious millennial investors into confident wealth builders."
      },
      {
        question: "Why Warren Buffet?",
        answer: "Warren Buffett is one of the most successful investors of all time, with a proven track record spanning over 60 years. His investment philosophy focuses on long-term value, fundamental analysis, and avoiding market speculation - principles that have consistently worked through multiple market cycles. By training our AI on Buffett's wisdom, investment letters, and decision-making process, we help retail investors benefit from his time-tested approach to building wealth."
      },
      {
        question: "Why is it called 20 Punches?",
        answer: "The name comes from Warren Buffett's famous investment analogy: \"If you had a punchcard with only 20 punches for a lifetime of investments, you'd think very carefully about each investment decision.\" This concept emphasizes quality over quantity, encouraging investors to focus on their highest-conviction investments. Our platform helps you build this focused, high-conviction portfolio using Buffett's principles."
      }
    ]
  },
  {
    category: "Value Proposition",
    items: [
      {
        question: "How is this different from other AI investment tools?",
        answer: "Unlike generic AI tools, 20 Punches combines Warren Buffett's proven investment philosophy with modern AI capabilities. Our focus is on fundamental analysis and long-term value creation, not market timing or speculation. Every recommendation is validated through multiple AI agents, each trained on different aspects of Buffett's investment approach."
      },
      {
        question: "How does the multi-agent analysis system work?",
        answer: "Our system uses multiple specialized AI agents working together: The Fundamental Analysis Agent examines financial statements and business metrics, the Market Context Agent analyzes industry trends and competitive dynamics, and the Buffett Principles Agent validates all recommendations against Warren's investment criteria. This comprehensive approach ensures thorough analysis from multiple perspectives."
      }
    ]
  },
  {
    category: "Usage & Support",
    items: [
      {
        question: "Do I need to be an experienced investor to use 20 Punches?",
        answer: "Not at all! Our platform is designed for both beginners and experienced investors. The Warren Buffett AI guides you through the investment process, explains concepts in plain language, and helps you learn as you build your portfolio. Start with our free tier to learn the basics and grow from there."
      },
      {
        question: "How accurate are the AI investment recommendations?",
        answer: "Our recommendations are based on rigorous fundamental analysis and Warren Buffett's proven investment principles. Our multi-agent system cross-validates all recommendations, analyzing multiple data points and market signals. However, like all investment decisions, returns are never guaranteed, which is why we focus on long-term value investing principles."
      },
      {
        question: "What happens after I reach my monthly AI interaction limit on the free plan?",
        answer: "You'll maintain access to your portfolio and basic market data, but AI interactions will resume next month. For uninterrupted access and the full power of our multi-agent system, consider upgrading to Premium. Our Premium users typically identify 3x more investment opportunities and achieve 15% higher returns on average."
      },
      {
        question: "Can I cancel my premium subscription anytime?",
        answer: "Yes, you can cancel your premium subscription at any time with no questions asked. Your premium benefits will continue until the end of your billing period. We believe in making it easy for users to control their subscription because we're confident in the value we provide."
      }
    ]
  }
]

const premiumBenefits = [
  {
    stat: "3x",
    title: "More Opportunities",
    description: "More investment opportunities identified vs Free tier"
  },
  {
    stat: "24/7",
    title: "Continuous Monitoring",
    description: "Continuous market monitoring and real-time alerts"
  },
  {
    stat: "15%",
    title: "Better Returns",
    description: "Higher average portfolio returns among Premium users"
  }
]

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <AuthRedirect />
      {/* Center Logo */}
      {/* <header className="flex items-center justify-center py-4">
        <Image
          src="/favicon.svg"
          alt="20Punches Logo"
          width={50}
          height={50}
        />
      </header> */}
      <header className="flex sticky top-0 bg-background p-4 items-center px-2 md:px-2 gap-2 border-b border-gray-200 dark:border-white/20 z-50">
        <div className="flex-1 flex items-center gap-2 pl-4">
          <Image
            src="/favicon.svg"
            alt="Logo"
            width={32}
            height={32}
            className="dark:invert opacity-70"
          />
          <p className="text-2xl font-bold">Punches</p>
        </div>
        <div className="flex items-center pr-4">
          <Link href="/login">
            <Button className="w-full sm:w-auto gap-2">
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 sm:space-y-4">
                <Typewriter
                  options={{
                    strings: ['<span class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent hover:cursor-pointer relative overflow-hidden animate-shine">Think</span> like Warren Buffett.', '<span class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent hover:cursor-pointer relative overflow-hidden animate-shin">Invest</span> like Warren Buffett.'],
                    autoStart: true,
                    loop: true,
                  }}
                />
                <style jsx global>{`
                    .Typewriter {
                      font-size: 3.5rem;
                      font-weight: bold;
                      line-height: 1.2;
                    }
                  `}</style>
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
        <section className="w-full py-12 md:py-16">
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
        <section className="w-full py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
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
        <section className="w-full py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 dark:text-white">How Buffet SmartAgent Works</h2>
            <Image src="/agent-workflow.png" alt="Agent Work" width={1000} height={1000} className="w-full h-auto" />
          </div>
        </section>

        {/* Warren Quotes (Carousel) */}
        <section className="w-full py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 dark:text-white">Warren&apos;s Wisdom</h2>
            <WarrenQuotesCarousel />
          </div>
        </section>

        {/* Pricing */}
        {/* Pricing Section */}
        <section className="w-full py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Choose the plan that best fits your investment journey</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card key={plan.name} className="relative flex flex-col">
                  {plan.popular && (
                    <div className="absolute -top-3 right-4">
                      <span className="px-3 py-1 text-xs font-semibold text-white bg-purple-600 rounded-full">
                        Most popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-2 mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">{plan.interval}</span>
                    </div>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {Object.entries(plan.features).map(([category, features]) => (
                      <div key={category} className="mb-6 last:mb-0">
                        <h3 className="text-lg font-semibold mb-3">{category}</h3>
                        <ul className="space-y-2">
                          {features.map((feature: any) => (
                            <li key={feature} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => window.location.href = '/login'}
                    >
                      Get started
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Benefits */}
        <section className="w-full py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 dark:text-white">
              Why investors choose premium
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {premiumBenefits.map((benefit, i) => (
                <Card key={i} className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-200">
                  <CardHeader>
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-fit mb-4">
                      <span className="text-2xl sm:text-3xl font-bold text-white">{benefit.stat}</span>
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm sm:text-base">{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                Everything you need to know about 20 Punches
              </p>

              <div className="space-y-6 w-full">
                {faqItems.map((category) => (
                  <div key={category.category} className="space-y-4 w-full">
                    <h3 className="text-xl font-semibold dark:text-white">{category.category}</h3>
                    {category.items.map((item) => (
                      <Accordion key={item.question} type="single" collapsible className="w-full">
                        <AccordionItem value={item.question} className="w-full border rounded-lg">
                          <AccordionTrigger className="text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 dark:text-gray-300 px-4 py-3">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="w-full py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                Start Building your wealth today
              </h2>
              <p className="text-md text-gray-600 dark:text-gray-300 mb-8">
                Join thousands of confident investors who are building their future with Warren Buffett&apos;s wisdom
              </p>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}