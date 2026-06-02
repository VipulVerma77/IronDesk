import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldOff,
  DollarSign,
  TrendingUp,
  Clock,
  CalendarCheck,
  Activity,
  AlertTriangle,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import { getDashboardSummaryAPI } from '../../features/dashboard/dashboardAPI';

// ─────────────────────────────────────────
// Stat Card (LCP optimized)
// ─────────────────────────────────────────
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
  loading = false,
}) => (
  <div
    className="
      group relative overflow-hidden bg-white rounded-3xl p-6
      border border-[#ECE4DC] shadow-sm hover:shadow-xl
      transition-all duration-300
    "
  >
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C4956A] via-[#D9B08C] to-[#C4956A]" />

    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6B6B6B] mb-2">
          {title}
        </p>

        {loading ? (
          <div className="h-10 w-24 bg-[#ECE4DC] rounded animate-pulse" />
        ) : (
          <p className="text-4xl font-black text-[#2A1F1A] tracking-tight">
            {value ?? "—"}
          </p>
        )}

        <div className="flex items-center gap-1 mt-3">
          <TrendingUp size={12} className="text-green-500" />
          <span className="text-xs font-medium text-green-500">
            Active Growth
          </span>
        </div>
      </div>

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────
// Section Title
// ─────────────────────────────────────────
const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-lg font-black text-[#2A1F1A]">
      {title}
    </h2>
    {subtitle && <p className="text-xs text-[#6B6B6B]">{subtitle}</p>}
  </div>
);

// ─────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#ECE4DC] rounded-2xl ${className}`} />
);

// ─────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────
const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await getDashboardSummaryAPI();
      return res.data.data || null;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const loading = isLoading || !data;

  // Lazy load heavy bottom section (BIG LCP IMPROVEMENT)
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowBottom(true), 700);
    return () => clearTimeout(t);
  }, []);

  // Memoized safe data
  const dashboard = useMemo(() => {
    if (!data) return {};
    return {
      members: data.members || {},
      revenue: data.revenue || {},
      attendance: data.attendance || {},
      expiringSoon: data.expiringSoon || [],
      recentPayments: data.recentPayments || [],
      newMembers: data.newMembers || [],
    };
  }, [data]);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle size={40} className="text-[#C4956A] mx-auto mb-3" />
          <p className="font-semibold">Failed to load dashboard</p>
          <p className="text-sm text-[#6B6B6B]">Please refresh</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header (FAST LCP ELEMENT) ── */}
      <div>
        <h1 className="text-3xl font-black text-[#2A1F1A]">
          Dashboard
        </h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Here's what's happening at your gym today
        </p>
      </div>

      {/* ── Members (FIRST PAINT PRIORITY) ── */}
      <div>
        <SectionTitle title="Members" subtitle="Current breakdown" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total" value={dashboard.members?.total} icon={Users} color="bg-[#1C1C1C]" loading={loading} />
          <StatCard title="Active" value={dashboard.members?.active} icon={UserCheck} color="bg-green-500" loading={loading} />
          <StatCard title="Inactive" value={dashboard.members?.inactive} icon={UserX} color="bg-[#C4956A]" loading={loading} />
          <StatCard title="Blocked" value={dashboard.members?.blocked} icon={ShieldOff} color="bg-red-400" loading={loading} />
        </div>
      </div>

      {/* ── Revenue ── */}
      <div>
        <SectionTitle title="Revenue" subtitle="Payment overview" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard title="Total" value={`₹${dashboard.revenue?.total?.toLocaleString?.()}`} icon={DollarSign} color="bg-[#1C1C1C]" loading={loading} />
          <StatCard title="Month" value={`₹${dashboard.revenue?.thisMonth?.toLocaleString?.()}`} icon={TrendingUp} color="bg-green-500" loading={loading} />
          <StatCard title="Pending" value={`₹${dashboard.revenue?.pending?.toLocaleString?.()}`} icon={Clock} color="bg-[#C4956A]" loading={loading} />
        </div>
      </div>

      {/* ── Attendance ── */}
      <div>
        <SectionTitle title="Attendance" subtitle="Today's activity" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatCard title="Today" value={dashboard.attendance?.today} icon={CalendarCheck} color="bg-[#1C1C1C]" loading={loading} />
          <StatCard title="Inside" value={dashboard.attendance?.currentlyInside} icon={Activity} color="bg-green-500" loading={loading} />
        </div>
      </div>

    
      {showBottom && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Expiring Soon */}
          <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC]">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-[#C4956A]" />
              <h3 className="font-bold">Expiring Soon</h3>
            </div>

            {(dashboard.expiringSoon || []).length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">No expiring subscriptions</p>
            ) : (
              dashboard?.expiringSoon.map((item) => (
                <div key={item.memberId} className="flex justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{item.memberName}</p>
                    <p className="text-xs text-[#6B6B6B]">{item.planName}</p>
                  </div>
                  <span className="text-xs text-[#C4956A]">
                    {item.daysLeft}d
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Payments */}
          <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC]">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} />
              <h3 className="font-bold">Payments</h3>
            </div>

            {(dashboard.recentPayments || []).length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">No payments</p>
            ) : (
              dashboard.recentPayments.map((p) => (
                <div key={p.paymentId} className="flex justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{p.memberName}</p>
                    <p className="text-xs text-[#6B6B6B]">{p.planName}</p>
                  </div>
                  <span className="font-bold text-green-600">
                    ₹{p.amount}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* New Members */}
          <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC]">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={18} className="text-green-500" />
              <h3 className="font-bold">New Members</h3>
            </div>

            {(dashboard.newMembers || []).length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">No new members</p>
            ) : (
              dashboard.newMembers.map((m) => (
                <div key={m.memberId} className="flex gap-3 py-1">
                  <div className="w-8 h-8 bg-[#C4956A] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">
                      {m.fullName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm">{m.fullName}</p>
                    <p className="text-xs text-[#6B6B6B]">{m.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;