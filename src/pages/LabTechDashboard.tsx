
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import GlassCard from '@/components/ui-custom/GlassCard';
import Button from '@/components/ui-custom/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Loader2, ClipboardCheck, FileClock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase, LabTest } from '@/integrations/supabase/client';
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
import { format, parseISO } from 'date-fns';

// Form schema for lab test results
const labResultsFormSchema = z.object({
  results: z.string().min(1, "Test results are required"),
  status: z.enum(["Pending", "Completed"]),
});

const LabTechDashboard = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // React Hook Form setup
  const form = useForm<z.infer<typeof labResultsFormSchema>>({
    resolver: zodResolver(labResultsFormSchema),
    defaultValues: {
      results: "",
      status: "Completed",
    },
  });

  // Fetch lab tests from Supabase
  const fetchLabTests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lab_tests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setLabTests(data as LabTest[]);
        filterLabTests(data as LabTest[], searchQuery, activeTab);
      }
    } catch (error: any) {
      console.error('Error fetching lab tests:', error);
      toast({
        title: "Error",
        description: "Failed to load lab tests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLabTests();
  }, []);

  // Filter lab tests based on search query and status
  const filterLabTests = (
    tests: LabTest[],
    query: string,
    status: string
  ) => {
    let filtered = tests;
    
    // Filter by search query
    if (query) {
      filtered = filtered.filter((test) => {
        return (
          test.test_name.toLowerCase().includes(query.toLowerCase()) ||
          test.patient_id.toLowerCase().includes(query.toLowerCase())
        );
      });
    }
    
    // Filter by status
    if (status === 'pending') {
      filtered = filtered.filter((test) => test.status === 'Pending');
    } else if (status === 'completed') {
      filtered = filtered.filter((test) => test.status === 'Completed');
    }
    
    setFilteredTests(filtered);
  };

  // Update filters when search query or active tab changes
  useEffect(() => {
    filterLabTests(labTests, searchQuery, activeTab);
  }, [searchQuery, activeTab, labTests]);

  // Handle opening the form to update test results
  const handleOpenForm = (test: LabTest) => {
    setSelectedTest(test);
    form.reset({
      results: test.results || "",
      status: test.status,
    });
    setIsFormOpen(true);
  };

  // Submit handler for lab test results form
  const onSubmit = async (values: z.infer<typeof labResultsFormSchema>) => {
    if (!selectedTest) return;
    
    try {
      const { error } = await supabase
        .from('lab_tests')
        .update({
          results: values.results,
          status: values.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTest.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Lab test results updated successfully",
      });
      
      // Reset form and close dialog
      form.reset();
      setIsFormOpen(false);
      setSelectedTest(null);
      
      // Refresh lab tests list
      fetchLabTests();
      
    } catch (error: any) {
      console.error('Error updating lab test results:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update lab test results",
        variant: "destructive",
      });
    }
  };

  // Format date utility function
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Lab Technician Dashboard</h1>
          <p className="text-muted-foreground">Manage and update lab test results</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <GlassCard>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full md:w-auto md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9"
                  placeholder="Search by test name or patient" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending" className="flex items-center">
                    <FileClock className="mr-2 h-4 w-4" />
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Completed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="rounded-lg border overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p>Loading lab tests...</p>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                  <ClipboardCheck className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No lab tests found</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'pending' 
                      ? "There are no pending lab tests that need processing." 
                      : "No completed lab tests match your search criteria."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="px-4 py-3 text-left text-sm font-medium">Test</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Patient ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredTests.map((test) => (
                        <tr key={test.id} className="hover:bg-muted/30">
                          <td className="px-4 py-4 text-sm font-medium">{test.test_name}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">{test.patient_id.substring(0, 8)}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(test.test_date)}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              test.status === 'Completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}>
                              {test.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <Button 
                              size="sm" 
                              onClick={() => handleOpenForm(test)}
                              variant={test.status === 'Pending' ? "default" : "outline"}
                            >
                              {test.status === 'Pending' ? 'Enter Results' : 'View/Edit'}
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
        </div>
      </div>

      {/* Lab Test Results Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enter Lab Test Results</DialogTitle>
            <DialogDescription>
              {selectedTest && (
                <>
                  <strong>{selectedTest.test_name}</strong> for patient ID: {selectedTest.patient_id.substring(0, 8)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="results"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Results</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter detailed test results here" 
                        className="min-h-[150px]" 
                        {...field} 
                      />
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
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Results
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default LabTechDashboard;
