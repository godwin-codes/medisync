import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Feedback = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: '', doctor: '', rating: 5, comments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feedRes, docsRes, patsRes] = await Promise.all([
        api.get('feedback/'),
        api.get('doctors/'),
        api.get('patients/')
      ]);
      setFeedbacks(feedRes.data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      setDoctors(docsRes.data);
      setPatients(patsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      const payload = { ...formData };
      // Auto-inject patient's own ID if logged in as patient
      if (user?.role === 'PATIENT') {
        payload.patient = user.profile_id;
      }
      await api.post('feedback/', payload);
      setShowModal(false);
      setFormData({ patient: '', doctor: '', rating: 5, comments: '' });
      fetchData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Check console.');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-500">
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} className={`w-4 h-4 ${star <= rating ? 'fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Patient Feedback</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-medical-blue-600 hover:bg-medical-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <MessageSquarePlus className="w-5 h-5" /> Submit Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800">
         {feedbacks.length === 0 ? (
           <div className="col-span-full bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">No feedback submitted yet.</div>
         ) : (
           feedbacks.map(feedback => (
             <div key={feedback.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{feedback.patient_name}</h4>
                    <p className="text-sm text-gray-500">for Dr. {feedback.doctor_name}</p>
                  </div>
                  {renderStars(feedback.rating)}
               </div>
               <p className="text-gray-700 mt-2 mb-6 italic flex-grow">"{feedback.comments || 'No written comments provided.'}"</p>
               <div className="text-xs text-gray-400 flex items-center gap-1 mt-auto pt-4 border-t border-gray-50">
                  <Clock className="w-3 h-3" /> {new Date(feedback.created_at).toLocaleDateString()}
               </div>
             </div>
           ))
         )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Submit Feedback</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-700">
              {user?.role !== 'PATIENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <select required name="patient" value={formData.patient} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500 bg-white">
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select required name="doctor" value={formData.doctor} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500 bg-white">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <div className="flex items-center gap-2">
                    <input type="range" name="rating" min="1" max="5" value={formData.rating} onChange={handleInputChange} className="w-full" />
                    <span className="font-bold text-lg w-6 text-center text-medical-blue-600">{formData.rating}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea name="comments" value={formData.comments} onChange={handleInputChange} rows="3" placeholder="Share your experience..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-medical-blue-600 hover:bg-medical-blue-700 text-white rounded-lg transition-colors font-medium">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
