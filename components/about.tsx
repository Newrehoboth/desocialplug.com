"use client";

import React from "react";
import Image from "next/image";

const AboutSection = () => {
  return (
    <section className="w-full bg-background py-14 md:py-24 px-4 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Left: Text */}
        <div className="w-full md:w-1/2 text-foreground text-center md:text-left flex flex-col justify-center items-center md:items-start">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 text-foreground leading-tight">
            About <span className="text-blue-600 dark:text-blue-400">De’socialPlug</span>
          </h2>
          <p className="text-base sm:text-lg leading-relaxed mb-4 text-muted-foreground max-w-lg">
            At De’socialPlug, we make it easy and affordable to own verified
            social media accounts that help you grow instantly. We’re a trusted
            online marketplace specializing in cheap, pre-owned, and verified
            Instagram, TikTok, Twitter, and YouTube accounts — all verified for
            authenticity, security, and performance.
          </p>
          <p className="text-base sm:text-lg leading-relaxed mb-4 text-muted-foreground max-w-lg">
            Our goal is simple: to help creators, influencers, and businesses
            skip the struggle of starting from zero. With De’socialPlug, you get
            instant access to accounts ready to build, brand, and grow — all at
            the best prices online.
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-lg">
            We combine trust, speed, and transparency to give you a smooth, safe
            buying experience. Whether you’re launching a new brand, managing
            multiple pages, or boosting your online presence, De’socialPlug is
            your go-to source for real, verified accounts..
          </p>
        </div>

        {/* Right: Image */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <Image
            src="/image/about.png"
            alt="De’socialPlug"
            className="rounded-2xl w-full max-w-md h-auto object-cover"
            height={500}
            width={500}
            priority
          />
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
