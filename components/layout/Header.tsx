"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, ShoppingCart, User, X, ChevronDown } from "lucide-react";

const womenSubcategories = [
  { name: "Tops", href: "/products?category=tops" },
  { name: "Pants", href: "/products?category=pants" },
  { name: "Bags", href: "/products?category=bags" },
  { name: "Shoes", href: "/products?category=shoes" },
  { name: "Soiree", href: "/products?category=soiree" },
];

// Use query params for products page
const navigation = [
  { name: "Women", href: "/products?category=women", hasSubmenu: true },
  { name: "Men", href: "/products?category=men" },
  { name: "Kids", href: "/products?category=kids" },
  { name: "Perfumes", href: "/products?category=perfumes" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [womenSubmenuOpen, setWomenSubmenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const cartItemCount = 3; // TODO: Replace with actual cart count

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-brand-dark p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-brand-dark">
              <span className="text-2xl font-bold">مجد</span>
              <span className="ml-2 text-xs text-text-medium hidden sm:inline">
                Style with glory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-brand-dark hover:text-brand-accent transition-colors font-medium"
                >
                  {item.name}
                  {item.hasSubmenu && (
                    <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                  )}
                </Link>

                {/* Desktop Dropdown */}
                {item.hasSubmenu && (
                  <div className="absolute left-0 mt-0 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    {womenSubcategories.map((subitem) => (
                      <Link
                        key={subitem.name}
                        href={subitem.href}
                        className="block px-4 py-2 text-brand-dark hover:text-brand-accent hover:bg-brand-cream/50 transition-colors"
                      >
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {searchOpen ? (
                <div className="flex items-center gap-2 bg-brand-cream rounded-lg px-3 py-2">
                  <input
                    type="search"
                    placeholder="Search products..."
                    className="w-64 bg-transparent outline-none text-brand-dark placeholder:text-text-medium"
                    autoFocus
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-brand-dark p-1 hover:text-brand-accent transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-brand-dark p-2 hover:text-brand-accent transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search - Mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden text-brand-dark p-2 hover:text-brand-accent transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account */}
            <Link
              href="/auth/login"
              className="hidden sm:block text-brand-dark p-2 hover:text-brand-accent transition-colors"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-brand-dark p-2 hover:text-brand-accent transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden pb-4">
            <div className="flex items-center gap-2 bg-brand-cream rounded-lg px-3 py-2">
              <Search className="w-5 h-5 text-text-medium" />
              <input
                type="search"
                placeholder="Search products..."
                className="flex-1 bg-transparent outline-none text-brand-dark placeholder:text-text-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (!item.hasSubmenu) {
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="flex-1 py-3 text-brand-dark hover:text-brand-accent transition-colors font-medium"
                  >
                    {item.name}
                  </Link>

                  {item.hasSubmenu && (
                    <button
                      onClick={() => setWomenSubmenuOpen(!womenSubmenuOpen)}
                      className="p-2 text-brand-dark hover:text-brand-accent transition-colors"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          womenSubmenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {item.hasSubmenu && womenSubmenuOpen && (
                  <div className="pl-4 space-y-1 bg-brand-cream/30 rounded py-2">
                    {womenSubcategories.map((subitem) => (
                      <Link
                        key={subitem.name}
                        href={subitem.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-sm text-brand-dark hover:text-brand-accent hover:pl-2 transition-all"
                      >
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 text-brand-dark hover:text-brand-accent transition-colors font-medium sm:hidden mt-4 pt-4 border-t border-border"
            >
              My Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
