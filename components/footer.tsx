"use client"

import { usePathname, useRouter } from "next/navigation"
import { Music, Send, MessageCircle } from "lucide-react"

export function Footer() {
  const pathname = usePathname()
  const router = useRouter()

  const handleFaqClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()

    if (pathname === "/") {
      // Already on homepage — smooth scroll to FAQ
      const faqSection = document.querySelector("#faq")
      if (faqSection) faqSection.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      // On another page — navigate to homepage with #faq
      router.push("/#faq")
    }
  }

  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Top Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-medium mb-6">
              © 2025 De’socialPlug LTD. All rights reserved.
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col items-center justify-center text-sm text-muted-foreground gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
            <a href="/policy" className="hover:text-foreground transition-colors text-center w-full sm:w-auto">
              Privacy Policy
            </a>
            <a href="/terms-and-conditions" className="hover:text-foreground transition-colors text-center w-full sm:w-auto">
              Terms and Conditions
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors text-center w-full sm:w-auto">
              Terms of Use
            </a>
            <a href="/rules" className="hover:text-foreground transition-colors text-center w-full sm:w-auto">
              Rules
            </a>

            {/* FAQ Link — same behavior as Header */}
            <a
              href="/#faq"
              onClick={handleFaqClick}
              className="hover:text-foreground transition-colors text-center w-full sm:w-auto cursor-pointer"
            >
              FAQs
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
