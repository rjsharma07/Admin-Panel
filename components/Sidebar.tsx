"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  // Auto-collapse based on the new 992px Tablet/Laptop threshold
  useEffect(() => {
    const checkViewport = () => {
      if (window.innerWidth < 992) {
        setIsCollapsed(true);
      }
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [setIsCollapsed]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: "Users",
      path: "/users",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <aside
      className={`bg-[#0f172a] fixed inset-y-0 left-0 z-[60] flex flex-col border-r border-slate-800/50 transition-all duration-300 ease-in-out h-screen ${isCollapsed
          ? "w-20 -translate-x-full lg:translate-x-0"
          : "w-64 translate-x-0 shadow-2xl lg:shadow-none"
        }`}
    >
      <div className="flex flex-col h-full justify-between pb-6">
        <div>
          {/* Brand & Toggle Container */}
          <div className="h-20 w-full flex items-center px-4 relative shrink-0">
            <div className={`flex items-center w-full transition-all duration-300 ${isCollapsed ? "lg:justify-center" : "justify-start pl-2 gap-3"}`}>
              {/* Logo Icon */}
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0 transition-all duration-300 flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              {/* Brand Text */}
              <span className={`text-[15px] font-black text-white tracking-widest whitespace-nowrap transition-all duration-300 min-w-0 ${isCollapsed ? "opacity-0 absolute scale-75 pointer-events-none" : "opacity-100 relative scale-100"
                }`}>
                ADMIN PANEL
              </span>
            </div>

            {/* Desktop Toggle Button (Visible 992px+) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex absolute -right-3 top-7 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full items-center justify-center text-white hover:bg-indigo-600 transition-all shadow-xl z-[60] active:scale-90"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <svg
                className={`w-3 h-3 transition-transform duration-500 ${isCollapsed ? "" : "rotate-180"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Tablet/Mobile Close Button (Visible < 992px) */}
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className={`space-y-1.5 mt-4 transition-all duration-300 ${isCollapsed ? "lg:px-3" : "px-4"}`}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => { if (window.innerWidth < 992) setIsCollapsed(true); }}
                  title={isCollapsed ? item.name : ""}
                  className={`flex items-center px-4 py-3 text-sm font-bold transition-all duration-200 group relative rounded-xl ${isCollapsed ? "lg:justify-center" : "gap-3"
                    } ${isActive ? "text-white" : "text-slate-400 hover:text-white"
                    }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-indigo-600/10 rounded-xl" />
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                  )}

                  <div className={`transition-all duration-200 shrink-0 ${isActive ? "opacity-100 scale-110" : "opacity-50 group-hover:opacity-100"
                    }`}>
                    {item.icon}
                  </div>

                  <span className={`relative z-10 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "opacity-0 absolute scale-95" : "opacity-100 relative scale-100"
                    }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User & Logout */}
        <div className={`px-4 mt-auto border-t border-slate-800/50 pt-6 space-y-4 transition-all duration-300 ${isCollapsed ? "lg:items-center" : ""}`}>
          <div className={`flex items-center gap-3 px-2 ${isCollapsed ? "lg:justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-300 border border-slate-700/50 shrink-0 shadow-inner">
              AD
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "opacity-0 absolute scale-95" : "opacity-100 relative scale-100"
              }`}>
              <p className="text-sm font-bold text-white truncate">Admin User</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Super Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sign Out" : ""}
            className={`w-full flex items-center py-3 text-sm font-bold transition-all group rounded-xl ${isCollapsed ? "lg:justify-center" : "px-4 gap-3 text-slate-400 hover:text-rose-400 hover:bg-rose-600/5"
              }`}
          >
            <div className={`transition-opacity duration-200 ${isCollapsed ? "lg:text-slate-400 lg:group-hover:text-rose-400" : "opacity-50 group-hover:opacity-100"
              }`}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "opacity-0 absolute scale-95" : "opacity-100 relative scale-100"
              }`}>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
