
import React from 'react';
import { DashboardStats } from '@/services/dashboardService';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, FileSpreadsheet, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabTechnicianDashboardProps {
  stats: DashboardStats;
  isLoading: boolean;
}

const LabTechnicianDashboard: React.FC<LabTechnicianDashboardProps> = ({ stats, isLoading }) => {
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
          icon={<FlaskConical className="h-8 w-8" />}
          title="Pending Tests"
          value={(stats.pendingLabTests || 0).toString()}
          color="blue"
        />
        <StatCard
          icon={<FileSpreadsheet className="h-8 w-8" />}
          title="Completed Today"
          value="12"
          color="green"
        />
        <StatCard
          icon={<Clock className="h-8 w-8" />}
          title="Processing"
          value="4"
          color="orange"
        />
        <StatCard
          icon={<CheckCircle className="h-8 w-8" />}
          title="Completed This Week"
          value="45"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Pending Lab Requests</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/lab-tests')}>
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 font-medium">Test Type</th>
                  <th className="text-left py-3 px-4 font-medium">Requested By</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingRequests && stats.pendingRequests.length > 0 ? (
                  stats.pendingRequests.map((request, index) => (
                    <tr key={index} className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">{request.patient_name}</td>
                      <td className="py-3 px-4">{request.test_type}</td>
                      <td className="py-3 px-4">{request.requested_by}</td>
                      <td className="py-3 px-4">{new Date(request.date_requested).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">Process Sample</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">Nasra Mohamed</td>
                      <td className="py-3 px-4">Complete Blood Count</td>
                      <td className="py-3 px-4">Dr. Andrew</td>
                      <td className="py-3 px-4">Today</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">Process Sample</Button>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">Mohamed Amin</td>
                      <td className="py-3 px-4">Lipid Panel</td>
                      <td className="py-3 px-4">Dr. Samuel</td>
                      <td className="py-3 px-4">Today</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">Process Sample</Button>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">Marcus Johnson</td>
                      <td className="py-3 px-4">Urinalysis</td>
                      <td className="py-3 px-4">Dr. Geoffrey</td>
                      <td className="py-3 px-4">Yesterday</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">Process Sample</Button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Tests In Progress</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 font-medium">Test Type</th>
                  <th className="text-left py-3 px-4 font-medium">Started</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">issack Muli</td>
                  <td className="py-3 px-4">Blood Glucose</td>
                  <td className="py-3 px-4">Today, 9:30 AM</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm">Complete</Button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">Thomas Okinyi</td>
                  <td className="py-3 px-4">Thyroid Panel</td>
                  <td className="py-3 px-4">Today, 10:15 AM</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm">Complete</Button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">Anne Kamau</td>
                  <td className="py-3 px-4">Liver Function</td>
                  <td className="py-3 px-4">Today, 11:00 AM</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm">Complete</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recently Completed Tests</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/lab-tests/completed')}>
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Patient</th>
                <th className="text-left py-3 px-4 font-medium">Test Type</th>
                <th className="text-left py-3 px-4 font-medium">Completed</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4">Emma Wilson</td>
                <td className="py-3 px-4">Complete Blood Count</td>
                <td className="py-3 px-4">Today, 8:45 AM</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Normal
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">View Results</Button>
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4">Michael Davis</td>
                <td className="py-3 px-4">Cholesterol Panel</td>
                <td className="py-3 px-4">Today, 8:30 AM</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    Abnormal
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">View Results</Button>
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4">Jennifer Lopez</td>
                <td className="py-3 px-4">Urinalysis</td>
                <td className="py-3 px-4">Yesterday, 4:15 PM</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Normal
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">View Results</Button>
                </td>
              </tr>
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

export default LabTechnicianDashboard;
