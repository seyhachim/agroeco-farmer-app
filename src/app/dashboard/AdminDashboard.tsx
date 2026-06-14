import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SignOutButton from "@/app/dashboard/sign-out-button";
import KpiChart, { KpiDatum } from "@/app/dashboard/KpiChart";
import UserManagement from "@/app/dashboard/UserManagement";

interface AdminDashboardProps {
  displayName: string;
  userId: string;
  kpis: KpiDatum[];
}

export default function AdminDashboard({
  displayName,
  userId,
  kpis,
}: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-6 text-white">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm opacity-90 hover:opacity-100 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="opacity-90 text-sm mt-1">Administrator Access</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Role: Admin
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Welcome
              </label>
              <p className="text-gray-800 font-medium text-lg">
                {displayName}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Supabase User ID
              </label>
              <p className="text-gray-500 font-mono text-xs break-all">
                {userId}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Platform Overview
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center"
                >
                  <p className="text-2xl font-bold text-gray-900">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <KpiChart data={kpis} />
            </div>
          </div>

          <UserManagement currentUserId={userId} />

          <div className="pt-4 border-t border-gray-100">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
