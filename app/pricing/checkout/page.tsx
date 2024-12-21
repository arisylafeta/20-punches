'use client'

import CheckoutPage from "@/components/CheckoutPage"
import { Elements } from "@stripe/react-stripe-js"
import  getStripe  from "@/utils/stripe"
import convertToSubcurrency  from "@/utils/convertToSubcurrency"


export default function Checkout() {
    const stripePromise = getStripe()
    const amount = 4.99;

    return (
        <>
            <Elements 
            stripe={stripePromise}
            options= {{
                mode: "payment",
                amount: convertToSubcurrency(amount),
                currency: "usd"

            }}>
                <CheckoutPage amount={amount} />
            </Elements>
        </>
    )
}
