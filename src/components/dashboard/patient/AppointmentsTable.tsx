
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui-custom/Button';
import { cn } from '@/lib/utils';
import { DashboardStats } from '@/services/dashboardService';

interface AppointmentsTableProps {
  appointments: DashboardStats['upcomingAppointments'];
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments }) => {
  const navigate = useNavigate();
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Doctor</th>
            <th className="text-left py-3 px-4 font-medium">Department</th>
            <th className="text-left py-3 px-4 font-medium">Date & Time</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-right py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments && appointments.length > 0 ? (
            appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4">{appointment.doctors?.name || 'Unassigned'}</td>
                <td className="py-3 px-4">{appointment.department || 'General'}</td>
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
              <td colSpan={5} className="py-4 text-center text-muted-foreground">
                No upcoming appointments. Book an appointment to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsTable;
