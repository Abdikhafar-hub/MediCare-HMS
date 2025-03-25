
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { SearchIcon, Filter, Plus, Calendar, Clock, User, Phone, Mail, Trash, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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

// Patient type that matches the database schema
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  dob: string | null;
  address: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  medical_conditions: string[] | null;
  insurance: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Form schema for patient creation and updates
const patientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string().optional(),
  address: z.string().optional(),
  blood_type: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  insurance: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // React Hook Form setup
  const form = useForm<z.infer<typeof patientFormSchema>>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      gender: "Male",
      dob: "",
      address: "",
      blood_type: "O+",
      allergies: "",
      medical_conditions: "",
      insurance: "",
      status: "active",
    },
  });

  // Fetch patients from Supabase
  const fetchPatients = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setPatients(data);
        filterPatients(data, searchQuery, statusFilter);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchPatients();
    }
  }, [isAuthenticated]);

  // Filter patients based on search query and status
  const filterPatients = (patientsList: Patient[], query: string, status: string) => {
    let filtered = patientsList;
    
    // Filter by search query
    if (query) {
      filtered = filtered.filter((patient) => {
        return (
          patient.name.toLowerCase().includes(query.toLowerCase()) ||
          patient.id.toLowerCase().includes(query.toLowerCase()) ||
          patient.email.toLowerCase().includes(query.toLowerCase()) ||
          (patient.phone && patient.phone.toLowerCase().includes(query.toLowerCase()))
        );
      });
    }
    
    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter((patient) => patient.status === status);
    }
    
    // Calculate pagination
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    
    // Slice for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPatients = filtered.slice(startIndex, endIndex);
    
    setFilteredPatients(paginatedPatients);
  };

  // Update filters when search query or status filter changes
  useEffect(() => {
    filterPatients(patients, searchQuery, statusFilter);
  }, [searchQuery, statusFilter, currentPage]);

  // Get selected patient details
  const patientDetails = selectedPatient
    ? patients.find(p => p.id === selectedPatient)
    : null;

  // Submit handler for patient form
  const onSubmit = async (values: z.infer<typeof patientFormSchema>) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Prepare data for insertion/update
      const patientData = {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        gender: values.gender,
        dob: values.dob || null,
        address: values.address || null,
        blood_type: values.blood_type || null,
        allergies: values.allergies ? values.allergies.split(',').map(a => a.trim()) : null,
        medical_conditions: values.medical_conditions ? values.medical_conditions.split(',').map(c => c.trim()) : null,
        insurance: values.insurance || null,
        status: values.status,
        created_by: user.id,
      };
      
      let response;
      
      if (isEditMode && selectedPatient) {
        // Update existing patient
        response = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', selectedPatient);
          
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Patient updated successfully",
        });
      } else {
        // Create new patient
        response = await supabase
          .from('patients')
          .insert([patientData]);
          
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Patient created successfully",
        });
      }
      
      // Reset form and close dialog
      form.reset();
      setIsFormOpen(false);
      setIsEditMode(false);
      
      // Refresh patient list
      fetchPatients();
      
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save patient",
        variant: "destructive",
      });
    }
  };

  // Delete patient handler
  const handleDeletePatient = async (patientId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      
      // Refresh patient list and clear selection
      fetchPatients();
      if (selectedPatient === patientId) {
        setSelectedPatient(null);
      }
      
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  // Edit patient handler
  const handleEditPatient = (patient: Patient) => {
    // Set form values
    form.reset({
      name: patient.name,
      email: patient.email,
      phone: patient.phone || "",
      gender: (patient.gender as any) || "Male",
      dob: patient.dob || "",
      address: patient.address || "",
      blood_type: (patient.blood_type as any) || "O+",
      allergies: patient.allergies ? patient.allergies.join(', ') : "",
      medical_conditions: patient.medical_conditions ? patient.medical_conditions.join(', ') : "",
      insurance: patient.insurance || "",
      status: patient.status as "active" | "inactive",
    });
    
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleCreatePatient = () => {
    // Reset form for new patient
    form.reset({
      name: "",
      email: "",
      phone: "",
      gender: "Male",
      dob: "",
      address: "",
      blood_type: "O+",
      allergies: "",
      medical_conditions: "",
      insurance: "",
      status: "active",
    });
    
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  // Format date utility function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          <Button onClick={handleCreatePatient} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <GlassCard>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9"
                      placeholder="Search patients by name, ID, email or phone" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto">
                        <Filter className="mr-2 h-4 w-4" />
                        {statusFilter === 'all' ? 'All Patients' : statusFilter === 'active' ? 'Active' : 'Inactive'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="space-y-1">
                        <Button 
                          variant={statusFilter === 'all' ? 'default' : 'ghost'} 
                          className="w-full justify-start" 
                          onClick={() => setStatusFilter('all')}
                        >
                          All Patients
                        </Button>
                        <Button 
                          variant={statusFilter === 'active' ? 'default' : 'ghost'} 
                          className="w-full justify-start" 
                          onClick={() => setStatusFilter('active')}
                        >
                          Active
                        </Button>
                        <Button 
                          variant={statusFilter === 'inactive' ? 'default' : 'ghost'} 
                          className="w-full justify-start" 
                          onClick={() => setStatusFilter('inactive')}
                        >
                          Inactive
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </GlassCard>

            {/* Patients List */}
            <GlassCard>
              <h2 className="text-xl font-bold mb-4">
                {filteredPatients.length} {filteredPatients.length === 1 ? 'Patient' : 'Patients'}
                {statusFilter !== 'all' ? ` • ${statusFilter}` : ''}
              </h2>
              
              <div className="overflow-hidden rounded-lg border">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <p>Loading patients...</p>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <User className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No patients found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                    >
                      Reset filters
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y scrollbar-thin overflow-y-auto max-h-[600px]">
                    {filteredPatients.map((patient) => (
                      <div 
                        key={patient.id}
                        className={cn(
                          "p-4 transition-colors hover:bg-secondary/40 cursor-pointer",
                          selectedPatient === patient.id && "bg-secondary/60"
                        )}
                        onClick={() => setSelectedPatient(patient.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{patient.name}</p>
                              <span className="text-xs text-muted-foreground">{patient.id.substring(0, 8)}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="mr-1 h-3 w-3" /> 
                              <span className="truncate">{patient.email}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span 
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 text-xs",
                                patient.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              )}
                            >
                              {patient.status}
                            </span>
                            <p className="text-xs mt-1">
                              Registered: {formatDate(patient.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {filteredPatients.length > 0 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Patient Details */}
          <div>
            <GlassCard className="sticky top-24">
              {patientDetails ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">Patient Details</h2>
                    <span 
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        patientDetails.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      )}
                    >
                      {patientDetails.status}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center pb-4 border-b">
                    <Avatar className="h-20 w-20 mb-3 border">
                      <AvatarFallback className="text-xl">{patientDetails.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-medium">{patientDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">{patientDetails.id.substring(0, 8)}</p>
                    <div className="flex items-center mt-2 text-sm">
                      {patientDetails.gender && (
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium mr-2">
                          {patientDetails.gender}
                        </span>
                      )}
                      {patientDetails.dob && (
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium mr-2">
                          {formatDate(patientDetails.dob)}
                        </span>
                      )}
                      {patientDetails.blood_type && (
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                          {patientDetails.blood_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Information</p>
                      <div className="mt-1 space-y-1">
                        {patientDetails.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{patientDetails.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{patientDetails.email}</span>
                        </div>
                      </div>
                    </div>

                    {patientDetails.address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="text-sm">{patientDetails.address}</p>
                      </div>
                    )}

                    {patientDetails.insurance && (
                      <div>
                        <p className="text-sm text-muted-foreground">Insurance Provider</p>
                        <p className="text-sm">{patientDetails.insurance}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground">Registration Date</p>
                      <div className="mt-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{formatDate(patientDetails.created_at)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Medical Information</p>
                      <div className="mt-1 space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Allergies:</p>
                          {patientDetails.allergies && patientDetails.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {patientDetails.allergies.map((allergy, index) => (
                                <span key={index} className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full px-2 py-0.5 text-xs">
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p>No known allergies</p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground">Medical Conditions:</p>
                          {patientDetails.medical_conditions && patientDetails.medical_conditions.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {patientDetails.medical_conditions.map((condition, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full px-2 py-0.5 text-xs">
                                  {condition}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p>No known medical conditions</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col space-y-2">
                    <Button>Schedule Appointment</Button>
                    <Button variant="outline" onClick={() => handleEditPatient(patientDetails)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Patient
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Patient
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the patient record
                            and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                            onClick={() => handleDeletePatient(patientDetails.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <User className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No patient selected</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a patient from the list to view details
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Patient Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Patient" : "Add New Patient"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the patient's information in the form below."
                : "Fill out the form below to create a new patient record."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="blood_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="insurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Insurance company" {...field} />
                      </FormControl>
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
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Anytown, CA 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Input placeholder="Penicillin, Peanuts, etc. (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="medical_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Conditions</FormLabel>
                    <FormControl>
                      <Input placeholder="Diabetes, Hypertension, etc. (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{isEditMode ? "Update Patient" : "Create Patient"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Patients;
