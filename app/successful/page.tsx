'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessfulPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-xl animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Purchase Successful!
        </h1>

        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Your purchase has been completed successfully. You can view your purchased credentials and accounts directly in your dashboard or purchases page.
        </p>

        <div className="space-y-3">
          <Link href="/dashboard" className="block w-full">
            <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/purchases" className="block w-full">
            <Button variant="outline" className="w-full h-11 rounded-xl font-medium text-sm">
              View My Purchases
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
