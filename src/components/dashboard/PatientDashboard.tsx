
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, ClipboardList } from 'lucide-react';
import { DashboardStats } from '@/services/dashboardService';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';

// Import refactored components
import StatCard from './common/StatCard';
import AppointmentsTable from './patient/AppointmentsTable';
import PrescriptionsCard from './patient/PrescriptionsCard';
import LabResultsCard from './patient/LabResultsCard';
import { usePatientData } from './patient/usePatientData';

interface PatientDashboardProps {
  stats: DashboardStats;
  isLoading: boolean;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ stats, isLoading }) => {
  const navigate = useNavigate();
  const { prescriptions, labTests, isLoading: isDataLoading } = usePatientData();

  if (isLoading || isDataLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="h-32 animate-pulse">
            <div className="h-full"></div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Calendar className="h-8 w-8" />}
          title="Upcoming Appointments"
          value={(stats.upcomingAppointments?.length || 0).toString()}
          color="blue"
        />
        <StatCard
          icon={<FileText className="h-8 w-8" />}
          title="Prescriptions"
          value={(prescriptions?.length || 0).toString()}
          subtitle="Active"
          color="green"
        />
        <StatCard
          icon={<ClipboardList className="h-8 w-8" />}
          title="Test Results"
          value={(labTests?.filter(test => test.status === 'Pending').length || 0).toString()}
          subtitle="Pending"
          color="orange"
        />
      </div>

      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">My Appointments</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/appointments/new')}
          >
            Book New Appointment
          </Button>
        </div>
        <AppointmentsTable appointments={stats.upcomingAppointments || []} />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-xl font-bold mb-6">Recent Prescriptions</h2>
          <PrescriptionsCard prescriptions={prescriptions} />
        </GlassCard>
        
        <GlassCard>
          <h2 className="text-xl font-bold mb-6">Recent Lab Results</h2>
          <LabResultsCard labTests={labTests} />
        </GlassCard>
      </div>
    </div>
  );
};

export default PatientDashboard;
