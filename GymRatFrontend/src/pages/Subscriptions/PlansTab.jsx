import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CreditCard,
  Plus,
} from 'lucide-react';

import { getAllPlansAPI, createPlanAPI } from '../../features/plan/planAPI';

import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';

import Skeleton from '../../components/Common/Skeleton';
import { planSchema } from './subscriptionSchema';

const PlansTab = () => {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn:  async () => {
      const res = await getAllPlansAPI();
      return res.data.data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(planSchema),
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: createPlanAPI,
    onSuccess: (data) => {
      if (data.data.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ['plans'] });
        reset();
        setShowForm(false);
        setApiError(null);
      } else {
        setApiError(data.data.message);
      }
    },
    onError: () => setApiError('Something went wrong.'),
  });

  const onSubmit = (data) => {
    setApiError(null);
    mutation.mutate({
      name:          data.name,
      price:         Number(data.price),
      durationInDays: Number(data.durationInDays),
      description:   data.description || '',
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Create plan form toggle */}
      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={() => setShowForm(!showForm)}>
          <span className="flex items-center gap-2">
            <Plus size={16} />
            {showForm ? 'Hide Form' : 'Create Plan'}
          </span>
        </Button>
      </div>

      {/* Create plan form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-lg font-black text-[#2A1F1A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              New Membership Plan
            </h3>

            {apiError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
              <Input
                label="Plan Name"
                placeholder="e.g. Monthly"
                registration={register('name')}
                error={errors.name?.message}
              />
              <Input
                label="Price (₹)"
                type="number"
                placeholder="e.g. 1000"
                registration={register('price')}
                error={errors.price?.message}
              />
              <Input
                label="Duration (days)"
                type="number"
                placeholder="e.g. 30"
                registration={register('durationInDays')}
                error={errors.durationInDays?.message}
              />
              <Input
                label="Description"
                placeholder="Optional"
                registration={register('description')}
                error={errors.description?.message}
              />
              <div className="col-span-2 flex justify-end">
                <Button variant="primary" size="md" type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Creating...' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : plans?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 bg-[#FAF7F4] rounded-2xl flex items-center justify-center">
            <CreditCard size={24} className="text-[#C4956A]" />
          </div>
          <p className="text-sm font-medium text-[#2A1F1A]">No plans yet</p>
          <p className="text-xs text-[#6B6B6B]">Create your first membership plan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans?.map((plan, i) => (
            <motion.div
              key={plan.id}
              className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm hover:-translate-y-1 transition-transform duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#1C1C1C] rounded-xl flex items-center justify-center">
                  <CreditCard size={18} className="text-white" />
                </div>
                {plan.isActive && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                )}
              </div>
              <h3 className="text-lg font-black text-[#2A1F1A] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {plan.name}
              </h3>
              <p className="text-xs text-[#6B6B6B] mb-4">{plan.description || 'No description'}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-black text-[#2A1F1A]">₹{plan.price?.toLocaleString()}</p>
                  <p className="text-xs text-[#6B6B6B]">{plan.durationInDays} days</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlansTab;
