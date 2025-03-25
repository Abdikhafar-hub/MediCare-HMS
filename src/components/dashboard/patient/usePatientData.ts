
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase, Prescription, LabTest } from '@/integrations/supabase/client';

export const usePatientData = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch prescriptions data
  const { data: prescriptions, isLoading: isPrescriptionsLoading } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: async () => {
      if (!user) return [] as Prescription[];
      
      console.log('Fetching prescriptions for user:', user.id);
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', user.id);
        
      if (error) {
        console.error('Error fetching prescriptions:', error);
        toast({
          title: 'Error fetching prescriptions',
          description: error.message,
          variant: 'destructive',
        });
        return [] as Prescription[];
      }
      
      console.log('Fetched prescriptions:', data);
      
      // Get profile data for each prescription
      const processedData = await Promise.all((data || []).map(async (prescription) => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', prescription.prescribed_by)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile for prescription:', profileError);
          return {
            ...prescription,
            profile: null
          };
        }
          
        return {
          ...prescription,
          profile: profileData
        };
      }));
      
      return processedData as Prescription[];
    },
    enabled: !!user,
  });

  // Fetch lab tests data
  const { data: labTests, isLoading: isLabTestsLoading } = useQuery({
    queryKey: ['lab_tests', user?.id],
    queryFn: async () => {
      if (!user) return [] as LabTest[];
      
      console.log('Fetching lab tests for user:', user.id);
      const { data, error } = await supabase
        .from('lab_tests')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching lab tests:', error);
        toast({
          title: 'Error fetching lab tests',
          description: error.message,
          variant: 'destructive',
        });
        return [] as LabTest[];
      }
      
      console.log('Fetched lab tests:', data);
      return (data || []) as LabTest[];
    },
    enabled: !!user,
  });

  return {
    prescriptions: prescriptions || [],
    labTests: labTests || [],
    isLoading: isPrescriptionsLoading || isLabTestsLoading
  };
};
