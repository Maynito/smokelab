"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { Notification } from "@/types"
import { getMyNotifications, markNotificationsRead } from "@/app/u/[steamId]/actions"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getMyNotifications().then(({ notifications, unreadCount }) => {
      setNotifications(notifications)
      setUnreadCount(unreadCount)
    })
  }, [])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open])

  function toggle() {
    setOpen((o) => !o)
    if (!open && unreadCount > 0) {
      setUnreadCount(0)
      markNotificationsRead()
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative p-1.5 rounded-md text-zinc-400 hover:text-white transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" strokeLinejoin="round" />
          <path d="M9.5 17a2.5 2.5 0 0 0 5 0" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-orange-500 text-white text-[9px] leading-[15px] text-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl z-30">
          {notifications.length === 0 ? (
            <p className="text-sm text-zinc-500 px-4 py-6 text-center">Aucune notification.</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "#"}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-sm border-b border-zinc-800 last:border-0 hover:bg-zinc-800 transition-colors ${
                  n.read ? "text-zinc-400" : "text-white"
                }`}
              >
                <span className="flex items-start gap-2">
                  {!n.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                  <span>
                    {n.message}
                    <span className="block text-[11px] text-zinc-500 mt-0.5">{formatDate(n.created_at)}</span>
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
