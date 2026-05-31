import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registerGymSchema } from './registerGymSchema';
import { registerGymAPI } from '../../features/auth/authAPI';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';

import {
    Users,
    CreditCard,
    BarChart3,
    Zap,
    ShieldCheck,
    LayoutDashboard,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Check,
    AlertCircle,
} from "lucide-react";

const features = [
    {
        icon: Users,
        text: "Manage unlimited members",
    },
    {
        icon: CreditCard,
        text: "Subscription & payment tracking",
    },
    {
        icon: BarChart3,
        text: "Attendance analytics",
    },
    {
        icon: Zap,
        text: "Automated background jobs",
    },
    {
        icon: ShieldCheck,
        text: "Secure multi-tenant architecture",
    },
    {
        icon: LayoutDashboard,
        text: "Real-time dashboard insights",
    },
];

const steps = ['Gym Info', 'Admin Info'];

const RegisterGym = () => {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerGymSchema),
        mode: 'onChange',
    });

    
    const stepOneFields = ['gymName', 'gymEmail', 'phone', 'address', 'description'];

    const handleNext = async () => {
        const valid = await trigger(stepOneFields);
        if (valid) setStep(1);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setApiError(null);
        try {
            const result = await registerGymAPI({
                gymName: data.gymName,
                gymEmail: data.gymEmail,
                phone: data.phone,
                address: data.address,
                description: data.description,
                adminName: data.adminName,
                adminEmail: data.adminEmail,
                password: data.password,
            });

            if (result.isSuccess) {
                navigate('/login');
            } else {
                setApiError(result.message);
            }
        } catch (err) {
            setApiError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen grid grid-cols-1 md:grid-cols-2"
        >
            {/* ── Left side ── */}
            <motion.div
                className="hidden md:flex flex-col justify-between px-16 py-12"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
            >
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#1C1C1C] rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-black">ID</span>
                    </div>
                    <span
                        className="text-xl font-bold text-[#2A1F1A]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        IronDesk
                    </span>
                </Link>

                {/* Center content */}
                <div className="flex flex-col gap-8">
                    <div>
                        <motion.h1
                            className="text-5xl font-black text-[#2A1F1A] leading-tight mb-4"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            Welcome to {" "}
                            <span className="text-[#C4956A]">IronDesk</span>
                        </motion.h1>
                        <motion.p
                            className="text-[#6B6B6B] text-base leading-relaxed max-w-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                        >
                            The modern gym management platform. Register your gym
                            and start managing members, subscriptions and attendance
                            from one powerful dashboard.
                        </motion.p>
                    </div>

                    {/* Features list */}
                    <motion.div
                        className="grid grid-cols-1 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {features.map((feature, i) => {
                            const Icon = feature.icon;

                            return (
                                <motion.div
                                    key={feature.text}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: 0.5 + i * 0.08,
                                    }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-[#ECE4DC] flex items-center justify-center">
                                        <Icon
                                            size={18}
                                            className="text-[#C4956A]"
                                        />
                                    </div>

                                    <span className="text-[#2A1F1A] font-medium">
                                        {feature.text}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Testimonial */}
                    <motion.div
                        className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.9 }}
                    >
                        <p className="text-sm text-[#2A1F1A] italic leading-relaxed mb-3">
                            "IronDesk transformed how we manage our gym. Member tracking,
                            payments and attendance — all automated."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#C4956A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                R
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#2A1F1A]">Rahul Sharma</p>
                                <p className="text-xs text-[#6B6B6B]">Owner, FitZone Gym</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom */}
                <p className="text-xs text-[#6B6B6B]">
                    © 2026 IronDesk. All rights reserved.
                </p>
            </motion.div>

            {/* ── Right side — Form ── */}
            <motion.div
                className="flex items-center justify-center px-6 md:px-12 py-12"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
            >
                <div className="w-full max-w-md">

                    {/* Card */}
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60">

                        {/* Header */}
                        <div className="mb-8">
                            {/* Step indicator */}
                            <div className="flex items-center gap-2 mb-6">
                                {steps.map((s, i) => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div className={`flex items-center gap-1.5`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i <= step
                                                    ? 'bg-[#1C1C1C] text-white'
                                                    : 'bg-[#E0D8D0] text-[#6B6B6B]'
                                                }`}>
                                                {i < step ? '✓' : i + 1}
                                            </div>
                                            <span className={`text-xs font-medium ${i <= step ? 'text-[#2A1F1A]' : 'text-[#6B6B6B]'
                                                }`}>
                                                {s}
                                            </span>
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className={`h-0.5 w-8 transition-all duration-300 ${i < step ? 'bg-[#1C1C1C]' : 'bg-[#E0D8D0]'
                                                }`} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <h2
                                className="text-2xl font-black text-[#2A1F1A]"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {step === 0 ? 'Gym Details' : 'Admin Account'}
                            </h2>
                            <p className="text-sm text-[#6B6B6B] mt-1">
                                {step === 0
                                    ? 'Tell us about your gym'
                                    : 'Set up your admin credentials'}
                            </p>
                        </div>

                        {/* API Error */}
                        {apiError && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <p className="text-sm text-red-600">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {apiError}
                                    </div>
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                            {/* ── Step 1 — Gym Info ── */}
                            {step === 0 && (
                                <motion.div
                                    className="flex flex-col gap-4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Input
                                        label="Gym Name"
                                        placeholder="e.g. FitZone Gym"
                                        registration={register('gymName')}
                                        error={errors.gymName?.message}
                                    />
                                    <Input
                                        label="Gym Email"
                                        type="email"
                                        placeholder="gym@example.com"
                                        registration={register('gymEmail')}
                                        error={errors.gymEmail?.message}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Phone"
                                            placeholder="10 digit number"
                                            registration={register('phone')}
                                            error={errors.phone?.message}
                                        />
                                        <Input
                                            label="Address"
                                            placeholder="Gym address"
                                            registration={register('address')}
                                            error={errors.address?.message}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-[#2A1F1A]">
                                            Description
                                            <span className="text-[#6B6B6B] font-normal ml-1">(optional)</span>
                                        </label>
                                        <textarea
                                            placeholder="Tell members about your gym..."
                                            rows={3}
                                            {...register('description')}
                                            className="w-full rounded-xl border border-[#E0D8D0] bg-white/60 backdrop-blur-sm px-4 py-3 text-sm text-[#2A1F1A] placeholder:text-[#9B9B9B] outline-none transition-all duration-200 focus:bg-white focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#1C1C1C]/10 resize-none"
                                        />
                                        {errors.description && (
                                            <p className="text-xs text-red-500">⚠ {errors.description.message}</p>
                                        )}
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="md"
                                        fullWidth
                                        type="button"
                                        onClick={handleNext}
                                    >
                                        Continue →
                                    </Button>
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div
                                    className="flex flex-col gap-4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Input
                                        label="Admin Name"
                                        placeholder="Your full name"
                                        registration={register('adminName')}
                                        error={errors.adminName?.message}
                                    />
                                    <Input
                                        label="Admin Email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        registration={register('adminEmail')}
                                        error={errors.adminEmail?.message}
                                    />
                                    <div className="relative">
                                        <Input
                                            label="Password"
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Min 6 chars, 1 uppercase, 1 number"
                                            registration={register('password')}
                                            error={errors.password?.message}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-8 text-[#6B6B6B] text-sm pointer"
                                        >
                                            {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                                        </button>
                                    </div>
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        placeholder="Re-enter your password"
                                        registration={register('confirmPassword')}
                                        error={errors.confirmPassword?.message}
                                    />

                                    <div className="flex gap-3 mt-2">
                                        <Button
                                            variant="secondary"
                                            size="md"
                                            type="button"
                                            onClick={() => setStep(0)}
                                        >
                                            ← Back
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="md"
                                            fullWidth
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Registering...' : 'Register Gym'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                        </form>

                        <p className="text-center text-sm text-[#6B6B6B] mt-6">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-[#2A1F1A] font-semibold hover:text-[#C4956A] transition-colors"
                            >
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterGym;