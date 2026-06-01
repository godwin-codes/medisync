import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

const Layout = () => {
  const { user } = useAuth();

  const roleTitles = {
    ADMIN: 'System Administrator',
    DOCTOR: 'Medical Doctor Portal',
    PATIENT: 'Patient Health Portal',
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">{roleTitles[user?.role] || 'MediSync Portal'}</h1>
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 bg-slate-100 rounded-xl px-3 py-2">
              <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-700 leading-none">{user?.username}</p>
                <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-8 py-3 text-center text-xs text-slate-400 border-t border-slate-200">
          © 2026 MediSync Hospital Management System
        </footer>
      </div>
    </div>
  );
};

export default Layout;
