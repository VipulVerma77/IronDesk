import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import useAuthRefresh from './hooks/useAuthRefresh';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const Landing         = lazy(() => import('./pages/Landing/Landing'));
const GymPublic       = lazy(() => import('./pages/GymPublic/GymPublic'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard/AdminDashboard'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard/MemberDashboard'));
const RegisterGym     = lazy(() => import('./pages/RegisterGym/RegisterGym'));
const Login           = lazy(() => import('./pages/Login/Login'));
const Members         = lazy(() => import('./pages/Members/Members'));
const Subscriptions   = lazy(() => import('./pages/Subscriptions/Subscriptions'));
const Payments        = lazy(() => import('./pages/Payments/Payments'));
const Attendance      = lazy(() => import('./pages/Attendance/Attendance'));
const Settings        = lazy(() => import('./pages/Settings/Settings'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAF7F4]">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl border-[3px] border-[#E7DDD2] border-t-[#C4956A] animate-spin" />
        <div className="w-16 h-16 bg-[#1C1C1C] rounded-2xl flex items-center justify-center">
          <span className="text-white font-black text-lg">ID</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[#2A1F1A] font-medium">Loading IronDesk</p>
        <p className="text-[#6B6B6B] text-sm mt-1">Preparing your beast platform...</p>
      </div>
    </div>
  </div>
);

const App = () => {
  const { isChecking } = useAuthRefresh();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes — render immediately, no waiting */}
        <Route path="/"             element={<Landing />} />
        <Route path="/gym/:slug"    element={<GymPublic />} />
        <Route path="/register-gym" element={<RegisterGym />} />
        <Route path="/login"        element={<Login />} />

        {/* Protected routes — wait for auth check */}
        <Route element={
          isChecking
            ? <PageLoader />
            : <ProtectedRoute allowedRole="Admin" />
        }>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index              element={<AdminDashboard />} />
            <Route path="members"       element={<Members />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="payments"      element={<Payments />} />
            <Route path="attendance"    element={<Attendance />} />
            <Route path="settings"      element={<Settings />} />
          </Route>
        </Route>

        <Route element={
          isChecking
            ? <PageLoader />
            : <ProtectedRoute allowedRole="Member" />
        }>
          <Route path="/member" element={<MemberDashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
