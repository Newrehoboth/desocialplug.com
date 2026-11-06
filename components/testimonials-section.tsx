export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "De’socialPlug saved me weeks of work. I bought an Instagram account and started growing my business immediately. Everything was smooth and fast.",
      name: "Chinedu O.",
      location: "Lagos",
      initial: "C",
    },
    {
      quote:
        "The instant delivery is real! Within minutes of payment, I had my TikTok account details. Their support on WhatsApp is also very helpful.",
      name: "Aisha B.",
      location: "Abuja",
      initial: "A",
    },
    {
      quote:
        "As a reseller, I make extra income without stress. De’socialPlug' reseller system really works, and I didn't need to start with capital.",
      name: "Oluwaseun A.",
      location: "Ibadan",
      initial: "O",
    },
    {
      quote:
        "I placed a pre-order even when stock was 0, and my account was delivered automatically once restocked. That feature is a game changer.",
      name: "Fatima K.",
      location: "Kano",
      initial: "F",
    },
    {
      quote:
        "Honestly the cheapest place I've seen to buy verified accounts. I've tried other platforms but De’socialPlug gives the best value for money.",
      name: "Emeka N.",
      location: "Port Harcourt",
      initial: "E",
    },
  ]

  return (
    <section className="bg-[#1e1b4b] py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
              Testimonial
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="rounded-2xl bg-[#2d2a5e] p-6 text-white">
                <div className="mb-4 text-2xl">"</div>
                <p className="mb-6 text-sm leading-relaxed text-white/90">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {testimonial.initial}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-white/70">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
