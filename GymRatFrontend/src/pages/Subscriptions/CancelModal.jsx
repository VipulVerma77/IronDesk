 const CancelModal = ({ subscription, onClose }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => cancelSubscriptionAPI(subscription.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      onClose();
    },
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-[#ECE4DC]"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#2A1F1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Cancel Subscription?
            </h3>
            <p className="text-sm text-[#6B6B6B] mt-1">
              This will cancel <span className="font-semibold text-[#2A1F1A]">{subscription.memberName}</span>'s
              subscription and any pending payments.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[#ECE4DC] text-sm font-medium text-[#6B6B6B] hover:bg-[#FAF7F4] transition-colors cursor-pointer">
              Keep it
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {mutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CancelModal;