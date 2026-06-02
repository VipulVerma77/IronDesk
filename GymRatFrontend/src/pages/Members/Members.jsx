import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    Clock,
    Ban,
    Lightbulb,
} from 'lucide-react';
import { getAllMembersAPI, addMemberAPI } from '../../features/member/memberAPI';
import { memberSchema } from './memberSchema';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';


const StatusBadge = ({ status }) => {
    const styles = {
        Active: 'bg-green-100 text-green-700',
        Inactive: 'bg-[#C4956A]/10 text-[#C4956A]',
        Blocked: 'bg-red-100 text-red-600',
    };
    const icons = {
        Active: <CheckCircle size={12} />,
        Inactive: <Clock size={12} />,
        Blocked: <Ban size={12} />,
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.Inactive}`}>
            {icons[status]}
            {status}
        </span>
    );
};

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-[#ECE4DC] rounded-xl ${className}`} />
);

const AddMemberModal = ({ onClose }) => {
    const queryClient = useQueryClient();
    const [apiError, setApiError] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(memberSchema),
        mode: 'onChange',
    });

    const mutation = useMutation({
        mutationFn: addMemberAPI,
        onSuccess: (data) => {
            if (data.data.isSuccess) {
                queryClient.invalidateQueries({ queryKey: ['members'] });
                onClose();
            } else {
                setApiError(data.data.message);
            }
        },
        onError: () => setApiError('Something went wrong. Please try again.'),
    });

    const onSubmit = (data) => {
        setApiError(null);
        mutation.mutate({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            joinDate: new Date(data.joinDate).toISOString(),
        });
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                className="relative bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-[#ECE4DC]"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2
                            className="text-xl font-black text-[#2A1F1A]"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Add Member
                        </h2>
                        <p className="text-xs text-[#6B6B6B] mt-0.5">
                            Member will receive a temporary password
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[#FAF7F4] flex items-center justify-center hover:bg-[#ECE4DC] transition-colors cursor-pointer"
                    >
                        <X size={16} className="text-[#6B6B6B]" />
                    </button>
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
                            placeholder="e.g. Rahul Sharma"
                            registration={register('fullName')}
                            error={errors.fullName?.message}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="member@example.com"
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
                            label="Join Date"
                            type="date"
                            registration={register('joinDate')}
                            error={errors.joinDate?.message}
                        />
                    </div>
                    <div className="grid grid-cols-1 ">
                    <Input
                            label="Address"
                            placeholder="Member address"
                            registration={register('address')}
                            error={errors.address?.message}
                        />
                        </div>

                    <div className="flex gap-3 mt-2">
                        <Button variant="secondary" size="md" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="md" fullWidth type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Adding...' : 'Add Member'}
                        </Button>
                    </div>
                </form>

                <div className="mt-4 bg-[#FAF7F4] rounded-xl px-4 py-3 border border-[#ECE4DC]">
                    <p className="text-xs text-[#6B6B6B]">
                        <Lightbulb size={15} className='' color='orange' /> Temporary password will be:{' '}
                        <span className="font-mono font-semibold text-[#2A1F1A]">
                            firstname@123
                        </span>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Members = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const pageSize = 10;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['members', page],
        queryFn: async () => {
            const res = await getAllMembersAPI(page, pageSize);
            return res.data.data;
        },
        staleTime: 1000 * 60,
    });

    // Client side search filter
    const filtered = data?.data?.filter((m) =>
        m.fullName.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search)
    ) ?? [];

    return (
        <>
            <div className="flex flex-col gap-6">

                {/* ── Header ── */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div>
                        <h1
                            className="text-3xl font-black text-[#2A1F1A]"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Members
                        </h1>
                        <p className="text-sm text-[#6B6B6B] mt-1">
                            {data?.totalCount ?? 0} total members
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => setShowModal(true)}
                    >
                        <span className="flex items-center gap-2">
                            <UserPlus size={16} />
                            Add Member
                        </span>
                    </Button>
                </motion.div>

                {/* ── Search ── */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                    />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ECE4DC] bg-white text-sm text-[#2A1F1A] placeholder:text-[#9B9B9B] outline-none focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#1C1C1C]/10 transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                        >
                            <X size={16} className="text-[#6B6B6B]" />
                        </button>
                    )}
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl border border-[#ECE4DC] shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className="grid grid-cols-5 px-6 py-4 border-b border-[#ECE4DC] bg-[#FAF7F4]">
                        {['Member', 'Email', 'Phone', 'Join Date', 'Status'].map((h) => (
                            <p key={h} className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">
                                {h}
                            </p>
                        ))}
                    </div>

                 
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
                                <p className="text-sm text-[#2A1F1A] font-medium">Failed to load members</p>
                            </div>
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && !isError && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 bg-[#FAF7F4] rounded-2xl flex items-center justify-center">
                                <Users size={24} className="text-[#C4956A]" />
                            </div>
                            <p className="text-sm font-medium text-[#2A1F1A]">
                                {search ? 'No members found' : 'No members yet'}
                            </p>
                            <p className="text-xs text-[#6B6B6B]">
                                {search ? 'Try a different search' : 'Add your first member'}
                            </p>
                        </div>
                    )}

                    {/* Rows */}
                    {!isLoading && !isError && filtered.map((member, i) => (
                        <motion.div
                            key={member.id}
                            className="grid grid-cols-5 px-6 py-4 border-b border-[#ECE4DC] last:border-0 hover:bg-[#FAF7F4] transition-colors items-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                            {/* Member name + avatar */}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#C4956A] rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold">
                                        {member.fullName?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-[#2A1F1A] truncate">
                                    {member.fullName}
                                </span>
                            </div>

                            <p className="text-sm text-[#6B6B6B] truncate">{member.email}</p>
                            <p className="text-sm text-[#6B6B6B]">{member.phone}</p>
                            <p className="text-sm text-[#6B6B6B]">
                                {new Date(member.joinDate).toLocaleDateString('en-IN')}
                            </p>
                            <StatusBadge status={member.status} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Pagination ── */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-[#6B6B6B]">
                            Page {data.currentPage} of {data.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-9 h-9 rounded-xl border border-[#ECE4DC] bg-white flex items-center justify-center hover:bg-[#FAF7F4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronLeft size={16} className="text-[#6B6B6B]" />
                            </button>

                            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors cursor-pointer ${p === page
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
                                className="w-9 h-9 rounded-xl border border-[#ECE4DC] bg-white flex items-center justify-center hover:bg-[#FAF7F4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronRight size={16} className="text-[#6B6B6B]" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <AddMemberModal onClose={() => setShowModal(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default Members;