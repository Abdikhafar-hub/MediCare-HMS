
import React, { useState } from 'react';
import { DashboardStats } from '@/services/dashboardService';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatCard from './common/StatCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AdminDashboardProps {
  stats: DashboardStats;
  isLoading: boolean;
}

// Sample data for charts - in a real app, this would come from API
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const patientVisitData = [
  { name: 'Jan', visits: 400 },
  { name: 'Feb', visits: 600 },
  { name: 'Mar', visits: 500 },
  { name: 'Apr', visits: 700 },
  { name: 'May', visits: 900 },
  { name: 'Jun', visits: 800 },
  { name: 'Jul', visits: 1000 },
];

const departmentDistribution = [
  { name: 'Cardiology', value: 35 },
  { name: 'Neurology', value: 25 },
  { name: 'Pediatrics', value: 20 },
  { name: 'Orthopedics', value: 15 },
  { name: 'General', value: 5 },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, isLoading }) => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('week');

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
          icon={<Users className="h-8 w-8" />}
          title="Total Patients"
          value={stats.patients?.toString() || "0"}
          change="+12%"
          trend="up"
          color="blue"
        />
        <StatCard
          icon={<Calendar className="h-8 w-8" />}
          title="Appointments"
          value={stats.appointments.toString()}
          subtitle="Today"
          color="green"
        />
        <StatCard
          icon={<User className="h-8 w-8" />}
          title="Active Staff"
          value={(stats.staffList?.length || 0).toString()}
          subtitle="Total staff"
          color="purple"
        />
        <StatCard
          icon={<AlertCircle className="h-8 w-8" />}
          title="Prescriptions"
          value={(stats.prescriptions || 0).toString()}
          subtitle="Total"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <GlassCard className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Patient Visits</h2>
            <div className="flex bg-secondary rounded-lg overflow-hidden">
              {(['day', 'week', 'month']).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    'px-3 py-1 text-sm',
                    timeFilter === filter
                      ? 'bg-primary text-white'
                      : 'hover:bg-secondary-foreground/10'
                  )}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={patientVisitData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pie Chart */}
        <GlassCard>
          <h2 className="text-xl font-bold mb-6">Department Distribution</h2>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-xs"
                        fill="currentColor"
                      >
                        {departmentDistribution[index].name} ({value})
                      </text>
                    );
                  }}
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Recent Prescriptions */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Prescriptions</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/prescriptions')}>
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Medication</th>
                <th className="text-left py-3 px-4 font-medium">Patient</th>
                <th className="text-left py-3 px-4 font-medium">Prescribed By</th>
                <th className="text-left py-3 px-4 font-medium">Dosage</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPrescriptions && stats.recentPrescriptions.length > 0 ? (
                stats.recentPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">{prescription.medicine_name}</td>
                    <td className="py-3 px-4">{prescription.patients?.name || 'Unknown Patient'}</td>
                    <td className="py-3 px-4">{prescription.profiles?.name || 'Unknown Doctor'}</td>
                    <td className="py-3 px-4">{prescription.dosage}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/prescriptions/${prescription.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No prescriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Recent Patients */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Patients</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Phone</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
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
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                          patient.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        )}
                      >
                        {patient.status || 'Active'}
                      </span>
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
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Staff Management */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Staff Management</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/staff')}>
            Manage Staff
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Department</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.staffList && stats.staffList.length > 0 ? (
                stats.staffList.map((staff) => (
                  <tr key={staff.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">{staff.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                          staff.role === 'doctor'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : staff.role === 'nurse'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : staff.role === 'pharmacist'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            : staff.role === 'lab_technician'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        )}
                      >
                        {staff.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">{staff.email}</td>
                    <td className="py-3 px-4">{staff.department || 'N/A'}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/staff/${staff.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No staff found
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

export default AdminDashboard;
