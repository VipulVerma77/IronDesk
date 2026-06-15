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
import StatCard from './StatCard';
import RevenueHeroCard from './RevenueHeroCard';





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
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  console.log(data)

  return (
    <div className="flex flex-col gap-8">

      {/* ── Always render heading immediately ── */}
      <div>
        <h1
          className="text-3xl font-black text-[#2A1F1A]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Here's what's happening at your gym today
        </p>
      </div>

      {/* ── Loading — skeleton only for data ── */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {isError && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle size={40} className="text-[#C4956A] mx-auto mb-3" />
            <p className="text-[#2A1F1A] font-semibold">Failed to load dashboard</p>
            <p className="text-sm text-[#6B6B6B]">Please refresh the page</p>
          </div>
        </div>
      )}

      {/* ── Data ── */}
      {!isLoading && !isError && (
        <>
          {/* Member Stats */}
          <div>
            <p className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide mb-3">Members</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total" value={data.memberStats?.total} icon={Users} color="bg-[#1C1C1C]" />
              <StatCard title="Active" value={data.memberStats?.active} icon={UserCheck} color="bg-green-500" />
              <StatCard title="Inactive" value={data.memberStats?.inactive} icon={UserX} color="bg-[#C4956A]" />
              <StatCard title="Blocked" value={data.memberStats?.blocked} icon={ShieldOff} color="bg-red-400" />
            </div>
          </div>

          {/* Revenue Stats */}
          <div>
            <p className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide mb-3">Revenue</p>
            <div className=" mb-6">
              <RevenueHeroCard
                totalRevenue={data.revenueStats?.totalRevenue}
                monthlyRevenue={data.revenueStats?.thisMonthRevenue}
                pendingRevenue={data.revenueStats?.pendingRevenue}
              />
            </div>
          </div>

          {/* Attendance Stats */}
          <div>
            <p className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide mb-3">Attendance</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StatCard title="Today" value={data.attendanceStats?.todayCheckIns} icon={CalendarCheck} color="bg-[#1C1C1C]" />
              <StatCard title="Currently Inside" value={data.attendanceStats?.currentlyInside} icon={Activity} color="bg-green-500" />
            </div>
          </div>

          {/* Bottom section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expiring Soon */}
            <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-[#C4956A]" />
                <h3 className="text-sm font-bold text-[#2A1F1A]">Expiring Soon</h3>
                <span className="ml-auto text-xs bg-[#C4956A]/10 text-[#C4956A] px-2 py-0.5 rounded-full">Next 7 days</span>
              </div>
              {data.expiringSoon?.length === 0 ? (
                <p className="text-sm text-[#6B6B6B] text-center py-6">No expiring subscriptions</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.expiringSoon?.map((item) => (
                    <div key={item.memberId} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#2A1F1A]">{item.memberName}</p>
                        <p className="text-xs text-[#6B6B6B]">{item.planName}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.daysLeft <= 2 ? 'bg-red-100 text-red-600' : 'bg-[#C4956A]/10 text-[#C4956A]'
                        }`}>
                        {item.daysLeft}d left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-[#1C1C1C]" />
                <h3 className="text-sm font-bold text-[#2A1F1A]">Recent Payments</h3>
              </div>
              {data.recentPayments?.length === 0 ? (
                <p className="text-sm text-[#6B6B6B] text-center py-6">No recent payments</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.recentPayments?.map((payment) => (
                    <div key={payment.paymentId} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#2A1F1A]">{payment.memberName}</p>
                        <p className="text-xs text-[#6B6B6B]">{payment.planName}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        ₹{payment.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Members */}
            <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus size={18} className="text-green-500" />
                <h3 className="text-sm font-bold text-[#2A1F1A]">New Members</h3>
                <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Last 7 days</span>
              </div>
              {data.newMembers?.length === 0 ? (
                <p className="text-sm text-[#6B6B6B] text-center py-6">No new members</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.newMembers?.map((member) => (
                    <div key={member.memberId} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C4956A] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {member.fullName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2A1F1A]">{member.fullName}</p>
                        <p className="text-xs text-[#6B6B6B]">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;