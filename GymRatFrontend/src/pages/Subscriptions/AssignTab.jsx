import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

import { getAllPlansAPI } from '../../features/plan/planAPI';
import { getAllMembersAPI } from '../../features/member/memberAPI';
import { assignSubscriptionAPI } from '../../features/subscription/subscriptionAPI';

import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';

import { assignSchema } from './subscriptionSchema';


const AssignTab = () => {
  const queryClient = useQueryClient();
  const [apiError,  setApiError]  = useState(null);
  const [success,   setSuccess]   = useState(false);

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn:  async () => {
      const res = await getAllPlansAPI();
      return res.data.data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ['members', 1],
    queryFn:  async () => {
      const res = await getAllMembersAPI(1, 100);
      return res.data.data?.data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(assignSchema),
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: assignSubscriptionAPI,
    onSuccess: (data) => {
      if (data.data.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        reset();
        setSuccess(true);
        setApiError(null);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setApiError(data.data.message);
      }
    },
    onError: () => setApiError('Something went wrong.'),
  });

  const onSubmit = (data) => {
    setApiError(null);
    mutation.mutate({
      memberId:         Number(data.memberId),
      membershipPlanId: Number(data.membershipPlanId),
      startDate:        data.startDate ? new Date(data.startDate).toISOString() : null,
    });
  };

  return (
    <div className="max-w-xxl">
      <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm">
        <h3 className="text-lg font-black text-[#2A1F1A] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Assign Subscription
        </h3>
        <p className="text-xs text-[#6B6B6B] mb-6">Manually assign a plan to a member</p>

        {/* Success */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-3 py-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <p className="text-sm text-green-600">Subscription assigned successfully!</p>
          </div>
        )}

        {/* Error */}
        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Member select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#2A1F1A]">Member</label>
            <select
              {...register('memberId')}
              className="w-full px-4 py-3 rounded-xl border border-[#E0D8D0] bg-white text-sm text-[#2A1F1A] outline-none focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#1C1C1C]/10 transition-all cursor-pointer"
            >
              <option value="">Select a member</option>
              {members?.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName} — {m.email}</option>
              ))}
            </select>
            {errors.memberId && <p className="text-xs text-red-500">⚠ {errors.memberId.message}</p>}
          </div>

          {/* Plan select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#2A1F1A]">Membership Plan</label>
            <select
              {...register('membershipPlanId')}
              className="w-full px-4 py-3 rounded-xl border border-[#E0D8D0] bg-white text-sm text-[#2A1F1A] outline-none focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#1C1C1C]/10 transition-all cursor-pointer"
            >
              <option value="">Select a plan</option>
              {plans?.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ₹{p.price} / {p.durationInDays} days</option>
              ))}
            </select>
            {errors.membershipPlanId && <p className="text-xs text-red-500">⚠ {errors.membershipPlanId.message}</p>}
          </div>

          {/* Start date */}
          <Input
            label="Start Date (optional — defaults to today)"
            type="date"
            registration={register('startDate')}
            error={errors.startDate?.message}
          />

          <Button variant="primary" size="md" fullWidth type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Assigning...' : 'Assign Subscription'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AssignTab;