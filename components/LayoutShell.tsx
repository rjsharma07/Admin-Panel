"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMounted && !isLoginPage) {
    return <div className="h-screen w-screen bg-[#f8fafc]" />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {!isLoginPage && (
        <>
          {/* Tablet/Mobile Overlay Backdrop (below 992px) */}
          <div 
            onClick={() => setIsCollapsed(true)}
            className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden transition-opacity duration-300 ${
              !isCollapsed ? "opacity-100 block" : "opacity-0 hidden"
            }`}
          />

          <Sidebar 
            isCollapsed={isCollapsed} 
            setIsCollapsed={setIsCollapsed} 
          />
        </>
      )}

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out h-full overflow-y-auto overflow-x-hidden ${
          isLoginPage ? "" : isCollapsed ? "ml-0 lg:ml-20" : "ml-0 lg:ml-64"
        }`}
      >
        {/* Hamburger Toggle (Visible below 992px or when collapsed on desktop) */}
        {!isLoginPage && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`lg:hidden fixed top-5 left-5 z-[40] p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-600 hover:bg-slate-50 transition-all ${
              !isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <main className={`flex-1 w-full max-w-full ${isLoginPage ? "" : "p-0"}`}>
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
