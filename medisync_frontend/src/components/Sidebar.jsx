import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Activity, CalendarDays,
  ClipboardList, Package, Receipt, MessageSquare, LogOut, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role;

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium ${
      isActive
        ? 'bg-white/20 text-white shadow-sm'
        : 'text-blue-100 hover:bg-white/10 hover:text-white'
    }`;

  const roleColor = {
    ADMIN: 'bg-amber-400 text-amber-900',
    DOCTOR: 'bg-emerald-400 text-emerald-900',
    PATIENT: 'bg-sky-400 text-sky-900',
  };

  const roleLabel = {
    ADMIN: 'Administrator',
    DOCTOR: 'Doctor',
    PATIENT: 'Patient',
  };

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 h-screen fixed top-0 left-0 text-white flex flex-col shadow-2xl z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-white/10">
        <div className="bg-white/20 p-2 rounded-xl">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">MediSync</h1>
          <p className="text-blue-200 text-xs">Hospital Portal</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">{user?.username}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor[role] || 'bg-gray-400 text-gray-900'}`}>
              {roleLabel[role] || role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavLink to="/" className={navClass} end>
          <LayoutDashboard className="w-4 h-4 shrink-0" /> Dashboard
        </NavLink>

        {/* ADMIN-only */}
        {role === 'ADMIN' && (
          <>
            <p className="text-blue-300/60 text-xs font-semibold uppercase tracking-wider px-4 pt-3 pb-1">Management</p>
            <NavLink to="/doctors" className={navClass}>
              <UserPlus className="w-4 h-4 shrink-0" /> Doctors
            </NavLink>
            <NavLink to="/patients" className={navClass}>
              <Users className="w-4 h-4 shrink-0" /> Patients
            </NavLink>
            <NavLink to="/inventory" className={navClass}>
              <Package className="w-4 h-4 shrink-0" /> Inventory
            </NavLink>
          </>
        )}

        {/* DOCTOR-only */}
        {role === 'DOCTOR' && (
          <>
            <p className="text-blue-300/60 text-xs font-semibold uppercase tracking-wider px-4 pt-3 pb-1">My Work</p>
            <NavLink to="/patients" className={navClass}>
              <Users className="w-4 h-4 shrink-0" /> My Patients
            </NavLink>
          </>
        )}

        {/* ADMIN + DOCTOR */}
        {(role === 'ADMIN' || role === 'DOCTOR') && (
          <>
            <p className="text-blue-300/60 text-xs font-semibold uppercase tracking-wider px-4 pt-3 pb-1">Clinical</p>
            <NavLink to="/appointments" className={navClass}>
              <CalendarDays className="w-4 h-4 shrink-0" /> Appointments
            </NavLink>
            <NavLink to="/prescriptions" className={navClass}>
              <ClipboardList className="w-4 h-4 shrink-0" /> Prescriptions
            </NavLink>
            <NavLink to="/billing" className={navClass}>
              <Receipt className="w-4 h-4 shrink-0" /> Billing
            </NavLink>
            <NavLink to="/feedback" className={navClass}>
              <MessageSquare className="w-4 h-4 shrink-0" /> Feedback
            </NavLink>
          </>
        )}

        {/* PATIENT-only */}
        {role === 'PATIENT' && (
          <>
            <p className="text-blue-300/60 text-xs font-semibold uppercase tracking-wider px-4 pt-3 pb-1">My Health</p>
            <NavLink to="/appointments" className={navClass}>
              <CalendarDays className="w-4 h-4 shrink-0" /> My Appointments
            </NavLink>
            <NavLink to="/prescriptions" className={navClass}>
              <ClipboardList className="w-4 h-4 shrink-0" /> My Prescriptions
            </NavLink>
            <NavLink to="/billing" className={navClass}>
              <Receipt className="w-4 h-4 shrink-0" /> My Bills
            </NavLink>
            <NavLink to="/feedback" className={navClass}>
              <MessageSquare className="w-4 h-4 shrink-0" /> Give Feedback
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-150 text-sm font-medium group"
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
