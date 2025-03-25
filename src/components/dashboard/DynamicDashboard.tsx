
import React from 'react';
import { DashboardStats } from '@/services/dashboardService';
import { UserRole } from '@/context/AuthContext';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import NurseDashboard from './NurseDashboard';
import PatientDashboard from './PatientDashboard';
import PharmacistDashboard from './PharmacistDashboard';
import LabTechnicianDashboard from './LabTechnicianDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import { Loader2 } from 'lucide-react';

interface DynamicDashboardProps {
  userRole: UserRole;
  stats: DashboardStats;
  isLoading: boolean;
}

const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ 
  userRole, 
  stats, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-xl">Loading dashboard data...</p>
      </div>
    );
  }

  // Render the dashboard based on user role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard stats={stats} isLoading={isLoading} />;
    case 'doctor':
      return <DoctorDashboard stats={stats} isLoading={isLoading} />;
    case 'nurse':
      return <NurseDashboard stats={stats} isLoading={isLoading} />;
    case 'patient':
      return <PatientDashboard stats={stats} isLoading={isLoading} />;
    case 'pharmacist':
      return <PharmacistDashboard stats={stats} isLoading={isLoading} />;
    case 'lab_technician':
      return <LabTechnicianDashboard stats={stats} isLoading={isLoading} />;
    case 'receptionist':
      return <ReceptionistDashboard stats={stats} isLoading={isLoading} />;
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to MediCare</h2>
          <p className="text-muted-foreground">
            Your role ({userRole}) doesn't have a specific dashboard yet.
            Please contact an administrator for assistance.
          </p>
        </div>
      );
  }
};

export default DynamicDashboard;
