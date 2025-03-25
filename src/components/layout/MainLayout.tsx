
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showNavbar = true,
  className 
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <main 
        className={cn(
          'flex-1 transition-all duration-300 ease-out',
          isHomePage ? 'pt-0' : 'pt-24',
          className
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
