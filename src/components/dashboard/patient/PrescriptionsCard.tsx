
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui-custom/Button';
import { Prescription } from '@/integrations/supabase/client';
import { isAfter, addDays, parseISO } from 'date-fns';

interface PrescriptionsCardProps {
  prescriptions: Prescription[];
}

const PrescriptionsCard: React.FC<PrescriptionsCardProps> = ({ prescriptions }) => {
  const navigate = useNavigate();
  
  // Function to check if a prescription is still active
  // Assuming prescriptions are active for 30 days from creation by default
  const isPrescriptionActive = (createdAt: string): boolean => {
    const creationDate = parseISO(createdAt);
    const expirationDate = addDays(creationDate, 30);
    return isAfter(expirationDate, new Date());
  };
  
  return (
    <div className="space-y-4">
      {prescriptions && prescriptions.length > 0 ? (
        prescriptions.slice(0, 2).map((prescription) => {
          const isActive = isPrescriptionActive(prescription.created_at);
          
          return (
            <div key={prescription.id} className="p-4 border rounded-lg hover:bg-muted/40 transition-colors">
              <div className="flex justify-between">
                <h3 className="font-medium">{prescription.medicine_name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {isActive ? 'Active' : 'Expired'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{prescription.dosage}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Prescribed by {prescription.profile?.name || 'Unknown Doctor'} on {new Date(prescription.created_at).toLocaleDateString()}
              </p>
            </div>
          );
        })
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No prescriptions found. Your doctor can prescribe medications when needed.
        </div>
      )}
      
      <Button variant="ghost" className="w-full" onClick={() => navigate('/prescriptions')}>
        View All Prescriptions
      </Button>
    </div>
  );
};

export default PrescriptionsCard;
