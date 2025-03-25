
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase, Prescription } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import GlassCard from '@/components/ui-custom/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Prescriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const selectedPrescriptionId = searchParams.get('id');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Fetch prescriptions
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: async () => {
      if (!user) return [] as Prescription[];
      
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*, profiles!prescriptions_prescribed_by_fkey(name, role)')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        toast({
          title: 'Error fetching prescriptions',
          description: error.message,
          variant: 'destructive',
        });
        return [] as Prescription[];
      }
      
      // Transform the data to match our Prescription type
      const transformedData = data?.map(item => ({
        ...item,
        profile: item.profiles || null
      })) || [];
      
      return transformedData as Prescription[];
    },
    enabled: !!user,
  });

  // Set selected prescription based on URL parameter
  useEffect(() => {
    if (prescriptions && selectedPrescriptionId) {
      const prescription = prescriptions.find(p => p.id === selectedPrescriptionId);
      if (prescription) setSelectedPrescription(prescription);
    }
  }, [prescriptions, selectedPrescriptionId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p className="text-xl">Loading prescriptions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Prescriptions</h1>
          <p className="text-muted-foreground">View and manage your prescriptions.</p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Prescriptions</TabsTrigger>
            {selectedPrescription && <TabsTrigger value="details">Prescription Details</TabsTrigger>}
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {prescriptions && prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prescriptions.map((prescription) => (
                  <GlassCard key={prescription.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedPrescription(prescription)}>
                    <h2 className="text-lg font-semibold">{prescription.medicine_name}</h2>
                    <p className="text-sm text-muted-foreground">Dosage: {prescription.dosage}</p>
                    <p className="text-xs text-muted-foreground">
                      Prescribed by {prescription.profile?.name || 'Unknown Doctor'} on {new Date(prescription.created_at).toLocaleDateString()}
                    </p>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-lg text-muted-foreground">No prescriptions found.</p>
              </div>
            )}
          </TabsContent>
          
          {selectedPrescription && (
            <TabsContent value="details" className="space-y-4">
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{selectedPrescription.medicine_name}</h2>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPrescription(null)}>
                    Back to All Prescriptions
                  </Button>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Prescription ID:</span> {selectedPrescription.id}
                  </p>
                  <p>
                    <span className="font-semibold">Medicine Name:</span> {selectedPrescription.medicine_name}
                  </p>
                  <p>
                    <span className="font-semibold">Dosage:</span> {selectedPrescription.dosage}
                  </p>
                  <p>
                    <span className="font-semibold">Prescribed By:</span> {selectedPrescription.profile?.name || 'Unknown Doctor'}
                  </p>
                  <p>
                    <span className="font-semibold">Prescribed Date:</span> {new Date(selectedPrescription.created_at).toLocaleDateString()}
                  </p>
                </div>
              </GlassCard>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Prescriptions;
