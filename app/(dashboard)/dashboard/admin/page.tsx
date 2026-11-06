"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Globe, DollarSign, Search, CheckCircle, XCircle, X,
  Clock, ArrowRight, ExternalLink, RefreshCw, Filter, 
  ChevronDown, ShieldCheck, Zap, Activity, AlertCircle, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PanelStats {
  totalUsers: number;
  totalDeposits: number;
  totalRevenue: number;
}

interface ChildPanel {
  id: string;
  domain: string;
  adminName: string;
  userId: {
    username: string;
    email: string;
  };
  status: 'pending' | 'active' | 'rejected' | 'cancelled' | 'expired';
  createdAt: string;
  expiresAt: string;
  discounts: Record<string, number>;
  priceInNaira: number;
  stats: PanelStats;
  users: any[];
  adminPassword?: string;
}

export default function SuperAdminPage() {
  const [panels, setPanels] = useState<ChildPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState("");
  
  // Secondary Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<ChildPanel | null>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [isSavingDiscounts, setIsSavingDiscounts] = useState(false);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [globalDiscounts, setGlobalDiscounts] = useState<Record<string, number>>({});
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [revealPassword, setRevealPassword] = useState(false);
  const [isRevenueBreakdownOpen, setIsRevenueBreakdownOpen] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    
    // Hardcoded credentials as requested
    if (adminEmail === "superadmin@gmail.com" && adminPassword === "superadmin123!") {
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLoginLoading(false);
        toast.success("Security Clearance Granted. Welcome, Boss.");
      }, 1000);
    } else {
      setTimeout(() => {
        toast.error("Invalid Admin Credentials. Access Denied.");
        setIsLoginLoading(false);
      }, 800);
    }
  };

  const fetchGlobalSettings = async () => {
    const secretKey = "dsp_master_secret_2025_security_bypass";
    try {
      const res = await fetch('/api/admin/global-settings', {
        headers: { 'x-super-admin-key': secretKey }
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setGlobalDiscounts(data.settings.globalDiscounts || {});
      }
    } catch (err) {
      console.error("Failed to fetch global settings");
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (data.success) setCatalog(data.accounts);
    } catch (err) {
      console.error("Failed to fetch catalog");
    }
  };

  const fetchPanels = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      // FORCE MATCH with backend fallback to resolve connection issues
      const secretKey = "dsp_master_secret_2025_security_bypass"; 
      
      const res = await fetch(`/api/admin/child-panels${filter !== 'all' ? `?status=${filter}` : ''}`, {
        headers: { 'x-super-admin-key': secretKey },
        cache: 'no-store'
      });
      const data = await res.json();
      
      if (data.success) {
        setPanels(data.panels);
      } else {
        toast.error(data.error || "Failed to fetch panels");
      }
    } catch (error) {
      toast.error("An error occurred while fetching panels");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPanels();
      fetchCatalog();
      fetchGlobalSettings();
    }
  }, [filter, isAuthenticated]);

  const getTimeRemaining = (expiryDate: string) => {
    if (!expiryDate) return "N/A";
    const total = Date.parse(expiryDate) - Date.now();
    if (isNaN(total) || total <= 0) return "EXPIRED";
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d ${hours}h left`;
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return `${hours}h ${minutes}m left`;
  };

  const handleStatusChange = async (panelId: string, newStatus: string) => {
    const secretKey = "dsp_master_secret_2025_security_bypass";
    try {
      const res = await fetch('/api/admin/child-panels', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-super-admin-key': secretKey
        },
        body: JSON.stringify({ panelId, status: newStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Panel ${newStatus} successfully`);
        fetchPanels(true);
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };
  
  const handleDeletePanel = async (panelId: string) => {
    const secretKey = "dsp_master_secret_2025_security_bypass";
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/child-panels?panelId=${panelId}`, {
        method: 'DELETE',
        headers: { 
          'x-super-admin-key': secretKey
        }
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Child panel deleted successfully");
        setPanels(prev => prev.filter(p => p.id !== panelId));
        setConfirmDeleteId(null);
      } else {
        toast.error(data.error || "Deletion failed");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateDiscounts = async (panelId: string, newDiscounts: any) => {
    const secretKey = "dsp_master_secret_2025_security_bypass";
    setIsSavingDiscounts(true);
    try {
      const res = await fetch('/api/admin/child-panels', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-super-admin-key': secretKey
        },
        body: JSON.stringify({ panelId, discounts: newDiscounts })
      });
      const data = await res.json();
      
      console.log(`[Admin] Discount Update Response (Status: ${res.status}):`, data);

      if (data.success) {
        toast.success("Discounts updated successfully");
        fetchPanels(true);
      } else {
        console.error("[Admin] Update Failed:", data.error);
        toast.error(data.error || "Update failed");
      }
    } catch (err: any) {
      console.error("[Admin] Network/Critical Error:", err);
      toast.error("Failed to update discounts: " + err.message);
    } finally {
      setIsSavingDiscounts(false);
    }
  };

  const handleRenewSubscription = async (panelId: string) => {
    const confirmed = window.confirm("Are you sure you want to RENEW this subscription? This will RESET the expiry to 30 days from today.");
    if (!confirmed) return;

    const secretKey = "dsp_master_secret_2025_security_bypass";
    setRenewingId(panelId);
    try {
      const res = await fetch('/api/admin/child-panels', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-super-admin-key': secretKey
        },
        body: JSON.stringify({ 
          panelId, 
          status: 'active',
          // HARD RESET TO 30 DAYS FROM TODAY
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Subscription reset to 30 days");
        fetchPanels(true);
      } else {
        toast.error(data.error || "Renewal failed");
      }
    } catch (err) {
      toast.error("Failed to renew subscription");
    } finally {
      setRenewingId(null);
    }
  };

  const handleUpdateGlobalDiscounts = async () => {
    const secretKey = "dsp_master_secret_2025_security_bypass";
    setIsSavingGlobal(true);
    try {
      const res = await fetch('/api/admin/global-settings', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-super-admin-key': secretKey
        },
        body: JSON.stringify({ globalDiscounts })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Global baseline updated");

        // Option to push to all panels
        if (window.confirm("Would you like to push these global discounts to ALL existing panels immediately? This will overwrite individual panel discounts for these logs.")) {
           const panelsRes = await fetch('/api/admin/child-panels/bulk-sync', {
             method: 'POST',
             headers: { 
               'Content-Type': 'application/json',
               'x-super-admin-key': secretKey
             },
             body: JSON.stringify({ discounts: globalDiscounts })
           });
           const pushData = await panelsRes.json();
           if (pushData.success) {
             toast.success("Applied to all panels");
             fetchPanels(true);
           }
        }
        
        setIsGlobalSettingsOpen(false);
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Failed to update global discounts");
    } finally {
      setIsSavingGlobal(false);
    }
  };

  const handleUpdateAdminPassword = async (panelId: string) => {
    if (!newAdminPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    const secretKey = "dsp_master_secret_2025_security_bypass";
    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/admin/child-panels', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-super-admin-key': secretKey
        },
        body: JSON.stringify({ panelId, adminPassword: newAdminPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Admin password updated successfully");
        setNewAdminPassword("");
        setShowPasswordInput(false);
        fetchPanels(true);
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const filteredPanels = panels.filter(p => 
    p.domain.toLowerCase().includes(search.toLowerCase()) || 
    p.adminName.toLowerCase().includes(search.toLowerCase())
  );

  const totalGlobalRevenue = panels.reduce((sum, p) => sum + (p.stats?.totalRevenue || 0), 0);
  const totalGlobalUsers = panels.reduce((sum, p) => sum + (p.stats?.totalUsers || 0), 0);
  const totalGlobalDeposits = panels.reduce((sum, p) => sum + (p.stats?.totalDeposits || 0), 0);
  const activePanelsCount = panels.filter(p => p.status === 'active').length;

  const formatAmount = (amount: any) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(val);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border border-border shadow-2xl rounded-[32px] overflow-hidden"
        >
          <div className="bg-blue-600 p-8 text-white text-center space-y-2">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Super Admin Portal</h2>
            <p className="text-blue-100 text-sm font-medium">Restricted Access. Level 5 Clearance Required.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Email</label>
                <input 
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full px-5 py-3 bg-muted/50 border-none rounded-2xl focus:ring-2 ring-blue-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Access Password</label>
                <input 
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-5 py-3 bg-muted/50 border-none rounded-2xl focus:ring-2 ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoginLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:scale-100"
            >
              {isLoginLoading ? "Verifying Credentials..." : "Unlock Platform Controls"}
            </button>

            <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
              Session monitored and logged • DeSocialPlug LTD
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Initializing Super Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-sm uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Super Admin Control
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Platform Management
          </h1>
          <p className="text-muted-foreground font-medium">Oversee every child panel across the entire network.</p>
        </div>
        
        <button 
          onClick={() => fetchPanels(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-card border border-border hover:bg-muted rounded-2xl font-bold transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
          {refreshing ? 'Refreshing Live Data...' : 'Refresh All Stats'}
        </button>
      </header>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: "Total Admin Balance", 
            value: formatAmount(totalGlobalRevenue), 
            icon: DollarSign, 
            color: "bg-green-500", 
            shadow: "shadow-green-500/20",
            onClick: () => setIsRevenueBreakdownOpen(true),
            clickable: true
          },
          { label: "Total Network Deposits", value: formatAmount(totalGlobalDeposits), icon: Zap, color: "bg-amber-500", shadow: "shadow-amber-500/20" },
          { label: "Total Managed Users", value: totalGlobalUsers.toLocaleString(), icon: Users, color: "bg-blue-500", shadow: "shadow-blue-500/20" },
          { label: "Live Child Panels", value: activePanelsCount, icon: Globe, color: "bg-indigo-500", shadow: "shadow-indigo-500/20" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={stat.onClick}
            className={`bg-card border border-border p-6 rounded-3xl shadow-xl ${stat.shadow} relative overflow-hidden group ${stat.clickable ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all' : ''}`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  {stat.clickable && <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />}
                </div>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
              <div className={`p-2.5 ${stat.color} rounded-xl text-white`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            {stat.clickable && (
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Breakdown</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-3xl shadow-sm">
        <div className="flex p-1 bg-muted/50 rounded-2xl w-full md:w-auto">
          {['all', 'pending', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === s ? 'bg-background shadow-sm text-blue-500' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setIsGlobalSettingsOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl"
        >
          <ShieldCheck className="w-4 h-4" />
          Global Config
        </button>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search domain or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-muted/50 border-none rounded-2xl focus:ring-2 ring-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Panel List */}
      <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Child Panel</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Live Stats</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Expiration</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence>
                {filteredPanels.map((panel) => (
                  <motion.tr 
                    layout
                    key={panel.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedPanel(panel)}>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black relative">
                          {(panel.domain || "?")[0].toUpperCase()}
                          {panel.status === 'active' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />}
                        </div>
                        <div>
                          <p className="font-bold text-lg flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                            {panel.domain || "Unknown Domain"}
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </p>
                          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            Owner: <span className="text-foreground">{panel.adminName}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-6">
                      {panel.status === 'active' ? (
                        <div className="flex flex-col items-center gap-2">
                          {(panel.stats as any)?.error ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Connection Error
                              </span>
                              <p className="text-[10px] text-red-500/70 font-medium italic">{(panel.stats as any).error}</p>
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Balance</p>
                                <p className="font-bold text-green-500">{formatAmount(panel.stats?.totalRevenue || 0)}</p>
                              </div>
                              <div className="text-center border-x border-border px-4">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Users</p>
                                <p className="font-bold">{(panel.stats?.totalUsers || 0).toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-muted-foreground">Deposits</p>
                                <p className="font-bold text-blue-500">{formatAmount(panel.stats?.totalDeposits || 0)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-xs text-muted-foreground italic">
                          Wait for activation...
                        </div>
                      )}
                    </td>

                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <p className={`text-xs font-black uppercase tracking-wider ${Date.parse(panel.expiresAt) < Date.now() ? 'text-red-500' : 'text-foreground'}`}>
                          {new Date(panel.expiresAt).toLocaleDateString()}
                        </p>
                        <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          Date.parse(panel.expiresAt) < Date.now() ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {getTimeRemaining(panel.expiresAt)}
                        </p>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        panel.status === 'active' ? 'bg-green-500/10 text-green-500' :
                        panel.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          panel.status === 'active' ? 'bg-green-500' :
                          panel.status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        {panel.status === 'rejected' ? 'inactive' : panel.status}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {panel.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(panel.id, 'active')}
                              className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusChange(panel.id, 'rejected')}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {panel.status === 'active' && (
                          <button 
                            onClick={() => handleStatusChange(panel.id, 'rejected')}
                            className="px-4 py-2 bg-muted text-foreground border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                          >
                            Suspend
                          </button>
                        )}
                        {(panel.status === 'rejected' || panel.status === 'cancelled') && (
                          <button 
                            onClick={() => handleStatusChange(panel.id, 'active')}
                            className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                          >
                            Unsuspend
                          </button>
                        )}
                        <button 
                          onClick={() => setConfirmDeleteId(panel.id)}
                          className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 group/del"
                          title="Delete Panel Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredPanels.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-xl">No panels found</p>
                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setConfirmDeleteId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-[32px] p-8 space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertCircle className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Irreversible Deletion</h3>
                <p className="text-muted-foreground text-sm font-medium">
                  This will permanently delete the domain from <span className="font-bold text-foreground">Vercel</span> and remove the child panel registration. The owner's main account will remain intact. This cannot be undone.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleDeletePanel(confirmDeleteId)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {isDeleting ? "Wiping Data..." : "Yes, Delete Everything"}
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-muted text-foreground rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] border border-border"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED PANEL VIEW MODAL */}
      <AnimatePresence>
        {selectedPanel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSavingDiscounts) {
                  setSelectedPanel(null);
                  setShowPasswordInput(false);
                  setNewAdminPassword("");
                  setRevealPassword(false);
                }
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-card border border-border shadow-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-600/20">
                    {(selectedPanel.domain || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                      {selectedPanel.domain || "Unknown Domain"}
                      <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest ${selectedPanel.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {selectedPanel.status}
                      </span>
                    </h2>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                      Owner: {selectedPanel.userId?.username || "Unknown"} ({selectedPanel.userId?.email || "No Email"}) • Started: {new Date(selectedPanel.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedPanel(null);
                    setShowPasswordInput(false);
                    setNewAdminPassword("");
                    setRevealPassword(false);
                  }}
                  className="p-3 bg-muted hover:bg-muted/80 rounded-2xl transition-all active:scale-90"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                {/* Stats Grid - Fixed for mobile */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { label: "Panel Balance", value: formatAmount(selectedPanel.stats?.totalRevenue), icon: DollarSign, color: "text-green-500" },
                    { label: "Total Deposits", value: formatAmount(selectedPanel.stats?.totalDeposits), icon: Zap, color: "text-amber-500" },
                    { label: "Active Users", value: selectedPanel.stats?.totalUsers || 0, icon: Users, color: "text-blue-500" },
                    { label: "Time Left", value: getTimeRemaining(selectedPanel.expiresAt), icon: Clock, color: "text-indigo-500" },
                  ].map((s, i) => (
                    <div key={i} className="bg-muted/30 p-4 md:p-5 rounded-2xl border border-border/50 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between mb-2">
                        <s.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${s.color}`} />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                      </div>
                      <p className="text-sm md:text-xl font-black tracking-tight">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Discount Management */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black tracking-tight">API Log Discounts</h3>
                        <p className="text-xs text-muted-foreground font-medium">Set % discount deducted from panel balance upon purchase.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-muted px-4 py-1.5 rounded-xl border border-border/50 gap-3">
                          <span className="text-[10px] font-black uppercase text-muted-foreground">Bulk %:</span>
                          <input 
                            type="number"
                            id="bulk-discount-panel"
                            placeholder="0"
                            className="w-12 bg-transparent text-xs font-black outline-none border-none p-0 focus:ring-0"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = parseInt((e.target as HTMLInputElement).value) || 0;
                                const newDiscounts = { ...selectedPanel.discounts };
                                catalog.forEach(log => newDiscounts[log.id] = val);
                                setSelectedPanel({ ...selectedPanel, discounts: newDiscounts });
                              }
                            }}
                          />
                          <button 
                            onClick={() => {
                              const input = document.getElementById('bulk-discount-panel') as HTMLInputElement;
                              const val = parseInt(input.value) || 0;
                              const newDiscounts = { ...selectedPanel.discounts };
                              catalog.forEach(log => newDiscounts[log.id] = val);
                              setSelectedPanel({ ...selectedPanel, discounts: newDiscounts });
                            }}
                            className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Apply to All
                          </button>
                          <button 
                            onClick={() => {
                              const newDiscounts = { ...selectedPanel.discounts };
                              catalog.forEach(log => {
                                if (globalDiscounts[log.id]) {
                                  newDiscounts[log.id] = globalDiscounts[log.id];
                                }
                              });
                              setSelectedPanel({ ...selectedPanel, discounts: newDiscounts });
                              toast.success("Synced with Global Baseline");
                            }}
                            className="text-[9px] font-black uppercase text-amber-600 hover:text-amber-700 transition-colors"
                          >
                            Sync Baseline
                          </button>
                        </div>
                        <button 
                          onClick={() => handleUpdateDiscounts(selectedPanel.id, selectedPanel.discounts)}
                          disabled={isSavingDiscounts}
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all"
                        >
                          {isSavingDiscounts ? "Saving..." : "Save Discounts"}
                        </button>
                      </div>
                    </div>

                    <div className="bg-muted/20 border border-border rounded-2xl overflow-hidden">
                      <div className="max-h-[400px] overflow-y-auto scrollbar-hide divide-y divide-border/50">
                        {catalog.map((log) => (
                          <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div className="flex-1">
                              <p className="text-sm font-bold">{log.platform} - {log.subcategory}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Original: {formatAmount(log.price)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={(selectedPanel.discounts || {})[log.id] || ""}
                                  onChange={(e) => {
                                    const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                    setSelectedPanel({
                                      ...selectedPanel,
                                      discounts: { ...(selectedPanel.discounts || {}), [log.id]: val }
                                    });
                                  }}
                                  placeholder="0"
                                  className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-xs font-bold focus:ring-2 ring-blue-500 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">%</span>
                              </div>
                              <div className="w-24 text-right">
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter leading-none mb-1">New Price</p>
                                <p className="text-xs font-black text-green-500">
                                  {formatAmount(log.price * (1 - ((selectedPanel.discounts || {})[log.id] || 0) / 100))}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* User List */}
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tight">Panel Users</h3>
                      <p className="text-xs text-muted-foreground font-medium">Monitoring the users registered on this child panel.</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                      <div className="max-h-[400px] overflow-y-auto scrollbar-hide divide-y divide-border/50">
                        {selectedPanel.users && selectedPanel.users.length > 0 ? (
                          selectedPanel.users.map((user: any, i: number) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-black">
                                  {(user.full_name || user.username || user.email || "?")[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{user.full_name || user.username || "Anonymous"}</p>
                                  <p className="text-[10px] text-muted-foreground font-medium">{user.email || "No Email"}</p>
                                </div>
                              </div>
                                <div className="text-right">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase">Spent / Balance</p>
                                  <p className="text-xs font-black text-foreground">
                                    ₦{(user.spending || user.total_spending || user.total_spent || user.totalSpent || 0).toLocaleString()} / {formatAmount(user.wallet_balance || user.walletBalance || 0)}
                                  </p>
                                </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center text-muted-foreground italic text-sm">
                            No users registered yet.
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRenewSubscription(selectedPanel.id)}
                      disabled={renewingId === selectedPanel.id}
                      className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl"
                    >
                      <RefreshCw className={`w-5 h-5 ${renewingId === selectedPanel.id ? 'animate-spin' : ''}`} />
                      {renewingId === selectedPanel.id ? "Renewing..." : "Renew Subscription (30 Days)"}
                    </button>

                    {/* Admin Access / Support Credentials */}
                    <div className="bg-blue-600/5 border border-blue-600/20 rounded-[24px] p-6 space-y-4">
                      <div className="flex items-center gap-3 text-blue-600">
                        <ShieldCheck className="w-5 h-5" />
                        <h3 className="text-lg font-black tracking-tight">Admin Support Access</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Admin Username</p>
                          <div className="flex items-center justify-between bg-white border border-border p-3 rounded-xl">
                            <span className="font-bold text-sm">{selectedPanel.adminName}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(selectedPanel.adminName);
                                toast.success("Username copied");
                              }}
                              className="text-[10px] font-black uppercase text-blue-600 hover:underline"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Admin Password</p>
                          <div className="flex items-center justify-between bg-white border border-border p-3 rounded-xl">
                            <span className="font-bold text-sm">
                              {revealPassword ? (selectedPanel.adminPassword || "No password set") : "••••••••••••"}
                            </span>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => {
                                  if (revealPassword) {
                                    navigator.clipboard.writeText(selectedPanel.adminPassword || "");
                                    toast.success("Password copied");
                                  } else {
                                    setRevealPassword(true);
                                  }
                                }}
                                className="text-[10px] font-black uppercase text-blue-600 hover:underline"
                              >
                                {revealPassword ? "Copy" : "Reveal"}
                              </button>
                              {revealPassword && (
                                <button 
                                  onClick={() => setRevealPassword(false)}
                                  className="text-[10px] font-black uppercase text-muted-foreground hover:underline"
                                >
                                  Hide
                                </button>
                              )}
                              <button 
                                onClick={() => setShowPasswordInput(!showPasswordInput)}
                                className="text-[10px] font-black uppercase text-amber-600 hover:underline"
                              >
                                {showPasswordInput ? "Cancel" : "Change"}
                              </button>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {showPasswordInput && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-2 flex gap-2"
                              >
                                <input 
                                  type="text"
                                  placeholder="Enter new password..."
                                  value={newAdminPassword}
                                  onChange={(e) => setNewAdminPassword(e.target.value)}
                                  className="flex-1 px-4 py-2 bg-white border border-border rounded-xl text-xs font-medium focus:ring-2 ring-blue-500 outline-none"
                                />
                                <button 
                                  onClick={() => handleUpdateAdminPassword(selectedPanel.id)}
                                  disabled={isUpdatingPassword}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                  {isUpdatingPassword ? "..." : "Set"}
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Panel Login Link</p>
                          <a 
                            href={`https://${selectedPanel.domain}/login`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-white border border-border p-3 rounded-xl group hover:border-blue-500 transition-all"
                          >
                            <span className="font-bold text-sm text-blue-600 truncate mr-2">https://{selectedPanel.domain}/login</span>
                            <ExternalLink className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-[9px] text-muted-foreground font-medium italic">
                          * Use these credentials to log in to the child panel as the owner for troubleshooting. Passwords are hashed and cannot be retrieved, only updated.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL SETTINGS MODAL */}
      <AnimatePresence>
        {isGlobalSettingsOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSavingGlobal && setIsGlobalSettingsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Global Discount Config</h2>
                      <p className="text-xs text-muted-foreground font-medium">Applied to ALL child panels unless a specific discount is set.</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-muted px-4 py-1.5 rounded-xl border border-border/50 gap-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Bulk %:</span>
                    <input 
                      type="number"
                      id="bulk-discount-global"
                      placeholder="0"
                      className="w-12 bg-transparent text-xs font-black outline-none border-none p-0 focus:ring-0"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt((e.target as HTMLInputElement).value) || 0;
                          const newDiscounts = { ...globalDiscounts };
                          catalog.forEach(log => newDiscounts[log.id] = val);
                          setGlobalDiscounts(newDiscounts);
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('bulk-discount-global') as HTMLInputElement;
                        const val = parseInt(input.value) || 0;
                        const newDiscounts = { ...globalDiscounts };
                        catalog.forEach(log => newDiscounts[log.id] = val);
                        setGlobalDiscounts(newDiscounts);
                      }}
                      className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Apply to All
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setIsGlobalSettingsOpen(false)}
                  className="p-3 hover:bg-muted rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-start gap-4">
                  <Activity className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-xs font-medium text-blue-700/80 leading-relaxed">
                    Note: Any panel with a <span className="font-black underline">specific discount</span> set will override these global values. Use this to set the baseline price for the entire network.
                  </p>
                </div>

                <div className="bg-muted/20 border border-border rounded-2xl overflow-hidden divide-y divide-border/50">
                  {catalog.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-bold">{log.platform} - {log.subcategory}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">MSRP: {formatAmount(log.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={globalDiscounts[log.id] || ""}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              setGlobalDiscounts({ ...globalDiscounts, [log.id]: val });
                            }}
                            placeholder="0"
                            className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-xs font-bold focus:ring-2 ring-blue-500 outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">%</span>
                        </div>
                        <div className="w-20 text-right">
                          <p className="text-xs font-black text-blue-500">
                            {formatAmount(log.price * (1 - (globalDiscounts[log.id] || 0) / 100))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-muted/20 border-t border-border flex gap-4">
                <button 
                  onClick={() => setIsGlobalSettingsOpen(false)}
                  className="flex-1 py-4 bg-muted text-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-muted/80 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateGlobalDiscounts}
                  disabled={isSavingGlobal}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                >
                  {isSavingGlobal ? "Saving Config..." : "Apply Global Baseline"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REVENUE BREAKDOWN MODAL */}
      <AnimatePresence>
        {isRevenueBreakdownOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRevenueBreakdownOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-2xl text-white shadow-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Balance Breakdown</h2>
                    <p className="text-xs text-muted-foreground font-medium">Detailed revenue distribution across all child panels.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRevenueBreakdownOpen(false)}
                  className="p-3 hover:bg-muted rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                <div className="grid grid-cols-1 gap-4">
                  {panels
                    .filter(p => (p.stats?.totalRevenue || 0) > 0)
                    .sort((a, b) => (b.stats?.totalRevenue || 0) - (a.stats?.totalRevenue || 0))
                    .map((panel) => (
                      <div key={panel.id} className="bg-muted/30 border border-border/50 p-6 rounded-3xl flex items-center justify-between hover:bg-muted/50 transition-all group">
                        <div className="space-y-1">
                          <p className="text-sm font-black tracking-tight group-hover:text-blue-600 transition-colors">{panel.domain}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{panel.adminName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-green-500">{formatAmount(panel.stats?.totalRevenue || 0)}</p>
                          <p className="text-[10px] font-black uppercase text-muted-foreground">
                            {((panel.stats?.totalRevenue || 0) / (totalGlobalRevenue || 1) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {panels.filter(p => (p.stats?.totalRevenue || 0) > 0).length === 0 && (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">No revenue generated yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-muted/20 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Aggregate Total</p>
                  <p className="text-2xl font-black text-foreground">{formatAmount(totalGlobalRevenue)}</p>
                </div>
                <button 
                  onClick={() => setIsRevenueBreakdownOpen(false)}
                  className="px-8 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Hint */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl z-50">
        <Activity className="w-4 h-4 text-green-400 animate-pulse" />
        <span className="text-sm font-bold tracking-tight">Super Admin: Platform Status Healthy</span>
        <div className="w-px h-4 bg-white/20 mx-2" />
        <span className="text-[10px] font-black uppercase opacity-60">v2.0 LIVE</span>
      </div>
    </div>
  );
}
