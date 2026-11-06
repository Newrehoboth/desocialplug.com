'use client';

import React, { useEffect, useState } from 'react';
import { Wrench, RefreshCw, ShieldAlert, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('System Under Maintenance');
  const [message, setMessage] = useState<string>(
    "De'socialPlug is currently undergoing scheduled maintenance to improve performance and security. Please check back soon."
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkMaintenanceStatus = async (isManual = false) => {
    if (isManual) setIsChecking(true);
    try {
      const res = await fetch('/api/system-settings', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        setIsMaintenance(!!data.isMaintenanceMode);
        if (data.maintenanceTitle) setTitle(data.maintenanceTitle);
        if (data.maintenanceMessage) setMessage(data.maintenanceMessage);
      }
    } catch (err) {
      console.error('Failed to check maintenance status:', err);
    } finally {
      setIsLoading(false);
      if (isManual) {
        setTimeout(() => setIsChecking(false), 600);
      }
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();

    // Poll every 12 seconds to auto-restore access when admin turns maintenance OFF
    const interval = setInterval(() => {
      checkMaintenanceStatus();
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    // Return children initially or silent skeleton to avoid flickering for normal users
    return <>{children}</>;
  }

  if (!isMaintenance) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center min-h-screen w-full bg-[#070b14] text-white overflow-y-auto font-sans antialiased selection:bg-amber-500/30">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative z-10 max-w-2xl w-full mx-4 my-8 p-8 md:p-12 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 text-center space-y-8">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          System Maintenance Active
        </div>

        {/* Icon & Title */}
        <div className="space-y-4">
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-indigo-500/20 border border-amber-500/30 mx-auto shadow-lg shadow-amber-500/10">
            <Wrench className="w-12 h-12 text-amber-400 animate-bounce" style={{ animationDuration: '3s' }} />
            <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
            {title}
          </h1>
        </div>

        {/* Custom Message from Admin */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
          <p className="text-base md:text-lg text-slate-300 leading-relaxed font-normal">
            {message}
          </p>
        </div>

        {/* Interactive Actions & Live Indicator */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => checkMaintenanceStatus(true)}
            disabled={isChecking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking Status...' : 'Check System Status'}
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400/80" />
            <span>Official Maintenance Notice</span>
          </div>

          {lastChecked && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Last checked: {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          )}

          <div>
            &copy; {new Date().getFullYear()} De'socialPlug LTD
          </div>
        </div>

      </div>
    </div>
  );
}
