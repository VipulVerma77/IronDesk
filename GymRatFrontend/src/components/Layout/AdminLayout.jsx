import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[#FAF7F4] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top header */}
        <div className="sticky top-0 z-10 bg-[#FAF7F4]/80 backdrop-blur-sm border-b border-[#ECE4DC] px-8 py-4 flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-black text-[#2A1F1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Admin Panel
            </h1>
            <p className="text-xs text-[#6B6B6B]">
              Manage your gym from one place
            </p>
          </div>

          {/* Right side — date */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-[#2A1F1A]">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year:    'numeric',
                  month:   'long',
                  day:     'numeric',
                })}
              </p>
              <p className="text-xs text-[#6B6B6B]">Today</p>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;