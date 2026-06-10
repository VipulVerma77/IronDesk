import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Settings2,
  Palette,
  Lock,
  CheckCircle,
  AlertTriangle,
  Save,
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Skeleton from '../../components/Common/Skeleton';

// ─────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────
const gymSchema = yup.object({
  name:        yup.string().min(3, 'Name too short'),
  phone:       yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').nullable(),
  address:     yup.string().min(5, 'Address too short'),
  description: yup.string().max(200, 'Max 200 characters'),
});

const passwordSchema = yup.object({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(6, 'At least 6 characters')
    .matches(/[A-Z]/, 'Must contain one uppercase')
    .matches(/[0-9]/, 'Must contain one number')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm password'),
});

// ─────────────────────────────────────────
// Alert component
// ─────────────────────────────────────────
const Alert = ({ type, message }) => {
  if (!message) return null;
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error:   'bg-red-50 border-red-200 text-red-600',
  };
  const icons = {
    success: <CheckCircle size={16} />,
    error:   <AlertTriangle size={16} />,
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${styles[type]}`}>
      {icons[type]}
      {message}
    </div>
  );
};

// ─────────────────────────────────────────
// Themes
// ─────────────────────────────────────────
const themes = [
  { id: 'default', label: 'Default', color: '#1C1C1C' },
  { id: 'dark',    label: 'Dark',    color: '#2D2D2D' },
  { id: 'blue',    label: 'Blue',    color: '#1E40AF' },
  { id: 'green',   label: 'Green',   color: '#15803D' },
  { id: 'red',     label: 'Red',     color: '#B91C1C' },
];

// ─────────────────────────────────────────
// Tab: Gym Info
// ─────────────────────────────────────────
const GymInfoTab = () => {
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);

  const { data: gym, isLoading } = useQuery({
    queryKey: ['gym-me'],
    queryFn:  async () => {
      const res = await axiosInstance.get(API.GYM_ME);
      return res.data.data;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(gymSchema),
    mode: 'onChange',
    values: {
      name:        gym?.name        || '',
      phone:       gym?.phone       || '',
      address:     gym?.address     || '',
      description: gym?.description || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => axiosInstance.put(API.GYM_UPDATE, data),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        setSuccess('Gym info updated successfully');
        setApiError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setApiError(res.data.message);
      }
    },
    onError: () => setApiError('Something went wrong.'),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}
      </div>
    );
  }

  return (
    <div className="max-w-lg flex flex-col gap-4">
      <Alert type="success" message={success} />
      <Alert type="error"   message={apiError} />

      <form
        onSubmit={handleSubmit((data) => {
          setApiError(null);
          mutation.mutate(data);
        })}
        className="flex flex-col gap-4"
      >
        <Input
          label="Gym Name"
          placeholder="Your gym name"
          registration={register('name')}
          error={errors.name?.message}
        />
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
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#2A1F1A]">Description</label>
          <textarea
            rows={3}
            placeholder="Tell members about your gym..."
            {...register('description')}
            className="w-full rounded-xl border border-[#E0D8D0] bg-white px-4 py-3 text-sm text-[#2A1F1A] placeholder:text-[#9B9B9B] outline-none focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#1C1C1C]/10 transition-all resize-none"
          />
          {errors.description && (
            <p className="text-xs text-red-500">⚠ {errors.description.message}</p>
          )}
        </div>

        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={mutation.isPending}
        >
          <span className="flex items-center gap-2">
            <Save size={16} />
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </span>
        </Button>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────
// Tab: Theme
// ─────────────────────────────────────────
const ThemeTab = () => {
  const [selected,  setSelected]  = useState('default');
  const [success,   setSuccess]   = useState(null);
  const [apiError,  setApiError]  = useState(null);

  const { isLoading } = useQuery({
    queryKey: ['gym-me'],
    queryFn:  async () => {
      const res = await axiosInstance.get(API.GYM_ME);
      setSelected(res.data.data?.theme || 'default');
      return res.data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (theme) => axiosInstance.put(API.GYM_UPDATE_THEME, { theme }),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        setSuccess('Theme updated successfully');
        setApiError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setApiError(res.data.message);
      }
    },
    onError: () => setApiError('Something went wrong.'),
  });

  if (isLoading) return <Skeleton className="h-40" />;

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <Alert type="success" message={success} />
      <Alert type="error"   message={apiError} />

      <div className="grid grid-cols-5 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setSelected(theme.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              selected === theme.id
                ? 'border-[#1C1C1C] bg-[#FAF7F4]'
                : 'border-[#ECE4DC] hover:border-[#C4956A]'
            }`}
          >
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: theme.color }}
            />
            <span className="text-xs font-medium text-[#2A1F1A]">{theme.label}</span>
            {selected === theme.id && (
              <CheckCircle size={14} className="text-[#1C1C1C]" />
            )}
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={() => {
          setApiError(null);
          mutation.mutate(selected);
        }}
        disabled={mutation.isPending}
      >
        <span className="flex items-center gap-2">
          <Palette size={16} />
          {mutation.isPending ? 'Applying...' : 'Apply Theme'}
        </span>
      </Button>
    </div>
  );
};

// ─────────────────────────────────────────
// Tab: Password
// ─────────────────────────────────────────
const PasswordTab = () => {
  const [success,  setSuccess]  = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: (data) => axiosInstance.put('/user/change-password', {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        setSuccess('Password changed successfully');
        setApiError(null);
        reset();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setApiError(res.data.message);
      }
    },
    onError: () => setApiError('Something went wrong.'),
  });

  return (
    <div className="max-w-lg flex flex-col gap-4">
      <Alert type="success" message={success} />
      <Alert type="error"   message={apiError} />

      <form
        onSubmit={handleSubmit((data) => {
          setApiError(null);
          mutation.mutate(data);
        })}
        className="flex flex-col gap-4"
      >
        <div className="relative">
          <Input
            label="Current Password"
            type={showPass ? 'text' : 'password'}
            placeholder="Enter current password"
            registration={register('oldPassword')}
            error={errors.oldPassword?.message}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-8 text-[#6B6B6B] cursor-pointer"
          >
            {showPass ? '🙈' : '👁'}
          </button>
        </div>

        <Input
          label="New Password"
          type="password"
          placeholder="Min 6 chars, 1 uppercase, 1 number"
          registration={register('newPassword')}
          error={errors.newPassword?.message}
        />
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={mutation.isPending}
        >
          <span className="flex items-center gap-2">
            <Lock size={16} />
            {mutation.isPending ? 'Changing...' : 'Change Password'}
          </span>
        </Button>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────
// Main Settings Page
// ─────────────────────────────────────────
const tabs = [
  { id: 'gym',      label: 'Gym Info',  icon: Settings2 },
  { id: 'theme',    label: 'Theme',     icon: Palette   },
  { id: 'password', label: 'Password',  icon: Lock      },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('gym');

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1
          className="text-3xl font-black text-[#2A1F1A]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Settings
        </h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Manage your gym profile and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#ECE4DC]/50 rounded-2xl p-1.5 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#2A1F1A] shadow-sm'
                  : 'text-[#6B6B6B] hover:text-[#2A1F1A]'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-6 border border-[#ECE4DC] shadow-sm">
        {activeTab === 'gym'      && <GymInfoTab />}
        {activeTab === 'theme'    && <ThemeTab />}
        {activeTab === 'password' && <PasswordTab />}
      </div>

    </div>
  );
};

export default Settings;