import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  LogOut,
  Settings,
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import { logoutAPI } from '../../features/auth/authAPI';
import { selectUser } from '../../features/auth/authSlice';

const navItems = [
  {
    label: 'Dashboard',
    icon:  LayoutDashboard,
    to:    '/admin',
  },
  {
    label: 'Members',
    icon:  Users,
    to:    '/admin/members',
  },
  {
    label: 'Subscriptions',
    icon:  ClipboardList,
    to:    '/admin/subscriptions',
  },
  {
    label: 'Payments',
    icon:  CreditCard,
    to:    '/admin/payments',
  },
  {
    label: 'Attendance',
    icon:  CalendarCheck,
    to:    '/admin/attendance',
  },
  {
    label: 'Settings',
    icon:  Settings,
    to:    '/admin/settings',
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const user      = useSelector(selectUser);

  const handleLogout = async () => {
    try { await logoutAPI(); } catch {}
    finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const isActive = (to) => location.pathname === to;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen bg-[#FAF7F4] border-r border-[#ECE4DC] flex flex-col overflow-hidden flex-shrink-0"
    >
      {/* ── Top — Logo ── */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#ECE4DC]">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 bg-[#1C1C1C] rounded-lg flex items-center justify-center flex-shrink-0">
                <Dumbbell size={16} className="text-white" />
              </div>
              <span
                className="text-lg font-bold text-[#2A1F1A] whitespace-nowrap"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                IronDesk
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <div className="w-8 h-8 bg-[#1C1C1C] rounded-lg flex items-center justify-center mx-auto">
            <Dumbbell size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item) => {
          const Icon   = item.icon;
          const active = isActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-[#1C1C1C] text-white shadow-sm'
                  : 'text-[#6B6B6B] hover:bg-[#ECE4DC] hover:text-[#2A1F1A]'
              }`}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 transition-colors ${
                  active ? 'text-white' : 'text-[#C4956A] group-hover:text-[#2A1F1A]'
                }`}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom — User + Logout ── */}
      <div className="px-3 py-4 border-t border-[#ECE4DC] flex flex-col gap-2">

        {/* User info */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#ECE4DC]/50 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-[#C4956A] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-xs font-semibold text-[#2A1F1A] truncate">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-xs text-[#6B6B6B] truncate">
                  {user?.email || ''}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#6B6B6B] hover:bg-red-50 hover:text-red-500 transition-all duration-200 group ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className="flex-shrink-0 group-hover:text-red-500 transition-colors" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Collapse toggle button ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-2 top-6 w-6 h-6 bg-white border border-[#ECE4DC] rounded-full flex items-center justify-center shadow-sm hover:bg-[#FAF7F4] transition-colors z-10 cursor-pointer"
      >
        {collapsed
          ? <ChevronRight size={12} className="text-[#6B6B6B]" />
          : <ChevronLeft  size={12} className="text-[#6B6B6B]" />
        }
      </button>
    </motion.aside>
  );
};

export default Sidebar;