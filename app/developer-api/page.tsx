import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ApiDocsContent } from "@/components/developer-api/api-docs-content";
import { Code2, Terminal } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer API Documentation | De’socialPlug',
  description: 'Learn how to programmatically access and purchase logs using the De’socialPlug API.',
};

export default function DeveloperApiPublicPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="relative">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent -z-10" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-purple-500/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <header className="mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">
              <Terminal className="w-3 h-3" /> API Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              De’socialPlug <span className="text-blue-500">Developer API</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Powerful endpoints to integrate De’socialPlug's inventory directly into your applications, panels, and tools.
            </p>
          </header>

          <ApiDocsContent />

          <section className="mt-20 p-8 md:p-12 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Code2 className="w-40 h-40" />
            </div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-bold">Ready to start building?</h2>
              <p className="text-slate-400 max-w-xl text-lg">
                Log in to your dashboard to generate your unique API key and start making requests today.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href="/login"
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-500/25"
                >
                  Get API Key
                </a>
                <a
                  href="/register"
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all"
                >
                  Create Account
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
