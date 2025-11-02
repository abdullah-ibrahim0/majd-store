import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Majd - Luxury Fashion & Style",
  description: "Discover luxury fashion at Majd. Shop women's clothing, men's clothing, kids' fashion, and premium perfumes. Style with glory.",
  keywords: "luxury fashion, women's clothing, men's fashion, kids clothing, perfumes, Majd",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
