// components/Seo.tsx
import Head from "next/head"
import React from "react"

type Props = {
  title: string
  description: string
  canonical?: string
  url?: string
  image?: string
  type?: "website" | "article"
  extraMeta?: React.ReactNode
}

export function Seo({
  title,
  description,
  canonical,
  url,
  image,
  type = "website",
  extraMeta,
}: Props) {
  const siteName = "Your Site Name" // <-- edit this
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {extraMeta}
    </Head>
  )
}
