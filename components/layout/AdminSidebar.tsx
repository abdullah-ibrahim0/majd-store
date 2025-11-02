"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Folder,
  Percent,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../ui/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Orders", href: "/admin/orders", icon: FileText },
  { name: "Categories", href: "/admin/categories", icon: Folder },
  { name: "Discounts", href: "/admin/discounts", icon: Percent },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-brand-dark text-white rounded-lg flex items-center justify-center shadow-lg"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-brand-dark text-white transition-transform duration-300",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-center border-b border-white/10">
            <Link href="/admin" className="flex items-center">
              <span className="text-2xl text-brand-accent">مجد</span>
              <span className="ml-2 text-sm">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-brand-accent text-brand-dark"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 p-3">
            <button
              onClick={() => {
                // TODO: Implement logout
                console.log("Logout clicked");
              }}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
