import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, FileText, Pill, Trash2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ appointment: '', notes: '' });
  const [selectedMeds, setSelectedMeds] = useState([{ medicine_id: '', dosage: '', quantity: 1 }]);
  const [result, setResult] = useState(null);

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setError(null);
      const [prescRes, medRes] = await Promise.all([api.get('prescriptions/'), api.get('medicines/')]);
      setPrescriptions(prescRes.data);
      setMedicines(medRes.data);
      if (user.role === 'DOCTOR' || user.role === 'ADMIN') {
        const apptRes = await api.get('appointments/');
        setAppointments(apptRes.data.filter(a => a.status === 'BOOKED'));
      }
    } catch (err) {
      setError(`${err.response?.status || 'Network'}: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        doctor: user.role === 'DOCTOR' ? user.profile_id : formData.doctor,
        medicines: selectedMeds.filter(m => m.medicine_id !== '')
      };
      const response = await api.post('prescriptions/create/', payload);
      setResult(response.data);
      setShowModal(false);
      setFormData({ appointment: '', notes: '' });
      setSelectedMeds([{ medicine_id: '', dosage: '', quantity: 1 }]);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create prescription.');
    }
  };

  const updateMed = (i, field, val) => {
    const updated = [...selectedMeds];
    updated[i][field] = val;
    setSelectedMeds(updated);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" /><div>{error}</div></div>;

  const isDoctor = user?.role === 'DOCTOR';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Prescriptions</h2>
          <p className="text-slate-500 text-sm mt-1">{prescriptions.length} records found</p>
        </div>
        {isDoctor && (
          <button
            onClick={() => { setFormData({ appointment: '', notes: '' }); setSelectedMeds([{ medicine_id: '', dosage: '', quantity: 1 }]); setResult(null); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Write Prescription
          </button>
        )}
      </div>

      {/* Success */}
      {result && (
        <div className="bg-green-50 border border-green-200 p-5 rounded-2xl flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-green-800">Prescription Created & Bill Generated!</h3>
            <p className="text-green-700 text-sm mt-1">Bill #{result.bill?.id} • Amount: <strong>₹{result.bill?.amount}</strong></p>
          </div>
          <button onClick={() => setResult(null)} className="ml-auto text-green-400 hover:text-green-600 text-xl">×</button>
        </div>
      )}

      {/* Prescription cards */}
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 flex flex-col items-center text-slate-400">
          <FileText className="w-12 h-12 mb-3 text-slate-300" />
          <p className="font-medium">No prescriptions found</p>
          {isDoctor && <p className="text-sm mt-1">Write your first prescription using the button above.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {prescriptions.map(presc => (
            <div key={presc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {presc.patient_name?.[0] || 'P'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{presc.patient_name}</h3>
                    <p className="text-sm text-slate-500">Dr. {presc.doctor_name} · {presc.prescription_date}</p>
                  </div>
                </div>
                <span className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full font-medium">Rx #{presc.id}</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {presc.notes && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Doctor's Notes</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 italic">"{presc.notes}"</p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Pill className="w-3 h-3" /> Medicines Prescribed
                  </h4>
                  <ul className="space-y-2">
                    {presc.medicines?.map(med => (
                      <li key={med.id} className="flex items-center justify-between text-sm bg-blue-50 rounded-lg px-3 py-2">
                        <span className="font-medium text-slate-700">{med.medicine_name} <span className="text-slate-500 font-normal">· {med.dosage}</span></span>
                        <span className="text-blue-700 font-semibold">×{med.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-slate-800">Write New Prescription</h3>
                <p className="text-slate-400 text-xs mt-0.5">This will auto-generate a bill on submission</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <form id="presc-form" onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Appointment (BOOKED)</label>
                  <select required value={formData.appointment} onChange={e => setFormData({ ...formData, appointment: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                    <option value="">Choose an appointment...</option>
                    {appointments.map(a => <option key={a.id} value={a.id}>{a.patient_name} — {a.appointment_date} at {a.appointment_time?.slice(0,5)}</option>)}
                  </select>
                  {appointments.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠ No booked appointments found. Ask admin to book one first.</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Medicines (Rx)</label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase">
                      <span className="col-span-5">Medicine</span>
                      <span className="col-span-4">Dosage</span>
                      <span className="col-span-2">Qty</span>
                      <span className="col-span-1"></span>
                    </div>
                    <div className="p-3 space-y-2">
                      {selectedMeds.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <select
                              required
                              value={item.medicine_id}
                              onChange={e => updateMed(i, 'medicine_id', e.target.value)}
                              className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              <option value="">Select...</option>
                              {medicines.map(m => (
                                <option key={m.id} value={m.id} disabled={m.stock_quantity < 1}>
                                  {m.name} {m.stock_quantity < 1 ? '(Out of stock)' : `(${m.stock_quantity})`}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-4">
                            <input required type="text" placeholder="e.g. 1-0-1" value={item.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="col-span-2">
                            <input required type="number" min="1" value={item.quantity} onChange={e => updateMed(i, 'quantity', e.target.value)} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            {selectedMeds.length > 1 && (
                              <button type="button" onClick={() => setSelectedMeds(selectedMeds.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-3">
                      <button type="button" onClick={() => setSelectedMeds([...selectedMeds, { medicine_id: '', dosage: '', quantity: 1 }])} className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Another Medicine
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Doctor's Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows="3" placeholder="Diet restrictions, special instructions, follow-up dates..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-white rounded-xl transition-colors text-sm font-medium">Cancel</button>
              <button type="submit" form="presc-form" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-semibold">Submit & Generate Bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
