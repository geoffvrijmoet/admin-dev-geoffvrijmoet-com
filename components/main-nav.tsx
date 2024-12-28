"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Clock, CreditCard, Settings } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Time Tracking",
    icon: Clock,
    href: "/time-tracking",
    color: "text-violet-500",
  },
  {
    label: "Invoices",
    icon: CreditCard,
    href: "/invoices",
    color: "text-pink-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-2">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-x-2 p-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all",
            pathname === route.href ? "bg-gray-100" : ""
          )}
        >
          <route.icon className={cn("h-5 w-5", route.color)} />
          {route.label}
        </Link>
      ))}
    </nav>
  );
} 