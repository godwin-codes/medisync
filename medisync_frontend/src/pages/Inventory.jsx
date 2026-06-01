import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, PackageSearch } from 'lucide-react';
import api from '../services/api';

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', price: '', stock_quantity: ''
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('medicines/');
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`medicines/${formData.id}/`, formData);
      } else {
        await api.post('medicines/', formData);
      }
      setShowModal(false);
      setFormData({ name: '', price: '', stock_quantity: '' });
      fetchMedicines();
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const handleEdit = (medicine) => {
    setFormData(medicine);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`medicines/${id}/`);
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (med.medicine_code && med.medicine_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Medicine Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">{medicines.length} medicines registered</p>
        </div>
        <button 
          onClick={() => { setFormData({ name: '', price: '', stock_quantity: '' }); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><PackageSearch className="w-6 h-6"/></div>
           <div>
              <p className="text-sm font-medium text-slate-500">Total Medicines</p>
              <h3 className="text-2xl font-bold text-slate-900">{medicines.length}</h3>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="p-3 bg-red-100 text-red-600 rounded-xl"><AlertTriangle className="w-6 h-6"/></div>
           <div>
              <p className="text-sm font-medium text-slate-500">Low Stock Alert (&lt; 10)</p>
              <h3 className="text-2xl font-bold text-slate-900">{medicines.filter(m => m.stock_quantity < 10).length}</h3>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search medicines..." 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Medicine Name</th>
                <th className="px-6 py-4">Price (₹)</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
            {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4"><span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{medicine.medicine_code}</span></td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{medicine.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">₹{Number(medicine.price).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm">
                    {medicine.stock_quantity < 10 ? (
                      <span className="flex items-center gap-1.5 text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-lg w-fit"><AlertTriangle className="w-3.5 h-3.5"/> {medicine.stock_quantity} — Low!</span>
                    ) : (
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-sm">{medicine.stock_quantity} in stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(medicine)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(medicine.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMedicines.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400">No medicines found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{formData.id ? 'Edit Medicine' : 'Add New Medicine'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Medicine Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Paracetamol 500mg" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹)</label>
                  <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity</label>
                  <input required type="number" min="0" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-semibold">Save Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
