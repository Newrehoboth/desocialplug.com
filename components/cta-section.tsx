import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-[#1e1b4b] px-8 py-12 md:px-12 md:py-16">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row lg:text-left">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Create an Account Today.</h2>
              <p className="mt-2 text-white/80">Contact us with any query or any idea.</p>
            </div>
<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-shrink-0">
  <Link href="/login" className="w-full sm:w-auto">
    <Button
      size="lg"
      variant="outline"
      className="h-12 w-full rounded-full border-2 border-white bg-transparent text-base font-semibold text-white hover:bg-white/10 sm:h-12 sm:px-8"
    >
      Login
    </Button>
  </Link>

  <Link href="/register" className="w-full sm:w-auto">
    <Button
      size="lg"
      className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 sm:h-12 sm:px-8"
    >
      Signup
    </Button>
  </Link>
</div>

          </div>
        </div>
      </div>
    </section>
  )
}
