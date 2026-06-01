import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, XCircle, CalendarDays, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [formData, setFormData] = useState({ patient: '', doctor: '', appointment_date: '', appointment_time: '' });

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setError(null);
      const [apptRes, docRes] = await Promise.all([api.get('appointments/'), api.get('doctors/')]);
      setAppointments(apptRes.data);
      setDoctors(docRes.data);
      // Only fetch patients list for admin (patient booking uses their own profile_id)
      if (user.role === 'ADMIN') {
        const patRes = await api.get('patients/');
        setPatients(patRes.data);
      }
    } catch (err) {
      console.error('Error fetching:', err);
      setError(`Error (${err.response?.status || 'Network'}): ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (user.role === 'PATIENT') payload.patient = user.profile_id;
      const response = await api.post('appointments/book/', payload);
      setBookingResult(response.data);
      setShowModal(false);
      setFormData({ patient: '', doctor: '', appointment_date: '', appointment_time: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Error booking appointment.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`appointments/${id}/`, { status });
      fetchData();
    } catch (err) {
      console.error('Error updating:', err);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      BOOKED: { cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock className="w-3 h-3" />, label: 'Booked' },
      COMPLETED: { cls: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="w-3 h-3" />, label: 'Completed' },
      CANCELLED: { cls: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" />, label: 'Cancelled' },
    };
    const s = map[status] || { cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: null, label: status };
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${s.cls}`}>{s.icon}{s.label}</span>;
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" /><div>{error}</div></div>;

  const canBook = user?.role !== 'DOCTOR';
  const canManage = user?.role !== 'PATIENT';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
          <p className="text-slate-500 text-sm mt-1">{appointments.length} total records</p>
        </div>
        {canBook && (
          <button
            onClick={() => { setFormData({ patient: '', doctor: '', appointment_date: '', appointment_time: '' }); setBookingResult(null); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        )}
      </div>

      {/* Success Banner */}
      {bookingResult && (
        <div className="bg-green-50 border border-green-200 p-5 rounded-2xl flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-green-800 font-bold text-lg">Appointment Booked!</h3>
            <p className="text-green-700 mt-1">Queue Number: <span className="font-bold text-2xl">#{bookingResult.queue?.queue_number}</span></p>
            <p className="text-green-700 text-sm">Estimated wait time: <strong>{bookingResult.queue?.estimated_wait_time} minutes</strong></p>
          </div>
          <button onClick={() => setBookingResult(null)} className="ml-auto text-green-400 hover:text-green-600 text-xl">×</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <CalendarDays className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-medium">No appointments found</p>
            <p className="text-sm mt-1">
              {canBook ? 'Book your first appointment using the button above.' : 'No appointments scheduled yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  {canManage && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                          {appt.patient_name?.[0]}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{appt.patient_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{appt.doctor_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{appt.appointment_date} at {appt.appointment_time?.slice(0,5)}</td>
                    <td className="px-6 py-4">{getStatusBadge(appt.status)}</td>
                    {canManage && (
                      <td className="px-6 py-4 text-right space-x-2">
                        {appt.status === 'BOOKED' && (
                          <>
                            <button onClick={() => updateStatus(appt.id, 'COMPLETED')} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-xs font-semibold border border-green-200">
                              Complete
                            </button>
                            <button onClick={() => updateStatus(appt.id, 'CANCELLED')} className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-xs font-semibold border border-red-200">
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Book Appointment</h3>
                <p className="text-slate-400 text-xs mt-0.5">Schedule a consultation</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
            </div>
            <form onSubmit={handleBook} className="p-6 space-y-4">
              {user?.role === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patient</label>
                  <select required name="patient" value={formData.patient} onChange={e => setFormData({...formData, patient: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patient_code})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Doctor</label>
                <select required name="doctor" value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} — {d.specialization}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                  <input required type="date" value={formData.appointment_date} min={new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, appointment_date: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time</label>
                  <input required type="time" value={formData.appointment_time} onChange={e => setFormData({...formData, appointment_time: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-semibold">Book Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
