
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Patients from "./pages/Patients";
import MedicalRecords from "./pages/MedicalRecords";
import Prescriptions from "./pages/Prescriptions";
import LabResults from "./pages/LabResults";
import PharmacyManagement from "./pages/PharmacyManagement";
import LabTechDashboard from "./pages/LabTechDashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
                <Patients />
              </ProtectedRoute>
            } />
            <Route path="/medical-records" element={
              <ProtectedRoute>
                <MedicalRecords />
              </ProtectedRoute>
            } />
            <Route path="/prescriptions" element={
              <ProtectedRoute>
                <Prescriptions />
              </ProtectedRoute>
            } />
            <Route path="/lab-results" element={
              <ProtectedRoute>
                <LabResults />
              </ProtectedRoute>
            } />
            <Route path="/pharmacy" element={
              <ProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                <PharmacyManagement />
              </ProtectedRoute>
            } />
            <Route path="/lab-tech" element={
              <ProtectedRoute allowedRoles={['admin', 'lab_technician']}>
                <LabTechDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
