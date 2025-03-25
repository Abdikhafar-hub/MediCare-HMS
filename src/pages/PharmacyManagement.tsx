import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Loader2, Package, FilePlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase, Medication, Prescription } from '@/integrations/supabase/client';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from 'date-fns';

const medicationFormSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  description: z.string().optional(),
  stock_level: z.coerce.number().min(0, "Stock level cannot be negative"),
  unit: z.string().min(1, "Unit of measurement is required"),
  category: z.string().optional(),
});

const PharmacyManagement = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof medicationFormSchema>>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      stock_level: 0,
      unit: "pill",
      category: "",
    },
  });

  const fetchMedications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setMedications(data as Medication[]);
        filterMedications(data as Medication[], searchQuery);
      }
    } catch (error: any) {
      console.error('Error fetching medications:', error);
      toast({
        title: "Error",
        description: "Failed to load medications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*, profiles!prescribed_by(name, role)') // Simplified syntax: use the column name
        .order('created_at', { ascending: false });
  
      if (error) throw error;
  
      if (data) {
        const transformedData = data.map(item => ({
          ...item,
          profile: item.profiles || null
        }));
  
        setPrescriptions(transformedData as Prescription[]);
        filterPrescriptions(transformedData as Prescription[], searchQuery);
      }
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error.message, error);
      toast({
        title: "Error",
        description: "Failed to load prescriptions: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMedications();
    fetchPrescriptions();
  }, []);

  const filterMedications = (
    meds: Medication[],
    query: string
  ) => {
    if (!query) {
      setFilteredMedications(meds);
      return;
    }
    
    const filtered = meds.filter((med) => 
      med.name.toLowerCase().includes(query.toLowerCase()) ||
      med.category?.toLowerCase().includes(query.toLowerCase()) ||
      med.description?.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredMedications(filtered);
  };

  const filterPrescriptions = (
    prescriptions: Prescription[],
    query: string
  ) => {
    if (!query) {
      setFilteredPrescriptions(prescriptions);
      return;
    }
    
    const filtered = prescriptions.filter((prescription) => 
      prescription.medicine_name.toLowerCase().includes(query.toLowerCase()) ||
      prescription.dosage.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredPrescriptions(filtered);
  };

  useEffect(() => {
    filterMedications(medications, searchQuery);
    filterPrescriptions(prescriptions, searchQuery);
  }, [searchQuery, medications, prescriptions]);

  const handleAddMedication = () => {
    setEditingMedication(null);
    form.reset({
      name: "",
      description: "",
      stock_level: 0,
      unit: "pill",
      category: "",
    });
    setIsFormOpen(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    form.reset({
      name: medication.name,
      description: medication.description || "",
      stock_level: medication.stock_level,
      unit: medication.unit,
      category: medication.category || "",
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof medicationFormSchema>) => {
    try {
      if (editingMedication) {
        const { error } = await supabase
          .from('medications')
          .update({
            name: values.name,
            description: values.description || null,
            stock_level: values.stock_level,
            unit: values.unit,
            category: values.category || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingMedication.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Medication updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('medications')
          .insert({
            name: values.name,
            description: values.description || null,
            stock_level: values.stock_level,
            unit: values.unit,
            category: values.category || null,
          });
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Medication added successfully",
        });
      }
      
      form.reset();
      setIsFormOpen(false);
      setEditingMedication(null);
      
      fetchMedications();
    } catch (error: any) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save medication",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Pharmacy Management</h1>
            <p className="text-muted-foreground">Manage medications and view prescriptions</p>
          </div>
          <Button onClick={handleAddMedication} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </div>

        <Tabs defaultValue="medications" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="medications" className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center">
              <FilePlus className="mr-2 h-4 w-4" />
              Prescriptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medications" className="space-y-6">
            <GlassCard>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-auto md:flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9"
                    placeholder="Search medications..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p>Loading medications...</p>
                  </div>
                ) : filteredMedications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <Package className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No medications found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or add new medications.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={handleAddMedication}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Medication
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/40">
                          <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredMedications.map((medication) => (
                          <tr key={medication.id} className="hover:bg-muted/30">
                            <td className="px-4 py-4 text-sm font-medium">{medication.name}</td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {medication.category || 'Uncategorized'}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                medication.stock_level <= 10 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                : medication.stock_level <= 30
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              }`}>
                                {medication.stock_level} {medication.unit}s
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-muted-foreground max-w-xs truncate">
                              {medication.description || 'No description'}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditMedication(medication)}
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <GlassCard>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-auto md:flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9"
                    placeholder="Search prescriptions..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p>Loading prescriptions...</p>
                  </div>
                ) : filteredPrescriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <FilePlus className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No prescriptions found</h3>
                    <p className="text-sm text-muted-foreground">
                      No prescription records match your search criteria.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/40">
                          <th className="px-4 py-3 text-left text-sm font-medium">Medication</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Patient ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Dosage</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Prescribed By</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredPrescriptions.map((prescription) => (
                          <tr key={prescription.id} className="hover:bg-muted/30">
                            <td className="px-4 py-4 text-sm font-medium">{prescription.medicine_name}</td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {prescription.patient_id.substring(0, 8)}
                            </td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {prescription.dosage}
                            </td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {prescription.profile?.name || 'Unknown'}
                            </td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {formatDate(prescription.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingMedication ? "Edit Medication" : "Add New Medication"}</DialogTitle>
            <DialogDescription>
              Fill out the form below to {editingMedication ? "update" : "add"} a medication to the pharmacy inventory.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter medication name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                          <SelectItem value="Analgesics">Analgesics</SelectItem>
                          <SelectItem value="Antidepressants">Antidepressants</SelectItem>
                          <SelectItem value="Antihypertensives">Antihypertensives</SelectItem>
                          <SelectItem value="Antihistamines">Antihistamines</SelectItem>
                          <SelectItem value="Vitamins">Vitamins & Supplements</SelectItem>
                          <SelectItem value="OTC">Over the Counter</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="stock_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Level</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pill">Pill</SelectItem>
                            <SelectItem value="tablet">Tablet</SelectItem>
                            <SelectItem value="capsule">Capsule</SelectItem>
                            <SelectItem value="bottle">Bottle</SelectItem>
                            <SelectItem value="vial">Vial</SelectItem>
                            <SelectItem value="ampule">Ampule</SelectItem>
                            <SelectItem value="tube">Tube</SelectItem>
                            <SelectItem value="patch">Patch</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter medication description" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
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
                  {editingMedication ? "Update" : "Add"} Medication
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PharmacyManagement;
