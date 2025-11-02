import * as React from "react";
import { AdminSidebar } from "../../components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-brand-cream">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64">
        {children}
      </div>
    </div>
  );
}
