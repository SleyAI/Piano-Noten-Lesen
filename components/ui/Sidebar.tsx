"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Übersicht",
    icon: "🏠",
  },
  {
    href: "/melodien",
    label: "Melodien",
    icon: "🎵",
  },
  {
    href: "/akkorde",
    label: "Akkorde",
    icon: "🎹",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 lg:w-64 shrink-0 flex-col p-4 select-none">
      <div className="px-3 py-3 mb-3">
        <h2 className="font-titel text-2xl font-bold text-[#785BA3]">
          Noten &amp; Akkorde
        </h2>
        <p className="text-xs text-tinte-leise font-medium mt-0.5">
          Gemütlich Klavier lernen
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const aktiv =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 ${
                aktiv
                  ? "bg-white text-[#785BA3] shadow-[0_4px_24px_rgba(120,91,163,0.08)] font-semibold -translate-y-0.5"
                  : "text-tinte/80 hover:bg-white/50 hover:text-tinte font-medium"
              }`}
            >
              <span className="text-xl leading-none" aria-hidden>
                {item.icon}
              </span>
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
