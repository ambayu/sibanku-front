"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { data: session, status } = useSession();
  const router = useRouter();

  // 🔒 Redirect kalau belum login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // biar gak sempat render sebelum redirect
  }

  const mainMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[250px]"
      : "lg:ml-[80px]";

  return (

      <div className="min-h-screen flex bg-[#FFFCF1] ">
        {/* Sidebar */}
        <AppSidebar />

        {/* Konten utama */}
        <div className={`flex-1 transition-all duration-300 ${mainMargin}`}>
          <AppHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>

  );
}
