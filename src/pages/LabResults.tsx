
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase, LabTest } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import GlassCard from '@/components/ui-custom/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const LabResults = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const selectedTestId = searchParams.get('id');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  // Fetch tests
  const { data: tests, isLoading } = useQuery({
    queryKey: ['lab_tests', user?.id],
    queryFn: async () => {
      if (!user) return [] as LabTest[];
      
      const { data, error } = await supabase
        .from('lab_tests')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        toast({
          title: 'Error fetching lab tests',
          description: error.message,
          variant: 'destructive',
        });
        return [] as LabTest[];
      }
      
      return (data || []) as LabTest[];
    },
    enabled: !!user,
  });

  // Set selected test based on URL parameter
  useEffect(() => {
    if (tests && selectedTestId) {
      const test = tests.find(t => t.id === selectedTestId);
      if (test) setSelectedTest(test);
    }
  }, [tests, selectedTestId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p className="text-xl">Loading lab results...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Lab Results</h1>
          <p className="text-muted-foreground">View your lab test results and history.</p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tests</TabsTrigger>
            {selectedTest && <TabsTrigger value="details">Test Details</TabsTrigger>}
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests && tests.map((test) => (
                <GlassCard key={test.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedTest(test)}>
                  <h2 className="text-lg font-semibold">{test.test_name}</h2>
                  <p className="text-sm text-muted-foreground">Status: {test.status}</p>
                  <p className="text-sm text-muted-foreground">Date: {new Date(test.test_date).toLocaleDateString()}</p>
                </GlassCard>
              ))}
            </div>
          </TabsContent>
          {selectedTest && (
            <TabsContent value="details" className="space-y-4">
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-4">{selectedTest.test_name}</h2>
                <p className="text-muted-foreground mb-4">Test Date: {new Date(selectedTest.test_date).toLocaleDateString()}</p>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Results</h3>
                  <p>{selectedTest.results || 'Results not available.'}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Status</h3>
                  <p>{selectedTest.status}</p>
                </div>
              </GlassCard>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default LabResults;
