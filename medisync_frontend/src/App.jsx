import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Feedback from './pages/Feedback';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All authenticated users get the Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Accessible by all roles — data filtered per role in each component */}
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="billing" element={<Billing />} />
          <Route path="feedback" element={<Feedback />} />

          {/* Admin + Doctor can see Patients list */}
          <Route path="patients" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']} />
          }>
            <Route index element={<Patients />} />
          </Route>

          {/* Admin only */}
          <Route path="doctors" element={
            <ProtectedRoute allowedRoles={['ADMIN']} />
          }>
            <Route index element={<Doctors />} />
          </Route>

          <Route path="inventory" element={
            <ProtectedRoute allowedRoles={['ADMIN']} />
          }>
            <Route index element={<Inventory />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
