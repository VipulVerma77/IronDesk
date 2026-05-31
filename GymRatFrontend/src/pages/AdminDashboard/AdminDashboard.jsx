import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
// Reusable stat card
// ─────────────────────────────────────────
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4 }}
    className="
      group
      relative
      overflow-hidden
      bg-white
      rounded-3xl
      p-6
      border
      border-[#ECE4DC]
      shadow-sm
      hover:shadow-xl
      transition-all
      duration-300
    "
  >
    {/* Premium top gradient */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C4956A] via-[#D9B08C] to-[#C4956A]" />

    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6B6B6B] mb-2">
          {title}
        </p>

        <p
          className="text-4xl font-black text-[#2A1F1A] tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {value ?? "—"}
        </p>

        <div className="flex items-center gap-1 mt-3">
          <TrendingUp
            size={12}
            className="text-green-500"
          />

          <span className="text-xs font-medium text-green-500">
            Active Growth
          </span>
        </div>
      </div>

      <div
        className={`
          w-14
          h-14
          rounded-2xl
          flex
          items-center
          justify-center
          shadow-lg
          group-hover:scale-110
          transition-all
          duration-300
          ${color}
        `}
      >
        <Icon
          size={24}
          className="text-white"
        />
      </div>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────
// Section heading
// ─────────────────────────────────────────
const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2
      className="text-lg font-black text-[#2A1F1A]"
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      {title}
    </h2>
    {subtitle && <p className="text-xs text-[#6B6B6B]">{subtitle}</p>}
  </div>
);

// ─────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#ECE4DC] rounded-2xl ${className}`} />
);

const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn:  async () => {
      const res = await getDashboardSummaryAPI();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // ── Loading state ──
  if (isLoading) {
    return (
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
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle size={40} className="text-[#C4956A] mx-auto mb-3" />
          <p className="text-[#2A1F1A] font-semibold">Failed to load dashboard</p>
          <p className="text-sm text-[#6B6B6B]">Please refresh the page</p>
        </div>
      </div>
    );
  }

  const { members, revenue, attendance, expiringSoon, recentPayments, newMembers } = data;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Welcome ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          className="text-3xl font-black text-[#2A1F1A]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Here's what's happening at your gym today
        </p>
      </motion.div>

      {/* ── Member Stats ── */}
      <div>
        <SectionTitle title="Members" subtitle="Current member breakdown" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Members"    value={members?.total}    icon={Users}     color="bg-[#1C1C1C]" delay={0.1} />
          <StatCard title="Active"           value={members?.active}   icon={UserCheck} color="bg-green-500"  delay={0.2} />
          <StatCard title="Inactive"         value={members?.inactive} icon={UserX}     color="bg-[#C4956A]"  delay={0.3} />
          <StatCard title="Blocked"          value={members?.blocked}  icon={ShieldOff} color="bg-red-400"    delay={0.4} />
        </div>
      </div>

      {/* ── Revenue Stats ── */}
      <div>
        <SectionTitle title="Revenue" subtitle="Payment overview" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard title="Total Revenue"    value={`₹${revenue?.total?.toLocaleString()}`}     icon={DollarSign}  color="bg-[#1C1C1C]" delay={0.1} />
          <StatCard title="This Month"       value={`₹${revenue?.thisMonth?.toLocaleString()}`} icon={TrendingUp}  color="bg-green-500"  delay={0.2} />
          <StatCard title="Pending"          value={`₹${revenue?.pending?.toLocaleString()}`}   icon={Clock}       color="bg-[#C4956A]"  delay={0.3} />
        </div>
      </div>

      {/* ── Attendance Stats ── */}
      <div>
        <SectionTitle title="Attendance" subtitle="Today's activity" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatCard title="Today's Attendance" value={attendance?.today}          icon={CalendarCheck} color="bg-[#1C1C1C]" delay={0.1} />
          <StatCard title="Currently Inside"   value={attendance?.currentlyInside} icon={Activity}      color="bg-green-500"  delay={0.2} />
        </div>
      </div>

      {/* ── Bottom section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Expiring Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-[#C4956A]" />
            <h3 className="text-sm font-bold text-[#2A1F1A]">Expiring Soon</h3>
            <span className="ml-auto text-xs bg-[#C4956A]/10 text-[#C4956A] px-2 py-0.5 rounded-full">
              Next 7 days
            </span>
          </div>

          {expiringSoon?.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-6">No expiring subscriptions</p>
          ) : (
            <div className="flex flex-col gap-3">
              {expiringSoon?.map((item) => (
                <div key={item.memberId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#2A1F1A]">{item.memberName}</p>
                    <p className="text-xs text-[#6B6B6B]">{item.planName}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.daysLeft <= 2
                      ? 'bg-red-100 text-red-600'
                      : 'bg-[#C4956A]/10 text-[#C4956A]'
                  }`}>
                    {item.daysLeft}d left
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-[#1C1C1C]" />
            <h3 className="text-sm font-bold text-[#2A1F1A]">Recent Payments</h3>
          </div>

          {recentPayments?.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-6">No recent payments</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentPayments?.map((payment) => (
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
        </motion.div>

        {/* New Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={18} className="text-green-500" />
            <h3 className="text-sm font-bold text-[#2A1F1A]">New Members</h3>
            <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
              Last 7 days
            </span>
          </div>

          {newMembers?.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-6">No new members</p>
          ) : (
            <div className="flex flex-col gap-3">
              {newMembers?.map((member) => (
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
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;