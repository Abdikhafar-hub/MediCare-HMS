
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase, MedicalRecord } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import GlassCard from '@/components/ui-custom/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicalRecordsProps {}

const MedicalRecords: React.FC<MedicalRecordsProps> = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const selectedRecordId = searchParams.get('id');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Fetch records
  const { data: records, isLoading } = useQuery({
    queryKey: ['medical_records', user?.id],
    queryFn: async () => {
      if (!user) return [] as MedicalRecord[];
      
      console.log('Fetching medical records for user:', user.id);
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching medical records:', error);
        toast({
          title: 'Error fetching medical records',
          description: error.message,
          variant: 'destructive',
        });
        return [] as MedicalRecord[];
      }
      
      console.log('Fetched medical records:', data);
      
      // Get profile data for each record
      const processedData = await Promise.all((data || []).map(async (record) => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', record.created_by)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile for medical record:', profileError);
          return {
            ...record,
            profile: null
          };
        }
          
        return {
          ...record,
          profile: profileData
        };
      }));
      
      return processedData as MedicalRecord[];
    },
    enabled: !!user,
  });

  // Set selected record based on URL parameter
  useEffect(() => {
    if (records && selectedRecordId) {
      const record = records.find(r => r.id === selectedRecordId);
      if (record) setSelectedRecord(record);
    }
  }, [records, selectedRecordId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p className="text-xl">Loading medical records...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">View and manage your medical history.</p>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedRecord}>Details</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="space-y-4">
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Diagnosis</th>
                      <th className="text-left py-3 px-4 font-medium">Treatment</th>
                      <th className="text-left py-3 px-4 font-medium">Prescription</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records && records.length > 0 ? (
                      records.map((record) => (
                        <tr key={record.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4">{record.diagnosis}</td>
                          <td className="py-3 px-4">{record.treatment || 'N/A'}</td>
                          <td className="py-3 px-4">{record.prescription || 'N/A'}</td>
                          <td className="py-3 px-4">{new Date(record.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => window.open(`/medical-records?id=${record.id}`, '_blank')}>
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-muted-foreground">
                          No medical records found. Your medical history will appear here after your appointments.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </TabsContent>
          <TabsContent value="details">
            {selectedRecord ? (
              <GlassCard className="space-y-4">
                <h2 className="text-2xl font-bold">{selectedRecord.diagnosis}</h2>
                <p>
                  <span className="font-medium">Diagnosis:</span> {selectedRecord.diagnosis}
                </p>
                <p>
                  <span className="font-medium">Treatment:</span> {selectedRecord.treatment || 'N/A'}
                </p>
                 <p>
                  <span className="font-medium">Prescription:</span> {selectedRecord.prescription || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Created At:</span> {new Date(selectedRecord.created_at).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Doctor:</span> {selectedRecord.profile?.name || 'Unknown'}
                </p>
              </GlassCard>
            ) : (
              <GlassCard>
                <div className="py-4 text-center text-muted-foreground">
                  No record selected. Please select a record from the list.
                </div>
              </GlassCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MedicalRecords;
