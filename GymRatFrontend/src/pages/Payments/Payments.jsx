import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  CreditCard,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

import { getAllPaymentsAPI } from '../../features/payment/paymentAPI';

import Skeleton from '../../components/Common/Skeleton';

import PaymentStatusBadge from './PaymentStatusBadge';
import MarkPaidModal from './MarkPaidModal';




// ─────────────────────────────────────────
// Main Payments Page
// ─────────────────────────────────────────
const Payments = () => {
  const [page,        setPage]        = useState(1);
  const [markPayment, setMarkPayment] = useState(null);
  const pageSize = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', page],
    queryFn:  async () => {
      const res = await getAllPaymentsAPI(page, pageSize);
      return res.data.data;
    },
    staleTime: 1000 * 60,
  });

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1
            className="text-3xl font-black text-[#2A1F1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Payments
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            {data?.totalCount ?? 0} total payments
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Payments', value: data?.totalCount ?? 0,                                              icon: CreditCard,   color: 'bg-[#1C1C1C]' },
            { label: 'Paid',           value: data?.data?.filter((p) => p.status === 'Paid').length      ?? 0,   icon: CheckCircle,  color: 'bg-green-500'  },
            { label: 'Pending',        value: data?.data?.filter((p) => p.status === 'Pending').length   ?? 0,   icon: Clock,        color: 'bg-[#C4956A]'  },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 border border-[#ECE4DC] shadow-sm flex items-center gap-4"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6B6B6B]">{stat.label}</p>
                  <p
                    className="text-2xl font-black text-[#2A1F1A]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#ECE4DC] shadow-sm overflow-hidden">

          {/* Header */}
          <div className="grid grid-cols-5 px-6 py-4 border-b border-[#ECE4DC] bg-[#FAF7F4]">
            {['Payment ID', 'Amount', 'Method', 'Status', 'Action'].map((h) => (
              <p key={h} className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">
                {h}
              </p>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col gap-3 p-6">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <AlertTriangle size={32} className="text-[#C4956A] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#2A1F1A]">Failed to load payments</p>
              </div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && data?.data?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-[#FAF7F4] rounded-2xl flex items-center justify-center">
                <CreditCard size={24} className="text-[#C4956A]" />
              </div>
              <p className="text-sm font-medium text-[#2A1F1A]">No payments yet</p>
            </div>
          )}

          {/* Rows */}
          {!isLoading && !isError && data?.data?.map((payment) => (
            <div
              key={payment.id}
              className="grid grid-cols-5 px-6 py-4 border-b border-[#ECE4DC] last:border-0 hover:bg-[#FAF7F4] transition-colors items-center"
            >
              {/* Payment ID */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FAF7F4] rounded-lg border border-[#ECE4DC] flex items-center justify-center">
                  <CreditCard size={14} className="text-[#C4956A]" />
                </div>
                <span className="text-sm font-mono text-[#6B6B6B]">#{payment.id}</span>
              </div>

              {/* Amount */}
              <p className="text-sm font-bold text-[#2A1F1A]">
                ₹{payment.amount?.toLocaleString()}
              </p>

              {/* Method */}
              <p className="text-sm text-[#6B6B6B] capitalize">
                {payment.paymentMethod || 'FakeGateway'}
              </p>

              {/* Status */}
              <PaymentStatusBadge status={payment.status} />

              {/* Action */}
              <div>
                {payment.status === 'Pending' && (
                  <button
                    onClick={() => setMarkPayment(payment)}
                    className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors cursor-pointer font-medium"
                  >
                    Mark Paid
                  </button>
                )}
                {payment.status === 'Paid' && payment.paidAt && (
                  <p className="text-xs text-[#6B6B6B]">
                    {new Date(payment.paidAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B6B6B]">
              Page {data.currentPage} of {data.totalPages}
            </p>
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
                    p === page
                      ? 'bg-[#1C1C1C] text-white'
                      : 'border border-[#ECE4DC] bg-white text-[#6B6B6B] hover:bg-[#FAF7F4]'
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

      {/* Mark Paid Modal */}
      {markPayment && (
        <MarkPaidModal
          payment={markPayment}
          onClose={() => setMarkPayment(null)}
        />
      )}
    </>
  );
};

export default Payments;