"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Shield, Zap, Globe, Cpu, Settings, Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2, ChevronDown, Copy, Check, Clock, History as HistoryIcon } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ExistingPanel {
  exists: boolean;
  domain?: string;
  adminName?: string;
  status?: 'pending' | 'active' | 'rejected' | 'cancelled' | 'expired';
  panelId?: string;
  expires_at?: string;
  auto_renew?: boolean;
  subscription_price?: number;
  history?: any[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400 animate-in fade-in duration-200" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function CountdownTimer({ expiryDate }: { expiryDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(expiryDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!timeLeft) return <span className="text-red-500 font-black">EXPIRED</span>;

  return (
    <div className="flex items-center gap-1.5 font-mono">
      <div className="flex flex-col items-center">
        <span className="text-xs font-black">{timeLeft.d}d</span>
      </div>
      <span className="opacity-30 text-[10px]">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xs font-black">{timeLeft.h}h</span>
      </div>
      <span className="opacity-30 text-[10px]">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xs font-black">{timeLeft.m}m</span>
      </div>
      <span className="opacity-30 text-[10px]">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xs font-black text-blue-400">{timeLeft.s}s</span>
      </div>
    </div>
  );
}

export default function ChildPanelPage() {
  const { formatAmount } = useCurrency();
  const router = useRouter();
  const [existingPanel, setExistingPanel] = useState<ExistingPanel | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [isDNSOpen, setIsDNSOpen] = useState(true);
  const [togglingRenew, setTogglingRenew] = useState(false);

  const [formData, setFormData] = useState({
    domain: "",
    adminName: "",
    adminPassword: "",
    confirmPassword: ""
  });

  const priceInNaira = 14287;

  // Load existing panel on mount
  const loadPanelData = () => {
    fetch("/api/user/child-panel")
      .then(r => r.json())
      .then(data => { setExistingPanel(data); setPageLoading(false); })
      .catch(() => setPageLoading(false));
  };

  useEffect(() => {
    loadPanelData();
  }, []);

  const handleToggleAutoRenew = async () => {
    if (!existingPanel?.panelId) return;
    setTogglingRenew(true);
    try {
      const resp = await fetch("/api/user/child-panel/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoRenew: !existingPanel.auto_renew })
      });
      if (resp.ok) {
        toast.success(`Auto-renew ${!existingPanel.auto_renew ? 'enabled' : 'disabled'}`);
        loadPanelData();
      }
    } catch (e) {
      toast.error("Failed to update auto-renew");
    } finally {
      setTogglingRenew(false);
    }
  };

  const handleManualRenew = async () => {
    if (!confirm("Proceed with manual renewal? The fee will be deducted from your balance.")) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/user/child-panel/subscription", {
        method: "POST",
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Renewal failed");
      toast.success("Panel renewed successfully!");
      loadPanelData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const domain = formData.domain.trim();
    if (!domain.includes(".")) {
      toast.error("Please enter a valid domain name. You must put in your dot (e.g., domain.com).");
      return;
    }
    const parts = domain.split(".");
    if (parts.length < 2 || !parts[0] || !parts[1] || parts[parts.length - 1].length < 2) {
      toast.error("Invalid domain format. Ensure you include a valid extension after the dot (e.g. .com)");
      return;
    }

    if (formData.adminPassword !== formData.confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      const response = await fetch("/api/user/child-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: formData.domain,
          adminName: formData.adminName,
          adminPassword: formData.adminPassword,
          priceInNaira: 14287,
          priceInUsd: 10.99
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400 && data.error?.toLowerCase().includes("balance")) { setShowBalanceModal(true); return; }
        throw new Error(data.error || "Failed to purchase child panel");
      }
      toast.success("Child panel purchased successfully!");
      loadPanelData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Rejected panels show the form again (with a notice at top)
  const showForm = !existingPanel?.exists || existingPanel?.status === 'rejected';

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 md:space-y-8 min-h-screen bg-background text-foreground mt-4">
      {(!existingPanel?.exists || existingPanel.status !== 'active') && (
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
            Child Panel Partnership
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Launch your own white-label social media marketplace panel in minutes.</p>
        </header>
      )}

      <div className={`grid ${existingPanel?.status === 'active' ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>
        <div className={existingPanel?.status === 'active' ? 'w-full max-w-3xl mx-auto' : 'lg:col-span-2'}>
          <AnimatePresence mode="wait">

            {/* ─── ACTIVE/PENDING: Show status + DNS guide ─── */}
            {existingPanel?.exists && existingPanel.status !== 'rejected' ? (
              <motion.div key="existing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                {/* Subscription Status Card */}
                <div className="bg-card border border-border rounded-[24px] md:rounded-3xl overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-3 md:p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10"><Cpu className="w-16 h-16 md:w-24 md:h-24" /></div>
                    <div className="flex items-start justify-between relative z-10">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${existingPanel.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                            {existingPanel.status}
                          </span>
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Pro Monthly</span>
                        </div>
                        <h2 className="text-lg md:text-2xl font-black tracking-tight">{existingPanel.domain}</h2>
                        <p className="text-blue-200/50 text-[9px] md:text-xs font-medium">Managed Infrastructure</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-300/50 mb-0.5">Monthly Billing</p>
                        <p className="text-lg md:text-2xl font-black">{formatAmount(existingPanel.subscription_price || 14287)}</p>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 md:pt-6">
                      <div className="space-y-0.5">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Next Renewal</p>
                        <div className="text-[11px] md:text-sm font-bold flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] md:text-sm">
                              {existingPanel.expires_at
                                ? `${new Date(existingPanel.expires_at).toLocaleDateString()} at ${new Date(existingPanel.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : 'N/A'}
                            </span>
                          </div>
                          {existingPanel.expires_at && (
                            <div className="p-1 md:p-1.5 bg-white/5 rounded-lg border border-white/10 w-fit scale-90 origin-left md:scale-100">
                              <CountdownTimer expiryDate={existingPanel.expires_at} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Auto-Renewal</p>
                        <button
                          onClick={handleToggleAutoRenew}
                          disabled={togglingRenew}
                          className={`flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase transition-all ${existingPanel.auto_renew
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                            }`}
                        >
                          {togglingRenew ? '...' : existingPanel.auto_renew ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 md:p-8 bg-card flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Shield className="w-3.5 h-3.5 md:w-5 md:h-5" />
                      </div>
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Access</p>
                        <a
                          href={`https://${existingPanel.domain}/admin`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] md:text-sm font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          {existingPanel.domain}/admin
                          <ArrowRight className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                    {existingPanel.status === 'expired' && !existingPanel.auto_renew && (
                      <button
                        onClick={handleManualRenew}
                        disabled={loading}
                        className="px-3 py-2 md:px-6 md:py-3 bg-primary text-primary-foreground rounded-lg md:rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                      >
                        Renew Now
                      </button>
                    )}
                  </div>
                </div>

                {/* ─── BILLING HISTORY ─── */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4 text-primary" />
                      Billing History
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/50 text-[9px] md:text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                        <tr>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Period</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {existingPanel.history && existingPanel.history.length > 0 ? (
                          existingPanel.history.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 font-medium text-[11px] md:text-xs">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-[11px] md:text-xs text-muted-foreground">
                                {new Date(item.periodStart).toLocaleDateString()} - {new Date(item.periodEnd).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 font-bold text-[11px] md:text-xs">
                                {formatAmount(item.amount)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-[9px] md:text-[10px] font-black uppercase">
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic text-xs">
                              No billing records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>



                {/* DNS Instructions — Only show if not fully active */}
                {existingPanel.status !== 'active' && (
                  <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl/10 transition-all duration-300">
                    <div className="p-5 md:p-6 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
                      <h3 className="font-bold text-base md:text-lg text-foreground flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        DNS Configuration Guide
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> DNS Action Required
                      </span>
                    </div>
                    <div className="p-5 md:p-6 space-y-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        To complete the partnership setup and activate your custom domain, log into your domain registrar (such as Namecheap, GoDaddy, Hostinger, or Cloudflare — <strong className="text-foreground font-semibold">we highly recommend Namecheap</strong> to make the DNS setup and propagation process much easier) and configure the following DNS records:
                      </p>
                      
                      <div className="rounded-2xl overflow-hidden border border-border bg-muted/20 shadow-inner">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <tr>
                                <th className="px-4 py-3.5">Record Type</th>
                                <th className="px-4 py-3.5">Host / Name</th>
                                <th className="px-4 py-3.5">Points To / Value</th>
                                <th className="px-4 py-3.5">TTL</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                              <tr className="hover:bg-muted/40 transition-colors">
                                <td className="px-4 py-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">A Record</td>
                                <td className="px-4 py-4 font-mono text-[11px]">
                                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold">@</span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs font-mono font-semibold bg-muted border border-border px-2.5 py-1 rounded-lg text-foreground select-all">76.76.21.21</code>
                                    <CopyButton text="76.76.21.21" />
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-muted-foreground text-xs font-medium">Automatic</td>
                              </tr>
                              <tr className="hover:bg-muted/40 transition-colors">
                                <td className="px-4 py-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">CNAME</td>
                                <td className="px-4 py-4 font-mono text-[11px]">
                                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold">www</span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs font-mono font-semibold bg-muted border border-border px-2.5 py-1 rounded-lg text-foreground select-all">cname.vercel-dns.com</code>
                                    <CopyButton text="cname.vercel-dns.com" />
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-muted-foreground text-xs font-medium">Automatic</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="space-y-4 pt-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Step-by-Step Integration</h4>
                        <div className="grid gap-3">
                          {[
                            "Log into your domain provider panel (Hostinger, Namecheap, GoDaddy, etc. We highly recommend Namecheap for easier DNS setup)",
                            `Locate the DNS Zone Editor or DNS Settings page for ${existingPanel.domain}`,
                            "Add an A Record: Host = @, Points to = 76.76.21.21",
                            "Add a CNAME record: Host = www, Points to = cname.vercel-dns.com",
                            "Save all changes. DNS updates will propagate globally over the next few hours.",
                            "Once records are verified, your custom marketplace panel will be automatically live!",
                          ].map((text, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/30">
                              <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed font-medium">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h5 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Important Notice</h5>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Ensure you do not have any other A records pointed to other IP addresses on your root domain, as this will prevent successful propagation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription History Table */}
                {/* <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                   <div className="p-6 border-b border-border/50 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-black text-sm uppercase tracking-widest">Billing History</h3>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-muted/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            <tr>
                               <th className="px-6 py-4">Transaction ID</th>
                               <th className="px-6 py-4">Date</th>
                               <th className="px-6 py-4">Amount</th>
                               <th className="px-6 py-4">Period</th>
                               <th className="px-6 py-4">Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border/50">
                            {existingPanel.history?.length ? existingPanel.history.map((h, i) => (
                              <tr key={i} className="hover:bg-muted/30 transition-colors">
                                 <td className="px-6 py-4 font-mono text-[10px] font-bold text-muted-foreground uppercase">{h.id.slice(0, 8)}</td>
                                 <td className="px-6 py-4 text-[11px] font-bold">{new Date(h.created_at).toLocaleDateString()}</td>
                                 <td className="px-6 py-4 text-[11px] font-black text-foreground">{formatAmount(h.amount)}</td>
                                 <td className="px-6 py-4 text-[10px] font-medium text-muted-foreground">
                                    {new Date(h.period_start).toLocaleDateString()} - {new Date(h.period_end).toLocaleDateString()}
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20">
                                       {h.status}
                                    </span>
                                 </td>
                              </tr>
                            )) : (
                              <tr>
                                 <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-xs italic font-medium">
                                    No billing records found.
                                 </td>
                              </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div> */}
              </motion.div>

            ) : (

              /* ─── NEW / REJECTED: Show form ─── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8"
              >
                {/* Rejection notice */}
                {existingPanel?.status === 'rejected' && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-red-500">Previous panel was rejected</p>
                      <p className="text-xs text-muted-foreground mt-1">Please submit a new request below or contact support if you have any questions.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                      <Globe className="w-5 h-5" />
                      Configuration
                    </h2>
                    <p className="text-sm text-muted-foreground">Fill in the details below to initialize your white-label panel.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold flex items-center gap-2">Domain Name</label>
                        <p className="text-[11px] font-normal text-muted-foreground">Enter your custom domain without HTTP:// or HTTPS://</p>
                      </div>
                      <input
                        type="text" name="domain" required placeholder="e.g yourdomain.com"
                        value={formData.domain} onChange={handleInputChange}
                        className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                      />

                      {/* Namecheap Recommendation Alert */}
                      <div className="p-3.5 rounded-xl bg-blue-100 border border-blue-500/20 text-xs text-blue-200/90 flex items-start gap-2.5 shadow-sm">
                        <AlertCircle className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-blue-300">Important DNS Notice:</span> We highly recommend using <strong className="text-black">Namecheap</strong> to get your domain. It is extremely reliable and makes the DNS configuration/propagation process much easier.
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold">Admin Username</label>
                        <input
                          type="text" name="adminName" required placeholder="Admin Username"
                          value={formData.adminName} onChange={handleInputChange}
                          className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Admin Password</label>
                          <input
                            type="password" name="adminPassword" required placeholder="••••••••"
                            value={formData.adminPassword} onChange={handleInputChange}
                            className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Confirm Password</label>
                          <input
                            type="password" name="confirmPassword" required placeholder="••••••••"
                            value={formData.confirmPassword} onChange={handleInputChange}
                            className="w-full p-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit" disabled={loading}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-95 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 group"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>Purchase & Launch Panel <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insufficient Balance Modal */}
          <AnimatePresence>
            {showBalanceModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center"
                >
                  <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Insufficient Balance</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Your balance is not up to the amount. Please fund your wallet to continue with your child panel request.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <Link href="/add-funds" className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 text-center">
                      Fund My Wallet
                    </Link>
                    <button onClick={() => setShowBalanceModal(false)} className="w-full py-3 text-muted-foreground hover:text-foreground font-medium transition-colors">Close</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        {(!existingPanel?.exists || existingPanel.status !== 'active') && (
          <div className="space-y-6">
            {/* DNS card — only show on the form view */}
            {showForm && (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <button
                  onClick={() => setIsDNSOpen(!isDNSOpen)}
                  className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg"><Monitor className="w-5 h-5 text-blue-500" /></div>
                    <h3 className="font-bold text-sm uppercase tracking-wider">DNS Configuration</h3>
                  </div>
                  <motion.div animate={{ rotate: isDNSOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isDNSOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                      <div className="p-5 pt-0 space-y-4 border-t border-border/50">
                        <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Important DNS Notice</h4>
                            <p className="text-[11px] text-muted-foreground leading-normal">
                              For your white-label panel to launch successfully, you must configure your domain servers.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">Point CNAME Record To:</span>
                          <div className="p-3 bg-muted/60 border border-border rounded-xl font-mono text-[12px] flex items-center justify-between group hover:bg-muted/80 transition-colors">
                            <span className="select-all font-semibold text-foreground">cname.vercel-dns.com</span>
                            <div className="flex items-center gap-1.5">
                              <CopyButton text="cname.vercel-dns.com" />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                          <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic">
                            Note: DNS records normally propagate in minutes, but can take up to 24–48 hours to update globally across all network providers.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Package Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                Package Summary
              </h3>
              <div className="space-y-3 pb-4 border-b border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Child Panel Subscription</span>
                  <span className="font-medium">Monthly Plan</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">White-Label Status</span>
                  <span className="font-medium text-green-400">Yes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">API Integration</span>
                  <span className="font-medium text-blue-300 italic">Full Access</span>
                </div>
              </div>
              <div className="pt-4 space-y-1">
                <div className="text-xs opacity-70 uppercase font-bold tracking-wider">Total Monthly Price</div>
                <div className="text-4xl font-bold tabular-nums tracking-tight">{formatAmount(priceInNaira)}</div>
                <div className="text-[10px] opacity-60">* Renewal managed via wallet balance</div>
              </div>
            </div>

            {/* Premium Benefits */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider opacity-60">
                Premium Benefits
              </h3>
              <ul className="space-y-3">
                {[
                  "Fully Branded SMM Panel",
                  "Full API Order Sync",
                  "Profit Margin Management",
                  "Special Discounts on API Log Purchases",
                  "Unlimited Service Import",
                  "Free Technical Support",
                  "Daily Database Backups"
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-sm text-foreground/80 flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
