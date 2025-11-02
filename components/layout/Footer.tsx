import * as React from "react";
import Link from "next/link";
import {  Instagram, Mail } from "lucide-react";
import { CustomButton } from "../ui/CustomButton";

const footerLinks = {
  categories: [
    { name: "Women's Clothing", href: "/products?category=women" },
    { name: "Men's Clothing", href: "/products?category=men" },
    { name: "Kids' Clothing", href: "/products?category=kids" },
    { name: "Perfumes", href: "/products?category=perfumes" },
  ],
  support: [
    { name: "Shipping Information", href: "/support/shipping" },
    { name: "Returns & Exchanges", href: "/support/returns" },
    { name: "Size Guide", href: "/support/size-guide" },
    { name: "Contact Us", href: "/support/contact" },
  ],
  company: [
    { name: "About Majd", href: "/about" },
    { name: "Our Story", href: "/story" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
 // { name: "Facebook", icon: Facebook, href: "YOUR_FACEBOOK_LINK_HERE" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/majjd.egy?igsh=Mzd6eDYzc2NlNDJu" },
  {
    name: "TikTok",
    icon: () => (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.7a2.4 2.4 0 0 1-2.4 2.4 2.4 2.4 0 0 1-2.4-2.4 2.4 2.4 0 0 1 2.4-2.4c.34 0 .67.05.98.15V9.48a5.96 5.96 0 0 0-.98-.08 5.99 5.99 0 0 0-5.99 5.99 5.99 5.99 0 0 0 5.99 5.99 5.99 5.99 0 0 0 5.99-5.99V10.95a7.7 7.7 0 0 0 3.77 1.74V8.4a4.8 4.8 0 0 1-1.01-.11z" />
      </svg>
    ),
    href: "https://www.tiktok.com/@majjd.egy?_r=1&_t=ZS-913HJlILlUm",
  },
 // { name: "Twitter", icon: Twitter, href: "YOUR_TWITTER_LINK_HERE" },
];

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl text-brand-accent">مجد</h3>
            <p className="text-sm text-gray-300">
              Discover luxury fashion that speaks to your style. From elegant women&apos;s wear to sophisticated men&apos;s collections, premium kids&apos; clothing, and exquisite perfumes.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-accent flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4">Categories</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-brand-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-brand-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-300 mb-4">
              Subscribe to receive updates on new arrivals, special offers, and exclusive promotions.
            </p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 h-11 px-4 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>
              <CustomButton variant="secondary" size="md" className="w-full">
                <Mail className="w-4 h-4" />
                Subscribe
              </CustomButton>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300 text-center md:text-left">
              © {new Date().getFullYear()} Majd. All rights reserved.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                ✓ Free Shipping Over $100
              </span>
              <span className="flex items-center gap-2">
                ✓ 30-Day Returns
              </span>
              <span className="flex items-center gap-2">
                ✓ Secure Checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
