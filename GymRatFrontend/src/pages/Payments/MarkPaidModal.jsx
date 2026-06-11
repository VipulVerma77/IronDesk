import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, IndianRupee } from 'lucide-react';

import { markPaymentPaidAPI } from '../../features/payment/paymentAPI';


const MarkPaidModal = ({ payment, onClose }) => {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState(null);

  const mutation = useMutation({
    mutationFn: () => markPaymentPaidAPI(payment.id),
    onSuccess: (data) => {
      if (data.data.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        onClose();
      } else {
        setApiError(data.data.message);
      }
    },
    onError: () => setApiError('Something went wrong.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-[#ECE4DC]">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <IndianRupee size={28} className="text-green-500" />
          </div>
          <div>
            <h3
              className="text-lg font-black text-[#2A1F1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Mark as Paid?
            </h3>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Mark payment of{' '}
              <span className="font-semibold text-[#2A1F1A]">
                ₹{payment.amount?.toLocaleString()}
              </span>{' '}
              as paid. This will activate the subscription.
            </p>
          </div>

          {apiError && (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#ECE4DC] text-sm font-medium text-[#6B6B6B] hover:bg-[#FAF7F4] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {mutation.isPending ? 'Processing...' : 'Yes, Mark Paid'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MarkPaidModal;