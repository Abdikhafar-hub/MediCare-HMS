import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, ChevronDown, User, Bell, Settings, LogOut, Pill, TestTube } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Button from '@/components/ui-custom/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  href: string;
  roles?: string[];
  isExternal?: boolean;
};

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'pharmacist', 'lab_technician'] },
  { title: 'Appointments', href: '/appointments', roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
  { title: 'Patients', href: '/patients', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { title: 'Pharmacy', href: '/pharmacy', roles: ['admin', 'pharmacist'] },
  { title: 'Lab Tests', href: '/lab-tech', roles: ['admin', 'lab_technician'] },
  { title: 'Staff', href: '/staff', roles: ['admin'] },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <header
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300',
        scrolled ? 'glass-effect py-2 shadow-md' : 'py-4 bg-transparent'
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex flex-col items-start space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-white">HMS</span>
              </div>
              <span className="font-bold text-xl">MediCare</span>
            </div>
            <span className="text-xs text-muted-foreground">Powered by A.khafar Solutions</span>
          </Link>

          {!isMobile && isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              {filteredNavItems.map((item) => (
                <NavLink key={item.title} item={item} />
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {!isMobile && (
            <>
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {isAuthenticated ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Bell size={20} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[300px]">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-[60vh] overflow-auto">
                        <div className="py-2 px-2 hover:bg-muted transition-colors rounded-md">
                          <p className="text-sm font-medium">New appointment request</p>
                          <p className="text-xs text-muted-foreground">15 minutes ago</p>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 p-1 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                          <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                        </Avatar>
                        <ChevronDown size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        <div>
                          <p>{user?.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => navigate('/login')}>Login</Button>
              )}
            </>
          )}

          {isMobile && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white dark:bg-gray-900 z-40 animate-fade-in">
          <nav className="flex flex-col p-4 pt-4">
            {isAuthenticated ? (
              <>
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href}
                    className={cn(
                      'py-3 px-4 text-lg font-medium rounded-lg transition-colors',
                      location.pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
                <div className="mt-4 border-t pt-4 flex items-center justify-between">
                  <button 
                    onClick={toggleDarkMode} 
                    className="flex items-center space-x-2 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {isDarkMode ? <Sun size={20} className="mr-2" /> : <Moon size={20} className="mr-2" />}
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
                <div className="mt-4 pt-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                  </Avatar>
                  <p className="mt-2 font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</p>
                  <Button onClick={handleLogout} className="mt-4 w-full" variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-4 p-4">
                <Button onClick={() => navigate('/login')}>Login</Button>
                <Button variant="outline" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun size={20} className="mr-2" /> : <Moon size={20} className="mr-2" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ item }: { item: NavItem }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;

  return (
    <Link
      to={item.href}
      className={cn(
        'relative font-medium transition-colors hover:text-primary',
        isActive ? 'text-primary' : 'text-foreground'
      )}
    >
      {item.title}
      {isActive && (
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  );
};

export default Navbar;