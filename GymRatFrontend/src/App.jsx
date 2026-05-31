import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import useAuthRefresh from './hooks/useAuthRefresh';
import AdminLayout from './components/Layout/AdminLayout';

const Landing         = lazy(() => import('./pages/Landing/Landing'));
const GymPublic       = lazy(() => import('./pages/GymPublic/GymPublic'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard/AdminDashboard'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard/MemberDashboard'));
const RegisterGym     = lazy(() => import('./pages/RegisterGym/RegisterGym'));
const Login           = lazy(() => import('./pages/Login/Login'));

const PageLoader = () => {
  return (
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
};

const App = () => {
  const { isChecking } = useAuthRefresh();

  if (isChecking) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/"             element={<Landing />} />
        <Route path="/gym/:slug"    element={<GymPublic />} />
        <Route path="/register-gym" element={<RegisterGym />} />
        <Route path="/login"        element={<Login />} />

        {/* Admin routes — wrapped in layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index        element={<AdminDashboard />} />
          <Route path="members"       element={<div className="text-[#2A1F1A]">Members Page</div>} />
          <Route path="subscriptions" element={<div className="text-[#2A1F1A]">Subscriptions Page</div>} />
          <Route path="payments"      element={<div className="text-[#2A1F1A]">Payments Page</div>} />
          <Route path="attendance"    element={<div className="text-[#2A1F1A]">Attendance Page</div>} />
          <Route path="settings"      element={<div className="text-[#2A1F1A]">Settings Page</div>} />
        </Route>

        {/* Member routes */}
        <Route path="/member" element={<MemberDashboard />} />
      </Routes>
    </Suspense>
  );
};

export default App;