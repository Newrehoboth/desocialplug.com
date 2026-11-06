"use client";

import { useEffect, useState } from "react";

export default function ActivationOverlay() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const isActive =
      process.env.NEXT_PUBLIC_SITE_ACTIVE?.toLowerCase() === "true";
    setActive(isActive);

    document.body.style.overflow = isActive ? "auto" : "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (active) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 text-white text-center p-6 backdrop-blur-sm">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
       
      </h1>
      <p className="text-base md:text-lg max-w-md">
       
      </p>
    </div>
  );
}
