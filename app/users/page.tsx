"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import Toast, { ToastType } from "@/components/Toast";

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [selectedUserForCard, setSelectedUserForCard] = useState<any>(null);
  const [isScratchCardModalOpen, setIsScratchCardModalOpen] = useState(false);
  const [cardAmount, setCardAmount] = useState("");
  const [isIssuingCard, setIsIssuingCard] = useState(false);

  const [toast, setToast] = useState<{ show: boolean, message: string, type: ToastType }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  // Real Data States
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination, Search & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Debounce Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
    setCurrentPage(1); // Reset to page 1 on sort change
  };

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    isDestructive: true,
    confirmText: "Confirm",
    cancelText: "Cancel"
  });

  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "User",
    status: "Active"
  });

  const validateForm = () => {
    if (!formData.name.trim()) return "Full Name is required";
    if (formData.name.trim().length < 2) return "Name must be at least 2 characters long";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address";

    if (formData.phoneNumber) {
      if (!/^\d+$/.test(formData.phoneNumber)) return "Phone number must contain only digits";
      if (formData.phoneNumber.length < 10 || formData.phoneNumber.length > 15) {
        return "Phone number must be between 10 and 15 digits";
      }
    }

    return null;
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const url = `/api/users?page=${currentPage}&limit=10&search=${debouncedSearch}&sortBy=${sortBy}&order=${order}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.totalUsers || 0);
      } else {
        console.error("API failed:", data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch, sortBy, order]);

  const handleEditClick = (user: any) => {
    setFormError(null);
    setIsEditing(true);
    setEditingUserId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    const user = users.find(u => u._id === userId);

    setConfirmModal({
      isOpen: true,
      title: "Delete User?",
      message: `Are you sure you want to permanently delete ${user?.name || "this user"}? This action cannot be undone.`,
      isDestructive: true,
      confirmText: "Delete User",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeConfirm();
        try {
          const response = await fetch(`/api/users?id=${userId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            fetchUsers();
          } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || "Failed to delete user"}`);
          }
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    const url = isEditing ? `/api/users?id=${editingUserId}` : "/api/users";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingUserId(null);
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          role: "User",
          status: "Active"
        });
        fetchUsers();
      } else {
        // Handle specific API errors
        if (data.error === "Email Already Exists") {
          setFormError("This email address is already registered.");
        } else if (data.error === "Phone Number Already Exists") {
          setFormError("This phone number is already registered.");
        } else {
          setFormError(data.message || data.error || "Failed to save user");
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setFormError("Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormError(null);
    setIsEditing(false);
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      role: "User",
      status: "Active"
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Organization Members</h1>
          <p className="text-slate-500 font-medium mt-1">Manage, verify, and monitor your system users.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all w-full md:w-80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-r-transparent mb-4"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syndicating User Data...</p>
          </div>
        ) : (
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
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Role</th>
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
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          {user.role}
                        </span>
                      </td>
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
                            onClick={() => {
                              setSelectedUserForCard(user);
                              setIsScratchCardModalOpen(true);
                            }}
                            className="p-2 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                            title="Scratch Card"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-slate-500 bg-slate-50 border border-slate-100 rounded-lg hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all flex items-center justify-center shadow-sm"
                            title="Edit Profile"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-slate-400 bg-slate-50 border border-slate-100 rounded-lg hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                            title="Delete User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
            Page {currentPage} of {totalPages} <span className="mx-2 opacity-50">•</span> {totalUsers} Users Total
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{isEditing ? "Edit User" : "Create New User"}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {isEditing ? "Modify user details below." : "Add a new member to your organization."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit}>
              <div className="p-8 space-y-5">
                {formError && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-red-600">{formError}</p>
                  </div>
                )}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="e.g. 1234567890"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Role */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                      <div className="relative">
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm appearance-none bg-white font-semibold"
                        >
                          <option value="Admin">Admin</option>
                          <option value="User">User</option>
                          <option value="Editor">Editor</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                      <div className="relative">
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm appearance-none bg-white font-semibold"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    isEditing ? "Update User" : "Save User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isScratchCardModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="px-10 py-8 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Issue Reward</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Scratch Card Portal</p>
              </div>
              <button
                onClick={() => setIsScratchCardModalOpen(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-2.5 hover:bg-rose-50 rounded-full group"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Config Content */}
            <div className="p-8 space-y-6">
              {/* Amount Input */}
              <div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold group-focus-within:text-indigo-400 transition-colors">$</div>
                  <input
                    type="number"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-5 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold placeholder:text-slate-300"
                  />
                  <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-indigo-500 transition-colors">
                    Reward Amount
                  </label>
                </div>
                <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5 px-1 font-medium">
                  <svg className="w-4 h-4 text-emerald-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Notification will be sent to both registered Email and Phone number.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsScratchCardModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!cardAmount || isIssuingCard}
                onClick={async () => {
                  if (!cardAmount || isNaN(Number(cardAmount))) {
                    showToast("Please enter a valid amount", "error");
                    return;
                  }

                  setIsIssuingCard(true);
                  try {
                    const response = await fetch("/api/scratch-cards", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: selectedUserForCard._id,
                        amount: Number(cardAmount)
                      })
                    });

                    const data = await response.json();

                    if (response.ok) {
                      setIsScratchCardModalOpen(false);
                      setCardAmount("");
                      showToast(`Successfully issued $${cardAmount} reward! Code: ${data.scratchCard.code}`, "success");
                      fetch("/api/stats"); // Background refresh
                    } else {
                      showToast(data.message || data.error || "Failed to generate card", "error");
                    }
                  } catch (err) {
                    console.error(err);
                    showToast("Network error. Please try again.", "error");
                  } finally {
                    setIsIssuingCard(false);
                  }
                }}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
              >
                {isIssuingCard ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  "Send Reward"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmModal
        {...confirmModal}
        onCancel={closeConfirm}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}
