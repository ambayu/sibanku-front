"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { UserCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type MenuItem = {
  name: string;
  path?: string;
  children?: { name: string; path: string }[];
};

type MenuGroup = {
  label?: string;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "Menu Utama",
    items: [
      { name: "Dashboard", path: "/admin" },
      {
        name: "Perkara",
        path: "/admin/perkara"

      },

      {
        name: "Banding",
        path: "/admin/banding"

      },
      {
        name: "Kasasi", 
        path: "/admin/kasasi"

      },
      {
        name: "Peninjauan Kembali",
        path: "/admin/peninjauan-kembali"


      },

      { name: "Laporan", path: "/admin/laporan" },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        name: "User Management",
        children: [{ name: "Daftar User", path: "/admin/users" }],
      },
      {
        name: "Role and Permission",
        children: [
          { name: "Permission", path: "/admin/permission" },
          { name: "Role", path: "/admin/role" },
        ],
      },
    ],
  },
];

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === path;
    return pathname.startsWith(path);
  };

  const getSidebarWidth = () => {
    if (isMobileOpen) return "w-[250px]";
    if (isExpanded || isHovered) return "w-[250px]";
    return "w-[80px]";
  };

  const shouldShowText = isExpanded || isHovered || isMobileOpen;

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full 
        bg-[#0B5C4D] text-white 
        flex flex-col justify-between transition-all duration-300 z-50 
        ${getSidebarWidth()}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Sidebar navigasi"
    >
      {/* Header */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">SB</span>
          </div>
          {shouldShowText && (
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold truncate">SIBANKUM</h1>
              <p className="text-xs text-white/70 truncate">
                Sistem Informasi Bantuan Hukum
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 flex flex-col gap-3 pl-3 pr-0 py-3" aria-label="Menu utama">
        {menuGroups.map((group, i) => (
          <div key={i} className="flex flex-col gap-1">
            {shouldShowText && group.label && (
              <span className="text-[11px] uppercase font-semibold text-white/60 px-2 mb-1 tracking-wide">
                {group.label}
              </span>
            )}

            {group.items.map((item) => {
              const active = item.path ? isActive(item.path) : false;
              const isOpen = openDropdown === item.name;

              if (item.children) {
                return (
                  <div key={item.name} className="flex flex-col">
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-l-full transition-all duration-200 w-full text-left text-sm
                        ${isOpen || active
                          ? "bg-[#fffcf1] text-[#0B5C4D] font-medium"
                          : "text-white/90 hover:bg-white/10"
                        }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full flex-shrink-0 transition-colors
                          ${isOpen || active ? "bg-orange-500" : "bg-orange-400/70"}`}
                      />
                      {shouldShowText && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {isOpen ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </>
                      )}
                    </button>

                    {/* Dropdown submenu */}
                    {isOpen && shouldShowText && (
                      <div className="ml-6 flex flex-col gap-1 py-1.5">
                        {item.children.map((child) => {
                          const childActive = isActive(child.path);
                          return (
                            <Link
                              key={child.name}
                              href={child.path}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-l-full transition-all duration-200 text-xs
                                ${childActive
                                  ? "bg-[#fffcf1] text-[#0B5C4D] font-medium"
                                  : "text-white/80 hover:bg-white/10"
                                }`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-full flex-shrink-0 transition-colors
                                  ${childActive ? "bg-orange-500" : "bg-orange-400/70"}`}
                              />
                              <span>{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Menu biasa
              return (
                <Link
                  key={item.name}
                  href={item.path!}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-l-full transition-all duration-200 text-sm
                    ${active
                      ? "bg-[#fffcf1] text-[#0B5C4D] font-medium"
                      : "text-white/90 hover:bg-white/10"
                    }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={`h-4 w-4 rounded-full flex-shrink-0 transition-colors
                      ${active ? "bg-orange-500" : "bg-orange-400/70"}`}
                  />
                  <span
                    className={`whitespace-nowrap transition-all duration-300 overflow-hidden
                      ${shouldShowText ? "opacity-100 max-w-full" : "opacity-0 max-w-0"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <UserCircle className="h-7 w-7 text-white/80 flex-shrink-0" />
          {shouldShowText && (
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs truncate">PEMERINTAH KOTA MEDAN</p>
              <p className="text-[11px] text-white/70 truncate">(Pengguna Lainnya)</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
