import AboutSection from '@/components/about';
import { CTASection } from '@/components/cta-section';
import { FAQSection } from '@/components/faq-section';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { WhatWeOfferSection } from '@/components/what-we-offer-section';
import RedirectToDashboardIfLoggedIn from '@/components/RedirectToDashboardIfLoggedIn';
import type { Metadata } from 'next';
// import ActivationOverlay from "@/components/ActivationOverlay";

export const metadata: Metadata = {
  title: 'No.1 Social Media Accounts Marketplace | De’socialPlug',
  description:
    'De’socialPlug LTD helps you create and manage your professional digital identity. Showcase your skills, connect with opportunities, and grow your online presence.',
  keywords: [
    'De’socialPlug',
    'digital identity',
    'online portfolio',
    'professional profiles',
    'build profile',
    'networking',
  ],
  openGraph: {
    title: 'De’socialPlug LTD | Build Your Digital Identity',
    description:
      'De’socialPlug LTD helps you create and manage your professional digital identity. Showcase your skills, connect with opportunities, and grow your online presence.',
    url: 'https://desocialplug.com',
    siteName: 'De’socialPlug LTD',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'De’socialPlug LTD | Build Your Digital Identitys',
    description:
      'Showcase your skills, connect with opportunities, and grow your online presence with De’socialPlug LTD.',
    creator: '@yourhandle',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth relative">
      <RedirectToDashboardIfLoggedIn />
      <Header />
      <main>
        <section id="home">
          <HeroSection />
        </section>

        <section id="about">
          <AboutSection />
        </section>

        <section id="features">
          <WhatWeOfferSection />
        </section>

        <section>
          <FeaturesSection />
        </section>

        <section id="how-it-works">
          <HowItWorksSection />
        </section>

        <section id="faq">
          <FAQSection />
        </section>

        <CTASection />
      </main>
      <Footer />
      {/* <ActivationOverlay /> */}
    </div>
  );
}
