import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Filter,
  ClipboardList,
} from 'lucide-react';

import { getAllSubscriptionsAPI } from '../../features/subscription/subscriptionAPI';

import Skeleton from '../../components/Common/Skeleton';
import StatusBadge from './StatusBadge';
import CancelModal from './CancelModal';

import { subscriptionStatuses } from '../../constants/subscriptionConstants';

const AllSubscriptionsTab = () => {
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState('');
  const [cancelSub, setCancelSub] = useState(null);
  const pageSize = 10;

  const params = [
    status ? `&status=${status}` : '',
    search ? `&search=${search}` : '',
  ].join('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscriptions', page, status, search],
    queryFn:  async () => {
      const res = await getAllSubscriptionsAPI(page, pageSize, params);
      return res.data.data;
    },
    staleTime: 1000 * 60,
  });

  const statuses = ['', 'Active', 'Pending', 'Scheduled', 'Expired', 'Cancelled'];

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search by member name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ECE4DC] bg-white text-sm text-[#2A1F1A] placeholder:text-[#9B9B9B] outline-none focus:border-[#1C1C1C] transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer">
                <X size={16} className="text-[#6B6B6B]" />
              </button>
            )}
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-3 rounded-xl border border-[#ECE4DC] bg-white text-sm text-[#2A1F1A] outline-none focus:border-[#1C1C1C] transition-all cursor-pointer appearance-none"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s || 'All Status'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#ECE4DC] shadow-sm overflow-hidden">
          <div className="grid grid-cols-6 px-6 py-4 border-b border-[#ECE4DC] bg-[#FAF7F4]">
            {['Member', 'Plan', 'Start Date', 'End Date', 'Status', 'Action'].map((h) => (
              <p key={h} className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">{h}</p>
            ))}
          </div>

          {isLoading && (
            <div className="flex flex-col gap-3 p-6">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <AlertTriangle size={32} className="text-[#C4956A] mx-auto mb-2" />
                <p className="text-sm text-[#2A1F1A] font-medium">Failed to load subscriptions</p>
              </div>
            </div>
          )}

          {!isLoading && !isError && data?.data?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-[#FAF7F4] rounded-2xl flex items-center justify-center">
                <ClipboardList size={24} className="text-[#C4956A]" />
              </div>
              <p className="text-sm font-medium text-[#2A1F1A]">No subscriptions found</p>
            </div>
          )}

          {!isLoading && !isError && data?.data?.map((sub, i) => (
            <motion.div
              key={sub.id}
              className="grid grid-cols-6 px-6 py-4 border-b border-[#ECE4DC] last:border-0 hover:bg-[#FAF7F4] transition-colors items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#C4956A] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {sub.memberName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#2A1F1A] truncate">{sub.memberName}</p>
                  <p className="text-xs text-[#6B6B6B] truncate">{sub.memberEmail}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#2A1F1A]">{sub.planName}</p>
                <p className="text-xs text-[#6B6B6B]">₹{sub.planPrice?.toLocaleString()}</p>
              </div>
              <p className="text-sm text-[#6B6B6B]">{new Date(sub.startDate).toLocaleDateString('en-IN')}</p>
              <p className="text-sm text-[#6B6B6B]">{new Date(sub.endDate).toLocaleDateString('en-IN')}</p>
              <StatusBadge status={sub.status} />
              <div>
                {(sub.status === 'Pending' || sub.status === 'Active' || sub.status === 'Scheduled') && (
                  <button
                    onClick={() => setCancelSub(sub)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B6B6B]">Page {data.currentPage} of {data.totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-xl border border-[#ECE4DC] bg-white flex items-center justify-center hover:bg-[#FAF7F4] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={16} className="text-[#6B6B6B]" />
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium cursor-pointer ${
                    p === page ? 'bg-[#1C1C1C] text-white' : 'border border-[#ECE4DC] bg-white text-[#6B6B6B] hover:bg-[#FAF7F4]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="w-9 h-9 rounded-xl border border-[#ECE4DC] bg-white flex items-center justify-center hover:bg-[#FAF7F4] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={16} className="text-[#6B6B6B]" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {cancelSub && (
          <CancelModal subscription={cancelSub} onClose={() => setCancelSub(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default AllSubscriptionsTab;