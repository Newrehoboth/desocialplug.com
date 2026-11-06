import { DollarSign, Users, Cpu, Clock } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="bg-muted/30 py-12 md:py-20 lg:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-background p-8 shadow-lg md:p-12 lg:p-16">
          <div className="mb-12 text-center lg:mb-16">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              What Sets Us Apart
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Discover the unique advantages that make De’socialPlug the preferred choice for social media accounts
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                <DollarSign className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">1. Cheapest With the Best Value</h3>
              <p className="text-pretty text-muted-foreground">
                We offer the most affordable accounts in the market while maintaining strict verification and security.
              </p>
            </div>

            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">2. Seller System – Turn Your Accounts into Opportunities</h3>
              <p className="text-pretty text-muted-foreground">
                Become a verified merchant and start selling instantly! Connect with real buyers and showcase your accounts to a wide, active audience. Whether you’re an individual seller or a small business owner, our marketplace helps you grow, earn, and get noticed.
              </p>
            </div>

         <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
    <Cpu className="h-8 w-8 text-primary-foreground" />
  </div>
  <h3 className="mb-3 text-xl font-bold text-foreground">
    3. Child Panel System – Build Your Own Branded Panel
  </h3>
  <p className="text-pretty text-muted-foreground">
    Run your own Social Media Marketplace platform effortlessly with our
     white-label solution. Manage orders, customers, and earnings from your own branded
    dashboard powered by our secure infrastructure — while we handle the backend.  
    
    • White-label branding • Customer management • Order tracking • Revenue analytics  
       
  </p>
</div>


            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">4. API System – Power Up with Automation</h3>
              <p className="text-pretty text-muted-foreground">
               Integrate De’socialPlug services directly into your app or website with our powerful REST API. Automate orders, track activity, and sync data in real time — all with zero hassle.
	•	RESTful API endpoints
	•	Real-time order updates
	•	Webhook notifications
	•	Comprehensive documentation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
