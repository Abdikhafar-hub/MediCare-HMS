import React, { useState, useEffect } from 'react';
import { DashboardStats } from '@/services/dashboardService';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, FileText, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface DoctorDashboardProps {
  stats: DashboardStats;
  isLoading: boolean;
}

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  department: string | null;
  date: string;
  status: string;
  reason: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  patient_name?: string; // Add patient_name to the Appointment type
}

interface Patient {
  id: string;
  name: string;
  gender?: string;
  dob?: string;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ stats, isLoading }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enrichedUpcomingAppointments, setEnrichedUpcomingAppointments] = useState<Appointment[]>([]);

  // Fetch patient data and enrich upcoming appointments
  useEffect(() => {
    const enrichAppointments = async () => {
      try {
        // Fetch patient data
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, name');

        if (patientsError) throw patientsError;

        // Enrich upcoming appointments with patient names
        const enriched = stats.upcomingAppointments?.map((appointment: Appointment) => {
          const patient = patientsData?.find((p: Patient) => p.id === appointment.patient_id);
          return {
            ...appointment,
            patient_name: patient?.name || 'Unknown',
          };
        }) || [];

        setEnrichedUpcomingAppointments(enriched);
      } catch (error: any) {
        console.error('Error enriching upcoming appointments:', error);
        toast({
          title: "Error",
          description: "Failed to load patient names for upcoming appointments",
          variant: "destructive",
        });
        // Fallback to original appointments with "Unknown" names
        setEnrichedUpcomingAppointments(
          stats.upcomingAppointments?.map((appointment: Appointment) => ({
            ...appointment,
            patient_name: 'Unknown',
          })) || []
        );
      }
    };

    if (stats.upcomingAppointments) {
      enrichAppointments();
    }
  }, [stats.upcomingAppointments, toast]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} className="h-32 animate-pulse">
            <div className="h-full"></div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Calendar className="h-8 w-8" />}
          title="Today's Appointments"
          value={stats.appointments.toString()}
          color="blue"
        />
        <StatCard
          icon={<Clock className="h-8 w-8" />}
          title="Upcoming Appointments"
          value={(stats.upcomingAppointments?.length || 0).toString()}
          color="green"
        />
        <StatCard
          icon={<User className="h-8 w-8" />}
          title="Recent Patients"
          value={(stats.recentPatients?.length || 0).toString()}
          color="purple"
        />
        <StatCard
          icon={<FileText className="h-8 w-8" />}
          title="Pending Reports"
          value="4"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Upcoming Appointments</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
              View All
            </Button>
          </div>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrichedUpcomingAppointments.length > 0 ? (
                  enrichedUpcomingAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">{appointment.patient_name}</td>
                      <td className="py-3 px-4">
                        {new Date(appointment.date).toLocaleDateString()} {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                            appointment.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : appointment.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          )}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/appointments?id=${appointment.id}`)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No upcoming appointments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Patients</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
              View All
            </Button>
          </div>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Gender</th>
                  <th className="text-left py-3 px-4 font-medium">Age</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPatients && stats.recentPatients.length > 0 ? (
                  stats.recentPatients.map((patient) => (
                    <tr key={patient.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">{patient.name}</td>
                      <td className="py-3 px-4">{patient.gender || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {patient.dob 
                          ? Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/patients/${patient.id}`)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No recent patients
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Today's Appointments</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Patient</th>
                <th className="text-left py-3 px-4 font-medium">Time</th>
                <th className="text-left py-3 px-4 font-medium">Department</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.todayAppointments.length > 0 ? (
                stats.todayAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">{appointment.patients?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 px-4">{appointment.department || 'General'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        )}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/appointments?id=${appointment.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No appointments scheduled for today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  change,
  trend,
  color,
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300',
    red: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
  };

  return (
    <GlassCard hoverEffect className="transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>{icon}</div>
        {change && (
          <div
            className={cn(
              'text-sm font-medium px-2 py-1 rounded',
              trend === 'up'
                ? 'text-green-600 bg-green-100/50 dark:text-green-400 dark:bg-green-500/10'
                : 'text-red-600 bg-red-100/50 dark:text-red-400 dark:bg-red-500/10'
            )}
          >
            {change}
          </div>
        )}
      </div>
      <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && (
          <p className="ml-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </GlassCard>
  );
};

export default DoctorDashboard;