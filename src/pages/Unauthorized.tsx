
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui-custom/Button';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <MainLayout showNavbar={false}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Sorry, you don't have permission to access this page. This area requires additional access privileges.
          </p>
          {user && (
            <p className="mb-6 text-sm">
              You are currently logged in as <span className="font-medium">{user.name}</span> with role <span className="font-medium capitalize">{user.role.replace('_', ' ')}</span>.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Unauthorized;
