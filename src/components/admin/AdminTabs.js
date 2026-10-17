"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const TABS = [
  { href: "/admin", label: "Content", icon: "edit" },
  { href: "/admin/inbox", label: "Inbox", icon: "mail" },
];

// Switches between the content editor and the inbox.
export default function AdminTabs({ unread = 0, unsaved = false }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 rounded-lg bg-surface p-0.5" aria-label="Admin sections">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            onClick={(e) => {
              if (!active && unsaved && !window.confirm("You have unsaved changes. Leave anyway? They'll be kept as a draft you can restore.")) {
                e.preventDefault();
              }
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${active ? "bg-bg text-fg shadow-sm" : "text-muted hover:text-fg"}`}
          >
            <Icon name={tab.icon} className="size-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.href === "/admin/inbox" && unread > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-bg">{unread > 99 ? "99+" : unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
