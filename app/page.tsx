"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    scratchCardsSent: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/stats");

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalUsers: data.totalUsers,
            activeUsers: data.activeUsers,
            scratchCardsSent: data.totalScratchCards || 0
          });
          setActivities(data.recentActivity);
          setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh every minute
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 font-medium mt-1">Operational Command Center & Analytics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Last Refreshed: {lastRefreshed || "Updating..."}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Total Members"
          value={stats.totalUsers}
          icon={<UserIcon />}
          color="indigo"
          trend="+12% from last month"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeUsers}
          icon={<ActiveIcon />}
          color="emerald"
          trend="+5.4% this week"
        />
        <StatCard
          title="Cards Issued"
          value={stats.scratchCardsSent}
          icon={<CardIcon />}
          color="blue"
          trend="+8% from yesterday"
        />
      </div>

      {/* Recent Activity Feed */}
      <div className="relative">
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white/30">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Live Activity Feed</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Real-time system events</p>
            </div>
            <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200 transition-transform hover:scale-105 cursor-default">
              Live Updates
            </span>
          </div>

          <div className="p-10">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-r-transparent mb-4"></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syndicating Events...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 italic font-medium">Clear history. No events recorded.</p>
              </div>
            ) : (
              <div className="relative space-y-8">
                {/* Timeline Line */}
                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500/20 via-slate-200 to-transparent" />

                {activities.map((activity, idx) => (
                  <div key={activity._id || idx} className="relative pl-14 group">
                    {/* Activity Dot */}
                    <div className={`absolute left-4 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-md z-10 transition-transform group-hover:scale-125 ${getActivityDotColor(activity.action)}`} />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-5 rounded-2xl bg-white/50 border border-transparent hover:border-white hover:bg-white/80 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-0.5">{activity.action}</p>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-2xl">{activity.details}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter mb-0.5">{activity.adminName}</p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {getTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${getActivityColor(activity.action)}`}>
                          {getActivityIcon(activity.action)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100"
  };

  return (
    <div 
      className="group relative bg-white p-8 rounded-[2rem] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:translate-y-[-8px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:border-indigo-400/30 transition-all duration-400 cubic-bezier-[0.4,0,0.2,1] will-change-transform overflow-hidden cursor-default flex flex-col h-[200px]"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-auto border ${colors[color]} shadow-sm transition-transform group-hover:scale-110 duration-500`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
          <h3 className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>
      </div>
    </div>
  );
}

function UserIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>; }
function ActiveIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function CardIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>; }

function getTimeAgo(date: string | Date) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return past.toLocaleDateString();
}

function getActivityDotColor(action: string) {
  if (action.includes('Created')) return "bg-emerald-500 shadow-emerald-200";
  if (action.includes('Sent')) return "bg-blue-500 shadow-blue-200";
  if (action.includes('Deleted')) return "bg-red-500 shadow-red-200";
  return "bg-slate-500 shadow-slate-200";
}

function getActivityColor(action: string) {
  if (action.includes('Created')) return "bg-emerald-50 text-emerald-600";
  if (action.includes('Sent')) return "bg-blue-50 text-blue-600";
  if (action.includes('Deleted')) return "bg-red-50 text-red-600";
  return "bg-slate-50 text-slate-600";
}

function getActivityIcon(action: string) {
  if (action.includes('Created')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
  if (action.includes('Sent')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
  if (action.includes('Deleted')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}
