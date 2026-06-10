import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  User,
  CreditCard,
  CalendarCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  X,
  LogOut,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, logout } from '../../features/auth/authSlice';
import { getMySubscriptionsAPI } from '../../features/subscription/subscriptionAPI';
import { logoutAPI } from '../../features/auth/authAPI';
import Skeleton from '../../components/Common/Skeleton';

// ─────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    Active:    'bg-green-100 text-green-700',
    Pending:   'bg-yellow-100 text-yellow-700',
    Scheduled: 'bg-blue-100 text-blue-700',
    Expired:   'bg-gray-100 text-gray-600',
    Cancelled: 'bg-red-100 text-red-600',
  };
  const icons = {
    Active:    <CheckCircle size={12} />,
    Pending:   <Clock size={12} />,
    Scheduled: <Calendar size={12} />,
    Expired:   <AlertTriangle size={12} />,
    Cancelled: <X size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.Pending}`}>
      {icons[status]}
      {status}
    </span>
  );
};

// ─────────────────────────────────────────
// Days remaining badge
// ─────────────────────────────────────────
const DaysRemaining = ({ endDate }) => {
  const days = Math.ceil(
    (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) return <span className="text-xs text-red-500">Expired</span>;
  if (days <= 7) return <span className="text-xs text-[#C4956A] font-medium">{days} days left</span>;
  return <span className="text-xs text-green-600 font-medium">{days} days left</span>;
};

// ─────────────────────────────────────────
// Main Member Dashboard
// ─────────────────────────────────────────
const MemberDashboard = () => {
  const user     = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-subscriptions'],
    queryFn:  async () => {
      const res = await getMySubscriptionsAPI(1, 50);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const activeSub = data?.data?.find((s) => s.status === 'Active');

  const handleLogout = async () => {
    try { await logoutAPI(); } catch {}
    finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FAF7F4]"
    >
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#ECE4DC] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1C1C1C] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">ID</span>
          </div>
          <span
            className="text-lg font-bold text-[#2A1F1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            IronDesk
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C4956A] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-[#2A1F1A]">{user?.name}</p>
              <p className="text-xs text-[#6B6B6B]">Member</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[#6B6B6B] hover:bg-[#FAF7F4] hover:text-red-500 transition-colors cursor-pointer border border-[#ECE4DC]"
          >
            <LogOut size={16} />
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Welcome */}
        <div>
          <h1
            className="text-3xl font-black text-[#2A1F1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Welcome back,{' '}
            <span className="text-[#C4956A]">
              {user?.name?.split(' ')[0]}
            </span>
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Here's an overview of your gym membership
          </p>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Plan */}
          <div className="bg-[#1C1C1C] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={18} className="text-[#C4956A]" />
              <p className="text-xs text-white/60">Active Plan</p>
            </div>
            <p
              className="text-2xl font-black"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {activeSub ? activeSub.planName : 'No active plan'}
            </p>
            {activeSub && (
              <p className="text-xs text-white/60 mt-1">
                ₹{activeSub.planPrice?.toLocaleString()} / {activeSub.planDurationDays} days
              </p>
            )}
          </div>

          {/* Expiry */}
          <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CalendarCheck size={18} className="text-[#C4956A]" />
              <p className="text-xs text-[#6B6B6B]">Expiry Date</p>
            </div>
            <p
              className="text-2xl font-black text-[#2A1F1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {activeSub
                ? new Date(activeSub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : '—'}
            </p>
            {activeSub && (
              <div className="mt-1">
                <DaysRemaining endDate={activeSub.endDate} />
              </div>
            )}
          </div>

          {/* Total Subscriptions */}
          <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-[#C4956A]" />
              <p className="text-xs text-[#6B6B6B]">Total Subscriptions</p>
            </div>
            <p
              className="text-2xl font-black text-[#2A1F1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {data?.totalCount ?? '—'}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-1">All time</p>
          </div>
        </div>

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-[#C4956A]" />
            <h2
              className="text-base font-black text-[#2A1F1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              My Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Full Name', value: user?.name  },
              { label: 'Email',     value: user?.email },
              { label: 'Role',      value: user?.role  },
            ].map((field) => (
              <div key={field.label} className="bg-[#FAF7F4] rounded-xl px-4 py-3 border border-[#ECE4DC]">
                <p className="text-xs text-[#6B6B6B] mb-1">{field.label}</p>
                <p className="text-sm font-semibold text-[#2A1F1A]">{field.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Subscriptions ── */}
        <div className="bg-white rounded-2xl border border-[#ECE4DC] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[#ECE4DC]">
            <CreditCard size={18} className="text-[#C4956A]" />
            <h2
              className="text-base font-black text-[#2A1F1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              My Subscriptions
            </h2>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-4 px-6 py-3 border-b border-[#ECE4DC] bg-[#FAF7F4]">
            {['Plan', 'Start Date', 'End Date', 'Status'].map((h) => (
              <p key={h} className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">{h}</p>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col gap-3 p-6">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle size={32} className="text-[#C4956A] mx-auto mb-2" />
                <p className="text-sm text-[#2A1F1A] font-medium">Failed to load subscriptions</p>
              </div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && data?.data?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 bg-[#FAF7F4] rounded-2xl flex items-center justify-center">
                <CreditCard size={24} className="text-[#C4956A]" />
              </div>
              <p className="text-sm font-medium text-[#2A1F1A]">No subscriptions yet</p>
              <p className="text-xs text-[#6B6B6B]">Contact your gym admin to get started</p>
            </div>
          )}

          {/* Rows */}
          {!isLoading && !isError && data?.data?.map((sub) => (
            <div
              key={sub.id}
              className="grid grid-cols-4 px-6 py-4 border-b border-[#ECE4DC] last:border-0 hover:bg-[#FAF7F4] transition-colors items-center"
            >
              <div>
                <p className="text-sm font-medium text-[#2A1F1A]">{sub.planName}</p>
                <p className="text-xs text-[#6B6B6B]">₹{sub.planPrice?.toLocaleString()}</p>
              </div>
              <p className="text-sm text-[#6B6B6B]">
                {new Date(sub.startDate).toLocaleDateString('en-IN')}
              </p>
              <div>
                <p className="text-sm text-[#6B6B6B]">
                  {new Date(sub.endDate).toLocaleDateString('en-IN')}
                </p>
                {sub.status === 'Active' && (
                  <DaysRemaining endDate={sub.endDate} />
                )}
              </div>
              <StatusBadge status={sub.status} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;