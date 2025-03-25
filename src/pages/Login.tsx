import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui-custom/Button';
import GlassCard from '@/components/ui-custom/GlassCard';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const Login = () => {
  const { login, error: authError, isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // React Hook Form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    console.log('Form submitted with:', values);
    setFormSubmitting(true);
  
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        console.log('Login successful, showing toast');
        toast({
          title: "Login successful",
          description: "Welcome to the Hospital Management System",
        });
      } else {
        console.log('Login failed');
      }
    } catch (error: any) {
      console.error("Login submission error:", error.message);
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // For development testing only - prefill with sample credentials
  const setDemoCredentials = (role: string) => {
    switch (role) {
      case 'doctor':
        form.setValue('email', 'doctorlogin@gmail.com'); // Updated to the working user
        form.setValue('password', '12345678');
        break;
      case 'admin':
        form.setValue('email', 'adminlogin@gmail.com');
        form.setValue('password', '12345678');
        break;
      case 'nurse':
        form.setValue('email', 'nurselogin@gmail.com');
        form.setValue('password', '12345678');
        break;
      case 'patient':
        form.setValue('email', 'patientlogin@gmailcom');
        form.setValue('password', '12345678');
        break;
      case 'pharmacist':
        form.setValue('email', 'pharmacistlogin@gmail.com');
        form.setValue('password', '12345678');
        break;
      case 'lab':
        form.setValue('email', 'labtechlogin@gmail.com');
        form.setValue('password', '12345678');
        break;
      default:
        break;
    }
  };

  const buttonDisabled = authLoading || formSubmitting;
  console.log('Button disabled:', buttonDisabled, 'authLoading:', authLoading, 'formSubmitting:', formSubmitting);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-white">HMS</span>
            </div>
            <span className="font-bold text-xl">MediCare</span>
          </Link>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <GlassCard className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {authError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={buttonDisabled}
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={buttonDisabled}
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={buttonDisabled}>
                {buttonDisabled ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8">
            <p className="text-center text-sm text-muted-foreground mb-4">
              <button 
                type="button" 
                className="underline hover:text-primary transition-colors"
                onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              >
                {showDemoCredentials ? 'Hide demo credentials' : 'Show demo credentials'}
              </button>
            </p>
            
            {showDemoCredentials && (
              <div className="space-y-3 bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-center text-muted-foreground mb-2">
                  Click on a role to populate the login form with demo credentials
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setDemoCredentials('admin')}
                    disabled={buttonDisabled}
                  >
                    Admin Login
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setDemoCredentials('doctor')}
                    disabled={buttonDisabled}
                  >
                    Doctor Login
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setDemoCredentials('nurse')}
                    disabled={buttonDisabled}
                  >
                    Nurse Login
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setDemoCredentials('patient')}
                    disabled={buttonDisabled}
                  >
                    Patient Login
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setDemoCredentials('pharmacist')}
                    disabled={buttonDisabled}
                  >
                    Pharmacist
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setDemoCredentials('lab')}
                    disabled={buttonDisabled}
                  >
                    Lab Tech
                  </Button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary underline hover:text-primary/90 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;