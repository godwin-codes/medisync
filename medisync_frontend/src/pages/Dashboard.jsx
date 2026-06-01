import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, CalendarDays, IndianRupee, ClipboardList,
  Star, Receipt, ArrowRight, Package, TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow`}>
    <div className={`p-3.5 rounded-2xl ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{value}</h3>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, label, color, desc }) => (
  <Link to={to} className="group bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-700 text-sm">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
  </Link>
);

const weekData = [
  { day: 'Mon', appts: 12 }, { day: 'Tue', appts: 19 }, { day: 'Wed', appts: 15 },
  { day: 'Thu', appts: 22 }, { day: 'Fri', appts: 28 }, { day: 'Sat', appts: 10 }, { day: 'Sun', appts: 5 },
];
const revenueData = [
  { month: 'Week 1', rev: 45000 }, { month: 'Week 2', rev: 52000 },
  { month: 'Week 3', rev: 38000 }, { month: 'Week 4', rev: 61000 },
];
const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, revenue: 0, prescriptions: 0, unpaidBills: 0, avgRating: 0, pendingBillAmount: 0 });
  const [recentAppts, setRecentAppts] = useState([]);
  const [apptStatusData, setApptStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        setError(null);
        if (user.role === 'ADMIN') {
          const [docRes, patRes, apptRes, billRes] = await Promise.all([
            api.get('doctors/'), api.get('patients/'), api.get('appointments/'), api.get('bills/')
          ]);
          const today = new Date().toDateString();
          const todayAppts = apptRes.data.filter(a => new Date(a.appointment_date).toDateString() === today);
          const totalRev = billRes.data.filter(b => b.status === 'PAID').reduce((s, b) => s + parseFloat(b.amount), 0);
          const apptByStatus = [
            { name: 'Booked', value: apptRes.data.filter(a => a.status === 'BOOKED').length },
            { name: 'Completed', value: apptRes.data.filter(a => a.status === 'COMPLETED').length },
            { name: 'Cancelled', value: apptRes.data.filter(a => a.status === 'CANCELLED').length },
          ].filter(x => x.value > 0);
          setStats(s => ({ ...s, doctors: docRes.data.length, patients: patRes.data.length, appointments: todayAppts.length, revenue: totalRev }));
          setRecentAppts(apptRes.data.slice(0, 5));
          setApptStatusData(apptByStatus);
        } else if (user.role === 'DOCTOR') {
          const [apptRes, patRes, prescRes, feedRes] = await Promise.all([
            api.get('appointments/'), api.get('patients/'), api.get('prescriptions/'), api.get('feedback/')
          ]);
          const avg = feedRes.data.length > 0
            ? (feedRes.data.reduce((s, f) => s + f.rating, 0) / feedRes.data.length).toFixed(1)
            : '—';
          const bookedToday = apptRes.data.filter(a => a.status === 'BOOKED').length;
          setStats(s => ({ ...s, patients: patRes.data.length, appointments: bookedToday, prescriptions: prescRes.data.length, avgRating: avg }));
          setRecentAppts(apptRes.data.slice(0, 5));
          setApptStatusData([
            { name: 'Booked', value: apptRes.data.filter(a => a.status === 'BOOKED').length },
            { name: 'Completed', value: apptRes.data.filter(a => a.status === 'COMPLETED').length },
          ].filter(x => x.value > 0));
        } else if (user.role === 'PATIENT') {
          const [apptRes, prescRes, billRes] = await Promise.all([
            api.get('appointments/'), api.get('prescriptions/'), api.get('bills/')
          ]);
          const unpaid = billRes.data.filter(b => b.status === 'UNPAID');
          const totalPaid = billRes.data.filter(b => b.status === 'PAID').reduce((s, b) => s + parseFloat(b.amount), 0);
          const pendingAmt = unpaid.reduce((s, b) => s + parseFloat(b.amount), 0);
          setStats(s => ({ ...s, appointments: apptRes.data.length, prescriptions: prescRes.data.length, unpaidBills: unpaid.length, revenue: totalPaid, pendingBillAmount: pendingAmt }));
          setRecentAppts(apptRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-slate-500 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <div><strong>Dashboard Error:</strong> {error} — Please try logging out and back in.</div>
    </div>
  );

  const statusBadge = (status) => {
    const map = {
      BOOKED: 'bg-blue-100 text-blue-700 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-700 border-green-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${map[status] || 'bg-gray-100 text-gray-700'}`}>{status.toLowerCase()}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Welcome back, {user?.username}! 👋</h2>
          <p className="text-blue-200 text-sm mt-1">
            {user?.role === 'ADMIN' && 'Manage the entire hospital system from here.'}
            {user?.role === 'DOCTOR' && 'Review your appointments and write prescriptions.'}
            {user?.role === 'PATIENT' && 'View your health records, bills, and appointments.'}
          </p>
        </div>
        <div className="text-right text-blue-200 text-sm">
          <p className="text-white font-semibold text-base">{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</p>
          <p>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {user?.role === 'ADMIN' && (
          <>
            <StatCard title="Total Doctors" value={stats.doctors} icon={UserPlus} color="bg-blue-100 text-blue-600" sub="Registered doctors" />
            <StatCard title="Total Patients" value={stats.patients} icon={Users} color="bg-green-100 text-green-600" sub="Registered patients" />
            <StatCard title="Today's Appointments" value={stats.appointments} icon={CalendarDays} color="bg-purple-100 text-purple-600" sub="Scheduled for today" />
            <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={IndianRupee} color="bg-amber-100 text-amber-600" sub="From paid bills" />
          </>
        )}
        {user?.role === 'DOCTOR' && (
          <>
            <StatCard title="My Patients" value={stats.patients} icon={Users} color="bg-blue-100 text-blue-600" sub="Assigned to you" />
            <StatCard title="Pending Appointments" value={stats.appointments} icon={CalendarDays} color="bg-purple-100 text-purple-600" sub="Booked & waiting" />
            <StatCard title="Prescriptions Written" value={stats.prescriptions} icon={ClipboardList} color="bg-green-100 text-green-600" sub="Total records" />
            <StatCard title="Avg Rating" value={`${stats.avgRating} / 5`} icon={Star} color="bg-amber-100 text-amber-600" sub="From patient feedback" />
          </>
        )}
        {user?.role === 'PATIENT' && (
          <>
            <StatCard title="My Appointments" value={stats.appointments} icon={CalendarDays} color="bg-blue-100 text-blue-600" sub="Total visits" />
            <StatCard title="Prescriptions" value={stats.prescriptions} icon={ClipboardList} color="bg-green-100 text-green-600" sub="Medical records" />
            <StatCard title="Unpaid Bills" value={stats.unpaidBills} icon={Receipt} color="bg-red-100 text-red-600" sub={stats.unpaidBills > 0 ? `₹${stats.pendingBillAmount.toLocaleString('en-IN')} pending` : 'All clear!'} />
            <StatCard title="Total Paid" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={IndianRupee} color="bg-purple-100 text-purple-600" sub="Lifetime payments" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" /> Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.role === 'ADMIN' && (
            <>
              <QuickAction to="/doctors" icon={UserPlus} label="Add New Doctor" desc="Register a doctor to the system" color="bg-blue-100 text-blue-600" />
              <QuickAction to="/patients" icon={Users} label="Manage Patients" desc="View & edit patient records" color="bg-green-100 text-green-600" />
              <QuickAction to="/inventory" icon={Package} label="Medicine Inventory" desc="Update stock & add medicines" color="bg-amber-100 text-amber-600" />
              <QuickAction to="/appointments" icon={CalendarDays} label="Appointments" desc="Book & manage appointments" color="bg-purple-100 text-purple-600" />
              <QuickAction to="/prescriptions" icon={ClipboardList} label="Prescriptions" desc="View all prescriptions" color="bg-teal-100 text-teal-600" />
              <QuickAction to="/billing" icon={Receipt} label="Billing" desc="Mark bills as paid" color="bg-rose-100 text-rose-600" />
            </>
          )}
          {user?.role === 'DOCTOR' && (
            <>
              <QuickAction to="/prescriptions" icon={ClipboardList} label="Write Prescription" desc="Create a new prescription & bill" color="bg-blue-100 text-blue-600" />
              <QuickAction to="/appointments" icon={CalendarDays} label="My Schedule" desc="View today's appointments" color="bg-purple-100 text-purple-600" />
              <QuickAction to="/patients" icon={Users} label="My Patients" desc="View assigned patient records" color="bg-green-100 text-green-600" />
              <QuickAction to="/billing" icon={Receipt} label="Billing" desc="Mark bills as paid" color="bg-amber-100 text-amber-600" />
              <QuickAction to="/feedback" icon={Star} label="My Reviews" desc="See patient feedback" color="bg-yellow-100 text-yellow-600" />
            </>
          )}
          {user?.role === 'PATIENT' && (
            <>
              <QuickAction to="/appointments" icon={CalendarDays} label="Book Appointment" desc="Schedule a visit with a doctor" color="bg-blue-100 text-blue-600" />
              <QuickAction to="/prescriptions" icon={ClipboardList} label="My Prescriptions" desc="View your medicine records" color="bg-green-100 text-green-600" />
              <QuickAction to="/billing" icon={Receipt} label="Pay Bills" desc="View & pay outstanding bills" color="bg-red-100 text-red-600" />
              <QuickAction to="/feedback" icon={Star} label="Give Feedback" desc="Rate your doctor" color="bg-yellow-100 text-yellow-600" />
            </>
          )}
        </div>
      </div>

      {/* Charts & Recent Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-sm">Recent Appointments</h3>
            <Link to="/appointments" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentAppts.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">No appointments yet.</div>
            ) : recentAppts.map(appt => (
              <div key={appt.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold shrink-0">
                    {appt.patient_name?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{appt.patient_name}</p>
                    <p className="text-xs text-slate-400">{appt.doctor_name} • {appt.appointment_date}</p>
                  </div>
                </div>
                {statusBadge(appt.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status Pie or Stat summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-700 text-sm">Appointment Status</h3>
          </div>
          <div className="p-4 h-56">
            {apptStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={apptStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {apptStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Line Chart - appointments per week (Admin/Doctor only) */}
      {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-500" /> Weekly Appointments Trend
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="appts" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-green-500" /> Monthly Revenue Overview
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Bar dataKey="rev" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
