"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Key, Copy, RefreshCw, Check, Code2, Layers } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AuthGuard from "@/components/AuthGuard";
import { ApiDocsContent } from "@/components/developer-api/api-docs-content";

export default function DeveloperApiPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/user/keys")
      .then(res => res.json())
      .then(data => {
        setApiKey(data.apiKey);
        setLoading(false);
      });
  }, []);

  const generateKey = async () => {
    setGenerating(true);
    const res = await fetch("/api/user/keys", { method: "POST" });
    const data = await res.json();
    setApiKey(data.apiKey);
    setGenerating(false);
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 md:space-y-8 min-h-screen bg-background text-foreground mt-4">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Developer API
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your authentication keys and connect your application programmatically.</p>
      </header>

      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Key className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold"> API Key</h2>
          </div>
          <button
            onClick={generateKey}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            {apiKey ? "Regenerate Key" : "Generate Key"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-muted border border-border rounded-xl p-3 md:p-4">
          <code className="flex-1 text-foreground font-mono text-xs md:text-sm overflow-x-auto whitespace-nowrap py-1">
            {loading ? "Fetching..." : apiKey || "No API key generated yet."}
          </code>
          {apiKey && (
            <button onClick={copyToClipboard} className="text-muted-foreground hover:text-foreground transition-colors p-2 bg-background border border-border rounded flex items-center justify-center shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground mt-4">Do not share this key with anyone. It provides full access to your wallet for purchases via the API.</p>
      </div>

      <div className="pt-8 border-t border-border/50">
        <ApiDocsContent />
      </div>
    </div>
  );
}
