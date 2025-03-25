
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, KeyRound, Bell, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  address: string;
  bio: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: user?.department || '',
    address: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch additional profile data if needed
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        // Here you could fetch additional profile data not stored in the auth context
        // For example, phone, address, bio, etc.
        
        // For now, we'll just set the user data we have
        setFormData(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
          department: user.department || '',
        }));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfileData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          department: formData.department,
          // In a real app, you might update more fields here
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-xl">Please login to view your profile.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 text-center mb-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4 border">
                  <AvatarFallback className="text-xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
                
                <div className="mt-4 w-full">
                  <Button variant="outline" className="w-full" onClick={() => {
                    toast({
                      title: "Coming soon",
                      description: "This feature will be available in a future update",
                    });
                  }}>
                    Change Picture
                  </Button>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-6">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  toast({
                    title: "Coming soon",
                    description: "This feature will be available in a future update",
                  });
                }}>
                  <User className="mr-2 h-4 w-4" />
                  View Public Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => {
                  logout();
                  toast({
                    title: "Logged out",
                    description: "You have been successfully logged out",
                  });
                }}>
                  Log Out
                </Button>
              </div>
            </GlassCard>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <GlassCard>
              <Tabs defaultValue="general">
                <TabsList className="mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department || 'Not specified'}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="security">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="notifications">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">Receive emails about appointments and updates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">SMS Notifications</h3>
                          <p className="text-sm text-muted-foreground">Receive text messages for appointment reminders</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">System Notifications</h3>
                          <p className="text-sm text-muted-foreground">In-app notifications and alerts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">Marketing Communications</h3>
                          <p className="text-sm text-muted-foreground">Receive updates about new services and features</p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => {
                        toast({
                          title: "Notification preferences saved",
                          description: "Your notification settings have been updated",
                        });
                      }}>
                        <Bell className="mr-2 h-4 w-4" />
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </GlassCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
