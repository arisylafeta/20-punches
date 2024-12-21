'use client'

import { useEffect } from "react"
import CheckoutPage from "@/components/CheckoutPage"
import { Elements } from "@stripe/react-stripe-js"
import getStripe from "@/utils/stripe"
import convertToSubcurrency from "@/utils/convertToSubcurrency"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams, useRouter } from "next/navigation"
import { Check } from "lucide-react"

const PRICING_PLANS = {
    basic: {
        name: "Basic Plan",
        price: 4.99,
        priceId: "price_XXXXX", // Replace with your Stripe price ID
        features: [
            "Lorem ipsum dolor sit amet",
            "Consectetur adipiscing elit",
            "Sed do eiusmod tempor",
            "Ut labore et dolore magna"
        ]
    },
    premium: {
        name: "Premium Plan",
        price: 9.99,
        priceId: "price_1QYX3NBKnjmVdlAsf964nnzM", // Replace with your Stripe price ID
        features: [
            "Everything in Basic, plus:",
            "Incididunt ut labore et dolore",
            "Magna aliqua ut enim ad minim",
            "Quis nostrud exercitation ullamco"
        ]
    }
}

export default function PricingPage() {
    const stripePromise = getStripe()
    const { toast } = useToast()
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const redirectStatus = searchParams.get('redirect_status')
        
        if (redirectStatus === 'succeeded') {
            toast({
                title: "Subscription Active",
                description: (
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" /> Your subscription is now active!
                    </div>
                ),
            })
            router.push('/pricing')
        }
    }, [searchParams, toast, router])

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                    Choose Your Perfect Plan
                </h2>
                <p className="mt-4 text-xl text-muted-foreground">
                    Simple, transparent pricing that grows with you
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
                {/* Basic Plan */}
                <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
                    <div className="px-6 py-8">
                        <h3 className="text-2xl font-bold text-card-foreground">{PRICING_PLANS.basic.name}</h3>
                        <div className="mt-4 text-muted-foreground">
                            <ul className="space-y-3">
                                {PRICING_PLANS.basic.features.map((feature, index) => (
                                    <li key={index}>• {feature}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-8">
                            <span className="text-4xl font-bold text-card-foreground">${PRICING_PLANS.basic.price}</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                    </div>
                </div>

                {/* Premium Plan */}
                <div className="bg-card rounded-lg shadow-lg overflow-hidden border-2 border-primary">
                    <div className="px-6 py-8">
                        <h3 className="text-2xl font-bold text-card-foreground">{PRICING_PLANS.premium.name}</h3>
                        <div className="mt-4 text-muted-foreground">
                            <ul className="space-y-3">
                                {PRICING_PLANS.premium.features.map((feature, index) => (
                                    <li key={index}>• {feature}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-8">
                            <span className="text-4xl font-bold text-card-foreground">${PRICING_PLANS.premium.price}</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 max-w-3xl mx-auto border border-border">
                <Elements 
                    stripe={stripePromise}
                    options={{
                        mode: "subscription",
                        amount: convertToSubcurrency(PRICING_PLANS.basic.price),
                        currency: "usd"
                    }}>
                    <CheckoutPage amount={PRICING_PLANS.premium.price} priceId={PRICING_PLANS.premium.priceId} />
                </Elements>
            </div>
        </div>
    )
}
