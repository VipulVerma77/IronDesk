import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { loginSchema } from './loginSchema';
import { loginAPI } from '../../features/auth/authAPI';
import { setCredentials } from '../../features/auth/authSlice';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import {
    Eye,
    EyeOff,
    ArrowRight,
    Dumbbell,
    Building2,
    Users,
    ShieldCheck,
    Activity,
    TrendingUp,
    AlertCircle,
} from "lucide-react";

const stats = [
    {
        icon: Building2,
        value: "50+",
        label: "Gyms Registered",
    },
    {
        icon: Users,
        value: "10K+",
        label: "Members Managed",
    },
    {
        icon: ShieldCheck,
        value: "99%",
        label: "System Uptime",
    },
];

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setApiError(null);
        try {
            const result = await loginAPI(data);

            if (result.isSuccess) {
                dispatch(setCredentials({
                    token: result.data.accessToken,
                    user: {
                        id: result.data.id,
                        name: result.data.name,
                        email: result.data.email,
                        role: result.data.role,
                        gymId: result.data.gymId,
                    },
                }));

                // Redirect based on role
                if (result.data.role === 'Admin') navigate('/admin');
                else navigate('/member');

            } else {
                setApiError(result.message);
            }
        } catch {
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
                        <span className="text-white text-xs font-black"><Dumbbell
                            size={16}
                            className="text-white"
                        /></span>
                    </div>
                    <span
                        className="text-xl font-bold text-[#2A1F1A]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        IronDesk
                    </span>
                </Link>

                {/* Center */}
                <div className="flex flex-col gap-8">
                    <div>
                        <motion.h1
                            className="text-5xl font-black text-[#2A1F1A] leading-tight mb-4"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            Welcome{" "}
                            <span className="text-[#C4956A]">
                                Back
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-[#6B6B6B] text-base leading-relaxed max-w-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                        >
                            Log in to your IronDesk account and pick up right
                            where you left off. Your gym is waiting.
                        </motion.p>
                    </div>

                    {/* Stats */}
                    <motion.div
                        className="grid gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;

                            return (
                                <motion.div
                                    key={stat.label}
                                    className="bg-white rounded-2xl p-4 border border-[#ECE4DC] shadow-sm flex items-center gap-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: 0.4 + i * 0.1,
                                    }}
                                >
                                    <div className="w-11 h-11 rounded-xl bg-[#FAF7F4] flex items-center justify-center">
                                        <Icon
                                            size={20}
                                            className="text-[#C4956A]"
                                        />
                                    </div>

                                    <div>
                                        <h3
                                            className="text-2xl font-black text-[#2A1F1A]"
                                            style={{
                                                fontFamily:
                                                    "'Playfair Display', serif",
                                            }}
                                        >
                                            {stat.value}
                                        </h3>

                                        <p className="text-sm text-[#6B6B6B]">
                                            {stat.label}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-3xl p-6 border border-[#ECE4DC] shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-xs text-[#6B6B6B]">
                                    Active Members
                                </p>

                                <h3 className="text-3xl font-bold text-[#2A1F1A]">
                                    1,240
                                </h3>
                            </div>

                            <div className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                                <TrendingUp size={12} />
                                18%
                            </div>
                        </div>

                        <div className="flex items-end gap-2 h-24">
                            {[35, 55, 45, 80, 65, 95].map(
                                (v) => (
                                    <div
                                        key={v}
                                        className="flex-1 bg-[#C4956A] rounded-t-lg"
                                        style={{
                                            height: `${v}%`,
                                        }}
                                    />
                                )
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom */}
                <p className="text-xs text-[#6B6B6B]">© 2026 IronDesk. All rights reserved.</p>
            </motion.div>

            {/* ── Right side — Form ── */}
            <motion.div
                className="flex items-center justify-center px-6 md:px-12 py-12"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
            >

                <div className="w-full max-w-md">
                    <div className="inline-flex items-center gap-2 bg-white border border-[#ECE4DC] rounded-full px-4 py-2 shadow-sm mb-6">
                        <Activity
                            size={14}
                            className="text-green-500"
                        />

                        <span className="text-sm text-[#6B6B6B]">
                            Trusted by fitness businesses
                        </span>
                    </div>
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60">

                        {/* Header */}
                        <div className="mb-8">
                            {/* Mobile logo */}
                            <div className="flex md:hidden items-center gap-2 mb-6">
                                <div className="w-7 h-7 bg-[#1C1C1C] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-black">ID</span>
                                </div>
                                <span
                                    className="text-lg font-bold text-[#2A1F1A]"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    IronDesk
                                </span>
                            </div>

                            <h2
                                className="text-2xl font-black text-[#2A1F1A]"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Sign In
                            </h2>
                            <p className="text-sm text-[#6B6B6B] mt-1">
                                Enter your credentials to access your dashboard
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
                            <Input
                                label="Email"
                                type="email"
                                placeholder="your@email.com"
                                registration={register('email')}
                                error={errors.email?.message}
                            />

                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    registration={register('password')}
                                    error={errors.password?.message}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-10 text-[#6B6B6B] text-sm pointer"
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <Button
                                variant="primary"
                                size="md"
                                fullWidth
                                type="submit"
                                isLoading={loading}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    Sign In
                                    <ArrowRight size={16} />
                                </div>
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-[#E0D8D0]" />
                            <span className="text-xs text-[#6B6B6B]">or</span>
                            <div className="flex-1 h-px bg-[#E0D8D0]" />
                        </div>

                        {/* Register link */}
                        <div className="text-center">
                            <p className="text-sm text-[#6B6B6B]">
                                Don't have an account?{' '}
                                <Link
                                    to="/register-gym"
                                    className="text-[#2A1F1A] font-semibold hover:text-[#C4956A] transition-colors"
                                >
                                    Register your gym
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;