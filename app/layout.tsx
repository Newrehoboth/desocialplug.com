import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { MaintenanceCountdown } from './components/MaintenanceCountdown';
import { MaintenanceGuard } from './components/MaintenanceGuard';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Suspense } from 'react';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ThemeProvider } from '@/components/theme-provider';

// ✅ Global Viewport Configuration for iOS Safe Area Support
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
};

// ✅ Global SEO Metadata
export const metadata: Metadata = {
  title: {
    default:
      'De’socialPlug - The #1 Marketplace for Pre-Owned & Verified Social Media Accounts',
    template: '%s | De’socialPlug',
  },
  description:
    'Buy verified Instagram, TikTok, Twitter and YouTube accounts instantly with De’socialPlug — trusted, affordable, and secure.',
  keywords: [
    'De’socialPlug',
    'buy social media accounts',
    'verified Instagram accounts',
    'TikTok accounts',
    'YouTube accounts',
    'Twitter accounts',
    'safe account marketplace',
  ],
  authors: [{ name: 'De’socialPlug LTD', url: 'https://desocialplug.com' }],
  creator: 'De’socialPlug LTD',
  publisher: 'De’socialPlug LTD',
  metadataBase: new URL('https://desocialplug.com'),

  openGraph: {
    title:
      'De’socialPlug - The #1 Marketplace for Pre-Owned & Verified Social Media Accounts',
    description:
      'Buy verified Instagram, TikTok, Twitter and YouTube accounts instantly with De’socialPlug — trusted, affordable, and secure.',
    url: 'https://desocialplug.com',
    siteName: 'De’socialPlug',
    images: [
      {
        url: '/og-image.jpg', // put your OG image inside /public
        width: 1200,
        height: 630,
        alt: 'De’socialPlug Marketplace Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title:
      'De’socialPlug - The #1 Marketplace for Pre-Owned & Verified Social Media Accounts',
    description:
      'Buy verified Instagram, TikTok, Twitter and YouTube accounts instantly with De’socialPlug — trusted, affordable, and secure.',
    images: ['/og-image.jpg'],
    creator: '@De’socialPlug',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: 'https://desocialplug.com',
  },
  icons: {
    icon: '/favicon.ico',
  },

  // ✅ Add Google site verification tag here
  verification: {
    google: 'hSku1hqF2AFtvEFoHKdZr0MvYfRL2vTVCrXB65Qrh44',
  },
};

// ✅ Root Layout Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google verification */}
        <meta
          name="google-site-verification"
          content="hSku1hqF2AFtvEFoHKdZr0MvYfRL2vTVCrXB65Qrh44"
        />
        
        {/* TikTok Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
                var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
                ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

                ttq.load('D738JJ3C77UCP36T90B0');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
        
        {/* Apitiny Script */}
        <script
          src="https://cdn.apitiny.net/scripts/v2.0/main.js"
          data-site-id="69934e6d8a5300329524ac7c"
          data-test-mode="false"
          async
        ></script>
      </head>

      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <CurrencyProvider>
            <MaintenanceGuard>
              <Suspense fallback={null}>{children}</Suspense>
            </MaintenanceGuard>
            <Analytics />

            {/* Apitiny Script */}
            <script
              src="https://cdn.apitiny.net/scripts/v2.0/main.js"
              data-site-id="69934e6d8a5300329524ac7c"
              data-test-mode="false"
              async
            ></script>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}