"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

function AdminPageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/auth/login");
          return;
        }

        // Fetch user profile to check role
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error || !profile || profile.role !== "admin") {
          router.push("/auth/login");
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

export default AdminPageWrapper;
