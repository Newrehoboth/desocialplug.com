import React from "react";
import { Terminal, Key, ShoppingCart, Info, Code2, Globe, ArrowRight, Layers, FileJson } from "lucide-react";

export function ApiDocsContent() {
  return (
    <div className="space-y-12 pb-12">
      {/* Intro Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Getting Started</h2>
        </div>
        <p className="text-muted-foreground max-w-3xl leading-relaxed italic">
          Welcome to the De’socialPlug Developer API. Our API allows you to programmatically browse available logs and purchase them using your wallet balance. All requests must be authenticated using your unique API key.
        </p>
      </section>

      {/* Authentication */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Key className="w-5 h-5 text-purple-500" />
          <h3 className="text-xl font-semibold uppercase tracking-wider text-sm text-purple-500">Authentication</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Include your API key in the request headers for all API calls.
        </p>
        <div className="bg-muted p-4 rounded-xl font-mono text-sm overflow-x-auto border border-border/50">
          <span className="text-blue-500">x-api-key</span>: <span className="text-green-500">YOUR_API_KEY</span>
        </div>
      </section>

      {/* Step 1: Fetch Logs */}
      <section className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Fetch Available Logs</h3>
            <p className="text-muted-foreground text-sm">Retrieve a list of all currently available logs grouped by platform and subcategory.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-muted/50 p-5 rounded-2xl border border-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest">
                <Terminal className="w-3 h-3" /> Endpoint
              </div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-[10px] font-bold">GET</span>
                <span className="text-foreground">/api/public/logs</span>
              </div>
            </div>

            <div className="bg-muted/50 p-5 rounded-2xl border border-border space-y-4 text-sm font-light leading-relaxed">
              <h4 className="font-semibold text-foreground italic">Query Parameters</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <code className="text-blue-500 font-bold">platform</code>
                  <span className="text-muted-foreground">(Optional) Filter by platform (e.g., Facebook, Instagram).</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-blue-500 font-bold">subcategory</code>
                  <span className="text-muted-foreground">(Optional) Filter by subcategory (e.g., Random, Real Active).</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl p-6 shadow-xl border border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Code2 className="w-12 h-12 text-blue-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> cURL Example
            </h4>
            <pre className="text-[11px] md:text-xs text-blue-300 font-mono whitespace-pre-wrap">
              {`curl -X GET "https://desocialplug.com/api/public/logs?platform=Instagram" \\
  -H "x-api-key: YOUR_API_KEY"`}
            </pre>
          </div>
        </div>
      </section>

      {/* Step 2: Data Structure */}
      <section className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">2</div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Understanding the Structure</h3>
            <p className="text-muted-foreground text-sm">The API returns a nested object grouped by platform and subcategory.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-muted/50 px-6 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileJson className="w-4 h-4" /> JSON Response Schema
            </span>
          </div>
          <div className="p-6">
            <pre className="text-[11px] md:text-sm font-mono text-muted-foreground overflow-x-auto whitespace-pre">
              {`{
  "instagram": {
    "High Quality": [
      {
        "itemId": "67b09935...",
        "name": "Instagram Aged Account",
        "price": 500,
        "availableLogsCount": 15,
        "description": "2018-2020 Accounts",
        "vpnType": "USA IP"
      }
    ]
  }
}`}
            </pre>
            <div className="mt-6 grid sm:grid-cols-2 gap-4 text-xs italic">
              <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <strong className="text-blue-500 block mb-1">itemId</strong>
                Use this ID when making a purchase. It uniquely identifies the account listing.
              </div>
              <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                <strong className="text-green-600 block mb-1">availableLogsCount</strong>
                The current stock volume available for immediate purchase.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Purchase */}
      <section className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">3</div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Purchase Logs</h3>
            <p className="text-muted-foreground text-sm">Execute a purchase by providing the item ID and desired quantity.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-muted/50 p-5 rounded-2xl border border-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-500 uppercase tracking-widest">
                <ShoppingCart className="w-3 h-3" /> Endpoint
              </div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded text-[10px] font-bold">POST</span>
                <span className="text-foreground">/api/public/purchase</span>
              </div>
            </div>

            <div className="bg-muted/50 p-5 rounded-2xl border border-border space-y-4 text-sm font-light leading-relaxed">
              <h4 className="font-semibold text-foreground italic">Request Body (JSON)</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <code className="text-purple-500 font-bold">accountId</code>
                  <span className="text-muted-foreground">The <code className="text-[10px] bg-muted px-1 rounded">itemId</code> from the logs list.</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-purple-500 font-bold">quantity</code>
                  <span className="text-muted-foreground">Number of logs to purchase.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl p-6 shadow-xl border border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <ShoppingCart className="w-12 h-12 text-purple-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Purchase Example
            </h4>
            <pre className="text-[11px] md:text-xs text-purple-300 font-mono whitespace-pre-wrap">
              {`curl -X POST "https://desocialplug.com/api/public/purchase" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "accountId": "67b09935...",
    "quantity": 5
  }'`}
            </pre>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3 text-amber-600">
          <Info className="w-5 h-5" />
          <h4 className="font-bold uppercase tracking-tight text-sm">Important Considerations</h4>
        </div>
        <ul className="space-y-2 text-sm text-amber-700/80 italic">
          <li>• Ensure your wallet balance is sufficient for the total cost (price * quantity).</li>
          <li>• Purchased logs are returned immediately in the response body.</li>
          <li>• API keys rotate if you regenerate them in the dashboard; old keys will expire immediately.</li>
        </ul>
      </section>
    </div>
  );
}
