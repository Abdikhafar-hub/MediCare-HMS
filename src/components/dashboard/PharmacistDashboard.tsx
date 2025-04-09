
import React from 'react';
import { DashboardStats } from '@/services/dashboardService';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { useNavigate } from 'react-router-dom';
import { Pill, PackageCheck, AlertTriangle, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PharmacistDashboardProps {
  stats: DashboardStats;
  isLoading: boolean;
}

const PharmacistDashboard: React.FC<PharmacistDashboardProps> = ({ stats, isLoading }) => {
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
          icon={<Pill className="h-8 w-8" />}
          title="Pending Prescriptions"
          value={(stats.prescriptions || 0).toString()}
          color="blue"
        />
        <StatCard
          icon={<PackageCheck className="h-8 w-8" />}
          title="Prescriptions Filled"
          value="24"
          subtitle="Today"
          color="green"
        />
        <StatCard
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Low Stock Items"
          value={(stats.lowStockMedications?.length || 0).toString()}
          color="red"
        />
        <StatCard
          icon={<UserCheck className="h-8 w-8" />}
          title="Patients Served"
          value="18"
          subtitle="Today"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Pending Prescriptions</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/prescriptions')}>
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 font-medium">Medication</th>
                  <th className="text-left py-3 px-4 font-medium">Prescribed By</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">Nasra Mohamed</td>
                  <td className="py-3 px-4">Lisinopril 10mg</td>
                  <td className="py-3 px-4">Dr. Thompson</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm">Fill Prescription</Button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">David Kyalo</td>
                  <td className="py-3 px-4">Metformin 500mg</td>
                  <td className="py-3 px-4">Dr. Garcia</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm">Fill Prescription</Button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">Susan Ndungu</td>
                  <td className="py-3 px-4">Amoxicillin 500mg</td>
                  <td className="py-3 px-4">Dr. Williams</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm">Fill Prescription</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Inventory Status</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Medication</th>
                  <th className="text-left py-3 px-4 font-medium">Current Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Min. Required</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockMedications?.length > 0 ? (
                  stats.lowStockMedications.map((medication, index) => (
                    <tr key={index} className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">{medication.name}</td>
                      <td className="py-3 px-4">{medication.current_stock}</td>
                      <td className="py-3 px-4">{medication.min_stock}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">Lisinopril 10mg</td>
                      <td className="py-3 px-4">15</td>
                      <td className="py-3 px-4">20</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">Metformin 500mg</td>
                      <td className="py-3 px-4">12</td>
                      <td className="py-3 px-4">25</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">Amlodipine 5mg</td>
                      <td className="py-3 px-4">8</td>
                      <td className="py-3 px-4">15</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Prescriptions Filled</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Patient</th>
                <th className="text-left py-3 px-4 font-medium">Medication</th>
                <th className="text-left py-3 px-4 font-medium">Dosage</th>
                <th className="text-left py-3 px-4 font-medium">Filled At</th>
                <th className="text-left py-3 px-4 font-medium">Filled By</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4">John Smith</td>
                <td className="py-3 px-4">Atorvastatin</td>
                <td className="py-3 px-4">20mg daily</td>
                <td className="py-3 px-4">Today, 10:15 AM</td>
                <td className="py-3 px-4">You</td>
              </tr>
              <tr className="border-b hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4">Emily Johnson</td>
                <td className="py-3 px-4">Levothyroxine</td>
                <td className="py-3 px-4">75mcg daily</td>
                <td className="py-3 px-4">Today, 9:30 AM</td>
                <td className="py-3 px-4">You</td>
              </tr>
              <tr className="border-b hover:bg-muted/40 transition-colors">
                <td className="py-3 px-4">Robert Davis</td>
                <td className="py-3 px-4">Lisinopril</td>
                <td className="py-3 px-4">10mg daily</td>
                <td className="py-3 px-4">Today, 9:15 AM</td>
                <td className="py-3 px-4">You</td>
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

export default PharmacistDashboard;
