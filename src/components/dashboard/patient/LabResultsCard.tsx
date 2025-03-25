
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui-custom/Button';
import { cn } from '@/lib/utils';
import { LabTest } from '@/integrations/supabase/client';

interface LabResultsCardProps {
  labTests: LabTest[];
}

const LabResultsCard: React.FC<LabResultsCardProps> = ({ labTests }) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      {labTests && labTests.length > 0 ? (
        labTests.slice(0, 2).map((test) => (
          <div key={test.id} className="p-4 border rounded-lg hover:bg-muted/40 transition-colors">
            <div className="flex justify-between">
              <h3 className="font-medium">{test.test_name}</h3>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                test.status === 'Completed'
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
              )}>
                {test.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{test.test_name}</p>
            <p className="text-xs text-muted-foreground mt-2">Test date: {new Date(test.test_date).toLocaleDateString()}</p>
            {test.status === 'Completed' && (
              <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/lab-results?id=${test.id}`)}>
                View Results
              </Button>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No lab tests found. Your doctor will order tests when needed.
        </div>
      )}
      
      <Button variant="ghost" className="w-full" onClick={() => navigate('/lab-results')}>
        View All Results
      </Button>
    </div>
  );
};

export default LabResultsCard;
