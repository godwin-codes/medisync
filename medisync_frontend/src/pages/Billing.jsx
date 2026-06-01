import React, { useState, useEffect } from 'react';
import { IndianRupee, Printer, CheckCircle, AlertCircle, Receipt, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Billing = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchBills(); }, [user]);

  const fetchBills = async () => {
    if (!user) return;
    try {
      setError(null);
      const res = await api.get('bills/');
      setBills(res.data);
    } catch (err) {
      setError(`${err.response?.status || 'Network'}: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    if (!window.confirm('Confirm payment for this bill?')) return;
    try {
      await api.post(`bills/${id}/pay/`);
      fetchBills();
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handlePrint = (bill) => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Receipt – BIL-${String(bill.id).padStart(4,'0')}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 800; color: #1e3a8a; } .logo span { color: #2563eb; }
        .badge { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 8px; padding: 6px 14px; font-weight: 700; font-size: 13px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; }
        .box h3 { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
        .box p { font-size: 15px; font-weight: 600; color: #1e293b; margin: 3px 0; }
        .total { margin-top: 30px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #6ee7b7; border-radius: 12px; padding: 24px; text-align: right; }
        .total p { color: #065f46; font-size: 13px; margin-bottom: 4px; }
        .total h2 { font-size: 32px; font-weight: 800; color: #047857; }
        .status { display: inline-block; background: #d1fae5; color: #065f46; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-top: 8px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head><body>
      <div class="header">
        <div>
          <div class="logo">Medi<span>Sync</span></div>
          <p style="color:#64748b;font-size:13px;margin-top:4px">123 Health Avenue, Medical District<br>+91 98765 43210</p>
        </div>
        <div style="text-align:right">
          <div class="badge">RECEIPT</div>
          <p style="color:#64748b;font-size:13px;margin-top:8px">Date: ${new Date().toLocaleDateString('en-IN')}</p>
        </div>
      </div>
      <div class="grid">
        <div class="box"><h3>Bill Information</h3>
          <p>BIL-${String(bill.id).padStart(4,'0')}</p>
          <p>Date: ${new Date(bill.bill_date).toLocaleDateString('en-IN')}</p>
          <span class="status">✓ PAID</span>
        </div>
        <div class="box"><h3>Patient Details</h3><p>${bill.patient_name}</p></div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f1f5f9">
          <th style="padding:12px;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase">Description</th>
          <th style="padding:12px;text-align:right;font-size:12px;color:#64748b;text-transform:uppercase">Amount</th>
        </tr></thead>
        <tbody><tr>
          <td style="padding:14px;border-bottom:1px solid #f1f5f9">Medical Consultation + Prescribed Medicines</td>
          <td style="padding:14px;text-align:right;font-weight:600">₹${Number(bill.amount).toLocaleString('en-IN')}</td>
        </tr></tbody>
      </table>
      <div class="total">
        <p>Total Amount Paid</p>
        <h2>₹${Number(bill.amount).toLocaleString('en-IN')}</h2>
      </div>
      <div class="footer">
        <p>Thank you for choosing MediSync Hospital. Wishing you a speedy recovery!</p>
        <p style="margin-top:4px">Computer-generated receipt. No signature required.</p>
      </div>
    </body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
  };

  const totalPaid = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalPending = bills.filter(b => b.status === 'UNPAID').reduce((s, b) => s + parseFloat(b.amount), 0);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" /><div>{error}</div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Billing & Payments</h2>
        <p className="text-slate-500 text-sm mt-1">{bills.length} bills total</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Received</p>
              <h3 className="text-3xl font-bold mt-1">₹{totalPaid.toLocaleString('en-IN')}</h3>
              <p className="text-green-200 text-xs mt-1">{bills.filter(b => b.status === 'PAID').length} paid bills</p>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl">
              <CheckCircle className="w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Pending Payments</p>
              <h3 className="text-3xl font-bold mt-1">₹{totalPending.toLocaleString('en-IN')}</h3>
              <p className="text-red-200 text-xs mt-1">{bills.filter(b => b.status === 'UNPAID').length} unpaid bills</p>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl">
              <Clock className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-700">All Bills</h3>
        </div>
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Receipt className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-medium">No bills found</p>
            <p className="text-sm">Bills are auto-generated when prescriptions are created.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Bill #</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bills.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-700">BIL-{String(bill.id).padStart(4,'0')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 text-green-700 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">
                          {bill.patient_name?.[0]}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{bill.patient_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{bill.bill_date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">₹{Number(bill.amount).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      {bill.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <Clock className="w-3 h-3" /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {bill.status === 'UNPAID' ? (
                        <button onClick={() => handlePay(bill.id)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors">
                          {user?.role === 'PATIENT' ? '💳 Pay Now' : '✓ Mark Paid'}
                        </button>
                      ) : (
                        <button onClick={() => handlePrint(bill)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto">
                          <Printer className="w-3.5 h-3.5" /> Print Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
