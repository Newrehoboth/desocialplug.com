"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  ShoppingBag,
  ShoppingBasket,
  Wallet,
  ArrowLeftRight,
  UsersRound,
  Headset,
  Handshake,
  ChevronDown,
  ChevronUp,
  Terminal,
  Box,
  Monitor,
  ShieldCheck,
  ShieldCheckIcon,
  Ticket,
} from "lucide-react"
import { useState, useEffect } from "react"
import SignOutButton from "./signout-button"

const ADMIN_EMAILS = ["admin@desocialplug.com", "superadmin@gmail.com"]; // Authorized Super Admins

const menuItems = [
  { icon: ShoppingBasket, label: "Purchases", href: "/purchases" },
  { icon: Wallet, label: "Add Funds", href: "/add-funds" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/transactions" },
  { icon: UsersRound, label: "Referrals", href: "/referrals" },
  { icon: Headset, label: "Support", href: "https://t.me/desocialplugsupport" },
  { icon: Ticket, label: "Tickets", href: "/tickets" },
  { icon: Handshake, label: "Join Our Community", href: "https://t.me/desocialplug" },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success) {
          setUser(data.user)
        }
      } catch (err) {
        console.error("Failed to fetch user session", err)
      }
    }
    fetchUser()
  }, [])

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email)

  const [isPartnershipOpen, setIsPartnershipOpen] = useState(
    pathname.includes("/dashboard/developer-api") || pathname.includes("/dashboard/child-panel")
  )

  const togglePartnership = () => {
    setIsPartnershipOpen(!isPartnershipOpen)
  }

  return (
    <div className="h-full bg-[#1a49ee] dark:bg-blue-950/50 dark:backdrop-blur-xl border-r border-blue-600 dark:border-blue-900/50 flex flex-col">
      {/* Profile section */}
      <div 
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
        className="px-6 pb-6 pt-6 flex items-center justify-between border-b border-blue-600"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/image/DeSocial Plug A23.png"
            width={120}
            height={70}
            alt="Logo"
            className="w-auto h-11 object-contain"
          />
        </div>
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {/* Super Admin - ONLY FOR ADMINS */}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black uppercase tracking-tighter transition-all mb-4 ${pathname === "/dashboard/admin"
              ? "bg-white text-blue-600 shadow-lg shadow-white/20"
              : "bg-black/20 text-blue-100 hover:bg-black/30 border border-white/5"
              }`}
          >
            <ShieldCheckIcon className="w-5 h-5 text-yellow-400" />
            <span>Super Admin</span>
          </Link>
        )}

        {/* Dashboard link */}
        <Link
          href="/dashboard"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === "/dashboard"
            ? "bg-blue-500 text-white"
            : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* First 4 items (INCLUDING REFERRALS) */}
        {menuItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                ? "bg-blue-500 text-white"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Partnership Dropdown (NOW BELOW REFERRALS) */}
        <div className="space-y-1">
          <button
            onClick={togglePartnership}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isPartnershipOpen || pathname.includes("/dashboard/developer-api") || pathname.includes("/dashboard/child-panel")
              ? "bg-blue-600/50 text-white"
              : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
          >
            <div className="flex items-center gap-3">
              <UsersRound className="w-5 h-5" />
              <span>Partnership</span>
            </div>
            {isPartnershipOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isPartnershipOpen && (
            <div className="pl-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <Link
                href="/dashboard/developer-api"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/dashboard/developer-api"
                  ? "text-white bg-blue-500/30"
                  : "text-blue-200 hover:text-white hover:bg-blue-700/50"
                  }`}
              >
                <Terminal className="w-4 h-4" />
                <span>API</span>
              </Link>
              <Link
                href="/dashboard/child-panel"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/dashboard/child-panel"
                  ? "text-white bg-blue-500/30"
                  : "text-blue-200 hover:text-white hover:bg-blue-700/50"
                  }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Child Panel</span>
              </Link>
            </div>
          )}
        </div>

        {/* Remaining items */}
        {menuItems.slice(4).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                ? "bg-blue-500 text-white"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div 
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        className="p-4 border-t border-blue-600"
      >
        <SignOutButton onClose={onClose} />
      </div>
    </div>
  )
}