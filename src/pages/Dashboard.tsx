
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { fetchDashboardData, DashboardStats } from '@/services/dashboardService';
import DynamicDashboard from '@/components/dashboard/DynamicDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data from service
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const dashboardData = await fetchDashboardData(user);
        setStats(dashboardData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-xl">Please login to access the dashboard.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Loading state
  if (isLoading && !stats) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-xl">Loading dashboard data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {stats && <DynamicDashboard 
          userRole={user.role} 
          stats={stats} 
          isLoading={isLoading} 
        />}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
