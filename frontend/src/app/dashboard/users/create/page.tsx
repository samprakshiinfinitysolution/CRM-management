'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import { useCreateUserMutation } from '@/store';
import { handleApiError } from '@/lib/errorHandler';

export default function CreateUserPage() {
  const router = useRouter();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.SALES_EXECUTIVE,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      const res = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password || undefined,
        role: formData.role,
      }).unwrap();

      toast.success(res.message || 'Staff member added successfully!');
      router.push('/dashboard/users');
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/users"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span>Add Staff Member</span>
            </h1>
            <p className="text-xs text-slate-500">
              Provision account access for a new Sales Executive or Team Leader
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col gap-5"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enterprise Work Email <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john.doe@leadflow.io"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Password (Optional)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank for default (LeadFlow#2026)"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            />

          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            >
              <option value={UserRole.SALES_EXECUTIVE}>Sales Executive (SE/REP)</option>
              <option value={UserRole.TEAM_LEADER}>Team Leader (TL/OPS)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/users"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
