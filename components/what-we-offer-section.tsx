import { CheckCircle2, Zap, LifeBuoy, DollarSign } from "lucide-react"
import { ArrowRight } from "lucide-react"

export function WhatWeOfferSection() {
  return (
    <section className="bg-muted/30 py-12 md:py-20 lg:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-background p-8 shadow-lg md:p-12 lg:p-16">
          <div className="mb-6">
            <a
              
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Features <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mb-12 lg:mb-16 lg:flex lg:items-start lg:justify-between lg:gap-12">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:max-w-md">
              What We Offer
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg lg:mt-0 lg:max-w-xl">
              Because it's De’socialPlug that provides you with everything you need to have a wonderful social media
              trading experiences
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
            <div className="flex flex-col">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">1. Verified Cheap & Pre-Owned Accounts</h3>
              <p className="text-pretty text-muted-foreground">
                Access genuine, ready-made social media accounts across Instagram, TikTok, Twitter (X), YouTube, and
                Facebook —- all verified and security-checked.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">2. Instant Delivery</h3>
              <p className="text-pretty text-muted-foreground">
                Get your account details securely and immediately after payment confirmation. No delays, no stress.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <LifeBuoy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">3. Secure & Reliable Support</h3>
              <p className="text-pretty text-muted-foreground">
                With 24/7 support available via website tickets, chat widget, WhatsApp, and Telegram, you're never
                alone.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">4. Referral System – Earn Lifetime Commission</h3>
              <p className="text-pretty text-muted-foreground">
                Turn your network into steady income!
Invite friends to join De’socialPlug using your unique referral link and earn 3% commission on every deposit they make — for life. No limits, no stress — the more people you bring in, the more money keeps rolling in!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
