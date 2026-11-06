// types/tiktok.d.ts
interface TikTokPixel {
  track(event: string, data?: any): void;
  page(): void;
  [key: string]: any;
}

interface Window {
  ttq?: TikTokPixel;
}