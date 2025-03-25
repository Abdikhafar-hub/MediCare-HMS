
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { CheckCircle2, Clock, XCircle, CalendarIcon, Filter, Search, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

// Type that matches the database schema
interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  department: string | null;
  date: string;
  status: string;
  reason: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  patient_name?: string;
  doctor_name?: string;
}

// Type for doctor/staff profiles
interface StaffProfile {
  id: string;
  name: string;
  department?: string;
  role: string;
}

// Type for patient data
interface Patient {
  id: string;
  name: string;
}

// Form schema for appointment creation and updates
const appointmentFormSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  doctor_id: z.string().optional(),
  department: z.string().optional(),
  date: z.date({
    required_error: "Date and time is required",
  }),
  status: z.enum(["scheduled", "completed", "cancelled"]),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [doctors, setDoctors] = useState<StaffProfile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // React Hook Form setup
  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patient_id: "",
      doctor_id: undefined,
      department: "",
      date: new Date(),
      status: "scheduled",
      reason: "",
      notes: "",
    },
  });

  // Fetch appointments from Supabase
  const fetchAppointments = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      // First get the patient names to join with appointments
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, name');
        
      if (patientsError) throw patientsError;
      
      // Get doctor profiles
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('id, name, department, role')
        .in('role', ['doctor', 'nurse']);
        
      if (doctorsError) throw doctorsError;
      
      // Set doctors for the dropdown
      setDoctors(doctorsData || []);
      
      // Set patients for the dropdown
      setPatients(patientsData || []);
      
      // Get appointments
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        // Combine appointments with patient and doctor names
        const enrichedAppointments = data.map(appointment => {
          const patient = patientsData?.find(p => p.id === appointment.patient_id);
          const doctor = doctorsData?.find(d => d.id === appointment.doctor_id);
          
          return {
            ...appointment,
            patient_name: patient?.name || 'Unknown Patient',
            doctor_name: doctor?.name || 'Unassigned',
          };
        });
        
        setAppointments(enrichedAppointments);
        filterAppointments(enrichedAppointments, searchQuery, statusFilter, selectedDate);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  // Filter appointments based on search query, date, and status
  const filterAppointments = (
    appointmentsList: Appointment[],
    query: string,
    status: string,
    date?: Date
  ) => {
    let filtered = appointmentsList;
    
    // Filter by search query
    if (query) {
      filtered = filtered.filter((appointment) => {
        return (
          appointment.patient_name?.toLowerCase().includes(query.toLowerCase()) ||
          appointment.doctor_name?.toLowerCase().includes(query.toLowerCase()) ||
          appointment.department?.toLowerCase().includes(query.toLowerCase())
        );
      });
    }
    
    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter((appointment) => appointment.status === status);
    }
    
    // Filter by date
    if (date && isValid(date)) {
      const dateString = date.toISOString().split('T')[0];
      filtered = filtered.filter((appointment) => {
        return appointment.date.startsWith(dateString);
      });
    }
    
    setFilteredAppointments(filtered);
  };

  // Update filters when search query, status filter, or selected date changes
  useEffect(() => {
    filterAppointments(appointments, searchQuery, statusFilter, selectedDate);
  }, [searchQuery, statusFilter, selectedDate, appointments]);

  // Get selected appointment details
  const appointmentDetails = selectedAppointment
    ? appointments.find(a => a.id === selectedAppointment)
    : null;

  // Submit handler for appointment form
  const onSubmit = async (values: z.infer<typeof appointmentFormSchema>) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Convert Date object to ISO string for database
      const date = values.date.toISOString();
      
      // Prepare data for insertion/update
      const appointmentData = {
        patient_id: values.patient_id,
        doctor_id: values.doctor_id || null,
        department: values.department || null,
        date,
        status: values.status,
        reason: values.reason || null,
        notes: values.notes || null,
        created_by: user.id,
      };
      
      let response;
      
      if (isEditMode && selectedAppointment) {
        // Update existing appointment
        response = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', selectedAppointment);
          
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        });
      } else {
        // Create new appointment
        response = await supabase
          .from('appointments')
          .insert([appointmentData]);
          
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Appointment created successfully",
        });
      }
      
      // Reset form and close dialog
      form.reset();
      setIsFormOpen(false);
      setIsEditMode(false);
      
      // Refresh appointment list
      fetchAppointments();
      
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save appointment",
        variant: "destructive",
      });
    }
  };

  // Handle status change
  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    if (!isAuthenticated) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Appointment status changed to ${newStatus}`,
      });
      
      // Refresh appointment list
      fetchAppointments();
      
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Delete appointment handler
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
      
      // Refresh appointment list and clear selection
      fetchAppointments();
      if (selectedAppointment === appointmentId) {
        setSelectedAppointment(null);
      }
      
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete appointment",
        variant: "destructive",
      });
    }
  };

  // Edit appointment handler
  const handleEditAppointment = (appointment: Appointment) => {
    // Set form values
    form.reset({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id || undefined,
      department: appointment.department || "",
      date: new Date(appointment.date),
      status: appointment.status as "scheduled" | "completed" | "cancelled",
      reason: appointment.reason || "",
      notes: appointment.notes || "",
    });
    
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleCreateAppointment = () => {
    // Reset form for new appointment
    form.reset({
      patient_id: "",
      doctor_id: undefined,
      department: "",
      date: new Date(),
      status: "scheduled",
      reason: "",
      notes: "",
    });
    
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  // Format date utility function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: format(date, 'EEEE, MMMM d, yyyy'),
        time: format(date, 'h:mm a'),
      };
    } catch (e) {
      return { date: 'Invalid date', time: 'Invalid time' };
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage and track patient appointments</p>
          </div>
          <Button onClick={handleCreateAppointment} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <GlassCard>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9"
                      placeholder="Search by patient or doctor name" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="min-w-[150px] justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="md:min-w-[130px] justify-start">
                        <Filter className="mr-2 h-4 w-4" />
                        {statusFilter === 'all' ? 'All' : statusFilter}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="space-y-1">
                        <Button 
                          variant={statusFilter === 'all' ? 'default' : 'ghost'} 
                          className="w-full justify-start" 
                          onClick={() => setStatusFilter('all')}
                        >
                          All
                        </Button>
                        <Button 
                          variant={statusFilter === 'scheduled' ? 'default' : 'ghost'} 
                          className="w-full justify-start" 
                          onClick={() => setStatusFilter('scheduled')}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Scheduled
                        </Button>
                        <Button 
                          variant={statusFilter === 'completed' ? 'default' : 'ghost'} 
                          className="w-full justify-start" 
                          onClick={() => setStatusFilter('completed')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Completed
                        </Button>
                        <Button 
                          variant={statusFilter === 'cancelled' ? 'default' : 'ghost'} 
                          className="w-full justify-start" 
                          onClick={() => setStatusFilter('cancelled')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelled
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {selectedDate && (
                    <Button 
                      variant="ghost" 
                      className="px-2" 
                      onClick={() => setSelectedDate(undefined)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Appointments List */}
            <GlassCard>
              <h2 className="text-xl font-bold mb-4">
                {filteredAppointments.length} {filteredAppointments.length === 1 ? 'Appointment' : 'Appointments'} 
                {selectedDate ? ` on ${format(selectedDate, 'MMMM d, yyyy')}` : ''}
                {statusFilter !== 'all' ? ` • ${statusFilter}` : ''}
              </h2>
              <div className="overflow-hidden rounded-lg border">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p>Loading appointments...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No appointments found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDate(undefined);
                        setStatusFilter('all');
                      }}
                    >
                      Reset filters
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y scrollbar-thin overflow-y-auto max-h-[600px]">
                    {filteredAppointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className={cn(
                          "p-4 transition-colors hover:bg-secondary/40 cursor-pointer",
                          selectedAppointment === appointment.id && "bg-secondary/60"
                        )}
                        onClick={() => setSelectedAppointment(appointment.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{appointment.patient_name}</p>
                              <span className="text-xs text-muted-foreground">{appointment.patient_id.substring(0, 8)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{appointment.doctor_name || 'Unassigned'}</p>
                            {appointment.department && (
                              <p className="text-xs text-muted-foreground">{appointment.department}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatDate(appointment.date).date}
                            </p>
                            <p className="text-xs font-medium">
                              {formatDate(appointment.date).time}
                            </p>
                            <span 
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 text-xs",
                                appointment.status === 'scheduled' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                  : appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              )}
                            >
                              {appointment.status === 'scheduled' && <Clock className="mr-1 h-3 w-3" />}
                              {appointment.status === 'completed' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                              {appointment.status === 'cancelled' && <XCircle className="mr-1 h-3 w-3" />}
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Appointment Details */}
          <div>
            <GlassCard className="sticky top-24">
              {appointmentDetails ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">Appointment Details</h2>
                    <span 
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        appointmentDetails.status === 'scheduled' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                          : appointmentDetails.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      )}
                    >
                      {appointmentDetails.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p className="font-medium">{appointmentDetails.patient_name}</p>
                      <p className="text-sm text-muted-foreground">{appointmentDetails.patient_id.substring(0, 8)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Doctor</p>
                      <p className="font-medium">{appointmentDetails.doctor_name || 'Unassigned'}</p>
                      {appointmentDetails.department && (
                        <p className="text-sm text-muted-foreground">{appointmentDetails.department}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-medium">{formatDate(appointmentDetails.date).date}</p>
                      <p className="text-sm">{formatDate(appointmentDetails.date).time}</p>
                    </div>

                    {appointmentDetails.reason && (
                      <div>
                        <p className="text-sm text-muted-foreground">Reason for Visit</p>
                        <p>{appointmentDetails.reason}</p>
                      </div>
                    )}

                    {appointmentDetails.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p>{appointmentDetails.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    {appointmentDetails.status === 'scheduled' && (
                      <>
                        <Button 
                          className="w-full" 
                          onClick={() => handleStatusChange(appointmentDetails.id, 'completed')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Completed
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => handleStatusChange(appointmentDetails.id, 'cancelled')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Appointment
                        </Button>
                      </>
                    )}
                    {appointmentDetails.status === 'cancelled' && (
                      <Button 
                        className="w-full" 
                        onClick={() => handleStatusChange(appointmentDetails.id, 'scheduled')}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Reschedule
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleEditAppointment(appointmentDetails)}
                    >
                      Edit Details
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                        >
                          Delete Appointment
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the appointment record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteAppointment(appointmentDetails.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No appointment selected</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select an appointment from the list to view details
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Appointment Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Appointment" : "Create New Appointment"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the appointment details in the form below."
                : "Fill out the form below to schedule a new appointment."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="doctor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a doctor (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors
                            .filter(staff => staff.role === 'doctor')
                            .map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cardiology">Cardiology</SelectItem>
                          <SelectItem value="Neurology">Neurology</SelectItem>
                          <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date and Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Input 
                              type="time" 
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                field.onChange(newDate);
                              }}
                              defaultValue={format(field.value, "HH:mm")}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Reason for Visit</FormLabel>
                      <FormControl>
                        <Input placeholder="Reason for the appointment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? "Update Appointment" : "Create Appointment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Appointments;
