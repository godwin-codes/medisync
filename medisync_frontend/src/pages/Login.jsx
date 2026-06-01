import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Lock, User, Eye, EyeOff, ChevronRight, ShieldCheck, Stethoscope, HeartPulse, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const roles = [
  {
    key: 'admin',
    label: 'Administrator',
    description: 'Manage doctors, patients, inventory & billing',
    icon: ShieldCheck,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    selectedBorder: 'border-amber-500',
    ring: 'ring-amber-300',
    iconBg: 'bg-amber-100 text-amber-600',
    badgeColor: 'bg-amber-500',
    demo: { username: 'admin', password: 'admin123' },
  },
  {
    key: 'doctor',
    label: 'Doctor',
    description: 'View appointments, write prescriptions & generate bills',
    icon: Stethoscope,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    selectedBorder: 'border-emerald-500',
    ring: 'ring-emerald-300',
    iconBg: 'bg-emerald-100 text-emerald-600',
    badgeColor: 'bg-emerald-500',
    demo: { username: 'sarah.j', password: 'doctorpassword' },
  },
  {
    key: 'patient',
    label: 'Patient',
    description: 'View prescriptions, appointments, bills & give feedback',
    icon: HeartPulse,
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    selectedBorder: 'border-sky-500',
    ring: 'ring-sky-300',
    iconBg: 'bg-sky-100 text-sky-600',
    badgeColor: 'bg-sky-500',
    demo: { username: 'maria.garcia', password: 'patientpassword' },
  },
];

const Login = () => {
  const [step, setStep] = useState(1); // 1 = role select, 2 = login form
  const [selectedRole, setSelectedRole] = useState(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Auto-fill demo credentials for the chosen role
    setCredentials({ username: role.demo.username, password: role.demo.password });
    setError('');
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('auth/login/', credentials);
      const { user, profile_id, access, refresh } = response.data;
      login({ ...user, profile_id }, access, refresh);
      navigate('/');
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (err.message === 'Network Error'
          ? 'Cannot connect to server. Make sure the backend is running.'
          : `Login failed: ${err.message}`);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const role = selectedRole;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur p-4 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">MediSync</h1>
          <p className="text-blue-300 text-sm mt-1">Hospital Management System</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* ── STEP 1: Role Selection ── */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-800 text-center">Who are you?</h2>
              <p className="text-slate-500 text-sm text-center mt-1 mb-7">Select your role to continue</p>

              <div className="space-y-3">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole?.key === r.key;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                        isSelected
                          ? `${r.selectedBorder} ${r.bg} ring-4 ${r.ring} scale-[1.01]`
                          : `${r.border} bg-white hover:${r.bg} hover:${r.selectedBorder}`
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${r.iconBg} shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800">{r.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{r.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? `${r.badgeColor} border-transparent` : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedRole}
                className="w-full mt-7 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all"
              >
                Continue as {selectedRole?.label || '...'}
                <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-center text-sm text-slate-500 mt-5">
                New patient?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Register here</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: Login Form ── */}
          {step === 2 && role && (
            <>
              {/* Coloured header strip based on role */}
              <div className={`bg-gradient-to-r ${role.gradient} px-8 pt-7 pb-6 text-white`}>
                <button onClick={handleBack} className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium mb-4 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Role
                </button>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-xl">
                    <role.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Signing in as</p>
                    <h2 className="text-xl font-bold">{role.label}</h2>
                  </div>
                </div>
              </div>

              <div className="px-8 py-7">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="username"
                        type="text"
                        required
                        autoComplete="username"
                        autoFocus
                        value={credentials.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 text-slate-800 text-sm transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 text-slate-800 text-sm transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <span className="font-semibold text-slate-500">Demo credentials pre-filled:</span> {role.demo.username} / {role.demo.password}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r ${role.gradient} hover:opacity-90 disabled:opacity-60 text-white font-bold rounded-2xl transition text-sm mt-1`}
                  >
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                    ) : (
                      <>Sign in as {role.label} <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-blue-300/60 text-xs mt-6">© 2026 MediSync Hospital Management System</p>
      </div>
    </div>
  );
};

export default Login;
