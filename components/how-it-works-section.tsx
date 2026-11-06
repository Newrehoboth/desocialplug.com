import { Card } from "@/components/ui/card"

export function HowItWorksSection() {
  return (
    <section className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          A Guide to How It Works
        </h2>
        <p className="mb-12 text-center text-base text-muted-foreground md:text-lg">
          Simple steps to get started with De’socialPlug
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Step 1 */}
          <Card className="rounded-3xl border-0 bg-[#f0f0ff] dark:bg-muted/20 p-8 text-center shadow-sm">
            <div className="mb-4 text-4xl font-bold text-primary">1</div>
            <h3 className="mb-3 text-xl font-bold text-foreground">Sign Up</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Create your De’socialPlug account in just a few seconds to get started.
            </p>
          </Card>

          {/* Step 2 - Highlighted */}
          <Card className="rounded-3xl border-0 bg-primary p-8 text-center shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-primary">
              2
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Browse & Select</h3>
            <p className="text-sm leading-relaxed text-white/90">
              Explore our marketplace and pick the social media account that matches your needs.
            </p>
          </Card>

          {/* Step 3 */}
          <Card className="rounded-3xl border-0 bg-[#f0f0ff] dark:bg-muted/20 p-8 text-center shadow-sm">
            <div className="mb-4 text-4xl font-bold text-primary">3</div>
            <h3 className="mb-3 text-xl font-bold text-foreground">Purchase Securely</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Complete your order using our safe and verified payment options.
            </p>
          </Card>

          {/* Step 4 */}
          <Card className="rounded-3xl border-0 bg-[#f0f0ff] dark:bg-muted/20 p-8 text-center shadow-sm">
            <div className="mb-4 text-4xl font-bold text-primary">4</div>
            <h3 className="mb-3 text-xl font-bold text-foreground">Instant Delivery</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Receive your account details immediately after payment. Fast, secure, and hassle-free.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
