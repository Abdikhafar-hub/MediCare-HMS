
import React from 'react';
import { DashboardStats } from '@/services/dashboardService';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, UserPlus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReceptionistDashboardProps {
  stats: DashboardStats;
  isLoading: boolean;
}

const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ stats, isLoading }) => {
  const navigate = useNavigate();

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
          icon={<Users className="h-8 w-8" />}
          title="Total Patients"
          value={(stats.patients || 0).toString()}
          color="green"
        />
        <StatCard
          icon={<UserPlus className="h-8 w-8" />}
          title="New Registrations"
          value="5"
          subtitle="Today"
          color="purple"
        />
        <StatCard
          icon={<Clock className="h-8 w-8" />}
          title="Waiting Patients"
          value="8"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Today's Appointments</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/appointments/new')}>
                New Appointment
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
                View All
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                  <th className="text-left py-3 px-4 font-medium">Doctor</th>
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
                      <td className="py-3 px-4">{appointment.doctors?.name || 'Unassigned'}</td>
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

        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Waiting Room</h2>
            <Button variant="outline" size="sm">
              Check-In Patient
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 font-medium">Appointment Time</th>
                  <th className="text-left py-3 px-4 font-medium">Waiting Since</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">Robert Smith</td>
                  <td className="py-3 px-4">10:00 AM</td>
                  <td className="py-3 px-4">25 minutes</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm">Send to Doctor</Button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">Mary Johnson</td>
                  <td className="py-3 px-4">10:15 AM</td>
                  <td className="py-3 px-4">15 minutes</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm">Send to Doctor</Button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">James Wilson</td>
                  <td className="py-3 px-4">10:30 AM</td>
                  <td className="py-3 px-4">5 minutes</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm">Send to Doctor</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Patients</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/patients/new')}>
              Register Patient
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
              View All
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Phone</th>
                <th className="text-left py-3 px-4 font-medium">Registration Date</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPatients && stats.recentPatients.length > 0 ? (
                stats.recentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">{patient.name}</td>
                    <td className="py-3 px-4">{patient.email}</td>
                    <td className="py-3 px-4">{patient.phone || 'N/A'}</td>
                    <td className="py-3 px-4">{new Date(patient.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/patients/${patient.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No patients found
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
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
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

export default ReceptionistDashboard;
