import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Users,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  X,
  Dumbbell,
  MapPin,
  Calendar,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { getGymBySlugAPI } from '../../features/gym/gymAPI';
import { publicSubscribeAPI } from '../../features/subscription/subscriptionAPI';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Skeleton from '../../components/Common/Skeleton';

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────
const subscribeSchema = yup.object({
  fullName:  yup.string().min(3, 'Name too short').required('Full name is required'),
  email:     yup.string().email('Invalid email').required('Email is required'),
  phone:     yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Phone is required'),
  password:  yup.string().min(6, 'Min 6 characters').required('Password is required'),
  startDate: yup.string(),
});

// ─────────────────────────────────────────
// Subscribe Modal
// ─────────────────────────────────────────
const SubscribeModal = ({ plan, slug, onClose }) => {
  const navigate  = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [success,  setSuccess]  = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(subscribeSchema),
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: (data) => publicSubscribeAPI(slug, data),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        setSuccess(true);
        setApiError(null);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setApiError(res.data.message);
      }
    },
    onError: () => setApiError('Something went wrong. Please try again.'),
  });

  const onSubmit = (data) => {
    setApiError(null);
    mutation.mutate({
      membershipPlanId: plan.id,
      fullName:         data.fullName,
      email:            data.email,
      phone:            data.phone,
      password:         data.password,
      startDate:        data.startDate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-[#ECE4DC] max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3
              className="text-xl font-black text-[#2A1F1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Subscribe to {plan.name}
            </h3>
            <p className="text-sm text-[#6B6B6B] mt-1">
              ₹{plan.price?.toLocaleString()} / {plan.durationInDays} days
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F4] flex items-center justify-center hover:bg-[#ECE4DC] transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={16} className="text-[#6B6B6B]" />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <div>
              <h4
                className="text-lg font-black text-[#2A1F1A]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Subscription Requested!
              </h4>
              <p className="text-sm text-[#6B6B6B] mt-1">
                Your account has been created. Redirecting to login...
              </p>
            </div>
            <div className="bg-[#FAF7F4] rounded-2xl px-6 py-4 border border-[#ECE4DC] w-full text-left">
              <p className="text-xs text-[#6B6B6B] mb-1">Next steps</p>
              <p className="text-sm text-[#2A1F1A]">
                1. Login with your email and password
              </p>
              <p className="text-sm text-[#2A1F1A]">
                2. Wait for admin to mark your payment as paid
              </p>
              <p className="text-sm text-[#2A1F1A]">
                3. Your subscription activates automatically
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Plan summary */}
            <div className="bg-[#FAF7F4] rounded-2xl p-4 border border-[#ECE4DC] mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#6B6B6B]">Selected Plan</p>
                  <p className="text-base font-bold text-[#2A1F1A]">{plan.name}</p>
                  {plan.description && (
                    <p className="text-xs text-[#6B6B6B] mt-0.5">{plan.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-black text-[#2A1F1A]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    ₹{plan.price?.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#6B6B6B]">{plan.durationInDays} days</p>
                </div>
              </div>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Your full name"
                  registration={register('fullName')}
                  error={errors.fullName?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  registration={register('email')}
                  error={errors.email?.message}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  placeholder="10 digit number"
                  registration={register('phone')}
                  error={errors.phone?.message}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min 6 characters"
                  registration={register('password')}
                  error={errors.password?.message}
                />
              </div>
              <Input
                label="Start Date (optional — defaults to today)"
                type="date"
                registration={register('startDate')}
                error={errors.startDate?.message}
              />

              <Button
                variant="primary"
                size="md"
                fullWidth
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Submitting...' : 'Subscribe Now'}
              </Button>
            </form>

            <p className="text-center text-xs text-[#6B6B6B] mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2A1F1A] font-semibold hover:text-[#C4956A] transition-colors">
                Login here
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Plan Card
// ─────────────────────────────────────────
const PlanCard = ({ plan, index, onSelect }) => (
  <div
    className={`rounded-3xl p-8 flex flex-col gap-4 border transition-all duration-200 hover:-translate-y-1 ${
      index === 0
        ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
        : 'bg-white text-[#2A1F1A] border-[#ECE4DC] shadow-sm'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
      index === 0 ? 'bg-white/10' : 'bg-[#FAF7F4]'
    }`}>
      <CreditCard size={20} className={index === 0 ? 'text-[#C4956A]' : 'text-[#C4956A]'} />
    </div>

    <div>
      <h3
        className="text-xl font-black"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {plan.name}
      </h3>
      {plan.description && (
        <p className={`text-sm mt-1 ${index === 0 ? 'text-white/60' : 'text-[#6B6B6B]'}`}>
          {plan.description}
        </p>
      )}
    </div>

    <div className="flex items-end gap-1">
      <p
        className="text-4xl font-black"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        ₹{plan.price?.toLocaleString()}
      </p>
    </div>

    <div className={`flex items-center gap-2 text-sm ${index === 0 ? 'text-white/60' : 'text-[#6B6B6B]'}`}>
      <Clock size={14} />
      {plan.durationInDays} days
    </div>

    <button
      onClick={() => onSelect(plan)}
      className={`mt-2 w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
        index === 0
          ? 'bg-[#C4956A] text-white hover:bg-[#b08050]'
          : 'bg-[#1C1C1C] text-white hover:bg-[#333]'
      }`}
    >
      Get Started
      <ArrowRight size={16} />
    </button>
  </div>
);

// ─────────────────────────────────────────
// Main GymPublic Page
// ─────────────────────────────────────────
const GymPublic = () => {
  const { slug }         = useParams();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['gym-public', slug],
    queryFn:  async () => {
      const res = await getGymBySlugAPI(slug);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex flex-col">
        <div className="h-16 bg-white border-b border-[#ECE4DC]" />
        <div className="max-w-5xl mx-auto px-6 py-12 w-full flex flex-col gap-8">
          <Skeleton className="h-48" rounded="rounded-3xl" />
          <div className="grid grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64" rounded="rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#ECE4DC] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-[#C4956A]" />
          </div>
          <h2
            className="text-2xl font-black text-[#2A1F1A] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Gym Not Found
          </h2>
          <p className="text-[#6B6B6B] mb-6">
            The gym you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button variant="primary" size="md">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#FAF7F4]">

        {/* ── Navbar ── */}
        <nav className="bg-white border-b border-[#ECE4DC] px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1C1C1C] rounded-lg flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span
              className="text-lg font-bold text-[#2A1F1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              IronDesk
            </span>
          </Link>
          <Link to="/login">
            <Button variant="primary" size="sm">Login</Button>
          </Link>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">

          {/* ── Hero ── */}
          <div className="bg-[#1C1C1C] rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-4">
              {/* Logo placeholder */}
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Dumbbell size={32} className="text-[#C4956A]" />
              </div>
              <div>
                <h1
                  className="text-4xl md:text-5xl font-black text-white leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {data.name}
                </h1>
                {data.description && (
                  <p className="text-white/60 mt-2 max-w-md text-sm leading-relaxed">
                    {data.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-3 flex-shrink-0">
              <div className="bg-white/10 rounded-2xl px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#C4956A] rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {data.activeMemberCount ?? 0}
                  </p>
                  <p className="text-xs text-white/60">Active Members</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div>
                  <p
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {data.plans?.length ?? 0}
                  </p>
                  <p className="text-xs text-white/60">Plans Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Plans ── */}
          <div>
            <div className="mb-8 text-center">
              <h2
                className="text-3xl font-black text-[#2A1F1A]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Membership Plans
              </h2>
              <p className="text-[#6B6B6B] mt-2 text-sm">
                Choose a plan that works for you
              </p>
            </div>

            {data.plans?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 bg-white rounded-2xl border border-[#ECE4DC] flex items-center justify-center">
                  <CreditCard size={24} className="text-[#C4956A]" />
                </div>
                <p className="text-sm font-medium text-[#2A1F1A]">No plans available yet</p>
                <p className="text-xs text-[#6B6B6B]">Check back soon</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.plans?.map((plan, i) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    index={i}
                    onSelect={setSelectedPlan}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── How it works ── */}
          <div className="bg-white rounded-3xl p-8 border border-[#ECE4DC] shadow-sm">
            <h2
              className="text-2xl font-black text-[#2A1F1A] mb-6 text-center"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Choose a Plan',     desc: 'Pick the membership plan that suits your fitness goals and budget.' },
                { step: '02', title: 'Create Account',    desc: 'Fill in your details to create your gym member account.' },
                { step: '03', title: 'Start Training',    desc: 'Once payment is confirmed, your membership activates automatically.' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-3">
                  <span
                    className="text-4xl font-black text-[#C4956A]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold text-[#2A1F1A]">{item.title}</h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="text-center">
            <p className="text-xs text-[#6B6B6B]">
              Powered by{' '}
              <Link to="/" className="text-[#2A1F1A] font-semibold hover:text-[#C4956A] transition-colors">
                IronDesk
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Subscribe Modal */}
      {selectedPlan && (
        <SubscribeModal
          plan={selectedPlan}
          slug={slug}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </>
  );
};

export default GymPublic;