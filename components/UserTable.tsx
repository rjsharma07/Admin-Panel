"use client";

import { FileUp, Edit2, Trash2, Ticket } from "lucide-react";

interface UserTableProps {
  users: any[];
  isLoading: boolean;
  sortBy: string;
  order: string;
  handleSort: (field: string) => void;
  handleEditClick: (user: any) => void;
  handleDelete: (userId: string) => void;
  onIssueReward: (user: any) => void;
  onUploadPolicy: (user: any) => void;
}

export default function UserTable({
  users,
  isLoading,
  sortBy,
  order,
  handleSort,
  handleEditClick,
  handleDelete,
  onIssueReward,
  onUploadPolicy
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-r-transparent mb-4"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Users...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left min-w-[800px] border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/30">
            <th
              onClick={() => handleSort("name")}
              className="sticky left-0 z-20 bg-white/95 backdrop-blur-sm px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] cursor-pointer hover:bg-slate-100 transition-colors group shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center gap-2">
                Full Name
                {sortBy === "name" && (
                  <span className="text-indigo-600">{order === "asc" ? "↑" : "↓"}</span>
                )}
                {sortBy !== "name" && (
                  <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>
                )}
              </div>
            </th>
            <th
              onClick={() => handleSort("email")}
              className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] cursor-pointer hover:bg-slate-50/50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                Email
                {sortBy === "email" && (
                  <span className="text-indigo-600">{order === "asc" ? "↑" : "↓"}</span>
                )}
                {sortBy !== "email" && (
                  <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>
                )}
              </div>
            </th>
            <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Phone</th>
            {/* <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Role</th> */}
            <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Status</th>
            <th
              onClick={() => handleSort("createdAt")}
              className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] cursor-pointer hover:bg-slate-50/50 transition-colors group text-right"
            >
              <div className="flex items-center justify-end gap-2">
                Joined Date
                {sortBy === "createdAt" && (
                  <span className="text-indigo-600">{order === "asc" ? "↑" : "↓"}</span>
                )}
                {sortBy !== "createdAt" && (
                  <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>
                )}
              </div>
            </th>
            <th className="sticky right-0 z-20 bg-white/95 backdrop-blur-sm px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {users?.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                No matching members found.
              </td>
            </tr>
          ) : (
            users?.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/40 transition-colors group">
                <td className="sticky left-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4.5 text-sm font-bold text-slate-900 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50/80 transition-colors">{user.name}</td>
                <td className="px-6 py-4.5 text-sm text-slate-500 font-medium">{user.email}</td>
                <td className="px-6 py-4.5 text-xs text-slate-400 font-bold tracking-tight">{user.phoneNumber || "—"}</td>
                {/* <td className="px-6 py-4.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </td> */}
                <td className="px-6 py-4.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-slate-50 text-slate-500 border-slate-100"
                    }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4.5 text-right">
                  <span className="text-xs text-slate-400 font-bold">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : "—"}
                  </span>
                </td>
                <td className="sticky right-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4.5 text-right shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] bg-slate-50/5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex justify-end gap-1.5 opacity-100 transition-opacity">
                    <button
                      onClick={() => onUploadPolicy(user)}
                      className="p-2 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                      title="Upload Policy"
                    >
                      <FileUp size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => onIssueReward(user)}
                      className="p-2 text-amber-600 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                      title="Scratch Card"
                    >
                      <Ticket size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 text-slate-500 bg-slate-50 border border-slate-100 rounded-lg hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all flex items-center justify-center shadow-sm"
                      title="Edit Profile"
                    >
                      <Edit2 size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 text-slate-400 bg-slate-50 border border-slate-100 rounded-lg hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                      title="Delete User"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
