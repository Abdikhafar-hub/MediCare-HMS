
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/context/AuthContext";

// Dashboard data interface
export interface DashboardStats {
  appointments: number;
  patients?: number;
  pendingLabTests?: number;
  prescriptions?: number;
  todayAppointments: any[];
  recentPatients?: any[];
  upcomingAppointments?: any[];
  pendingRequests?: any[];
  lowStockMedications?: any[];
  recentPrescriptions?: any[];
  labTests?: any[];
  staffList?: any[];
}

// Function to fetch dashboard data based on user role
export const fetchDashboardData = async (user: User | null): Promise<DashboardStats> => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  const today = new Date().toISOString().split('T')[0];
  let stats: DashboardStats = {
    appointments: 0,
    todayAppointments: []
  };

  try {
    // Common data for all roles - today's appointments
    const { data: todayAppointments, error: apptError } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        status,
        reason,
        department,
        patient_id,
        doctor_id
      `)
      .gte('date', `${today}T00:00:00`)
      .lte('date', `${today}T23:59:59`);

    if (apptError) throw apptError;

    // Get patient and doctor details for appointments
    const processedAppointments = await Promise.all((todayAppointments || []).map(async (appt) => {
      // Get patient details
      const { data: patientData } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', appt.patient_id)
        .single();
      
      // Get doctor details
      const { data: doctorData } = await supabase
        .from('profiles')
        .select('id, name, department')
        .eq('id', appt.doctor_id)
        .single();
      
      return {
        ...appt,
        patients: patientData,
        doctors: doctorData
      };
    }));

    stats.todayAppointments = processedAppointments || [];
    stats.appointments = stats.todayAppointments.length;

    // Role-specific data
    switch (user.role) {
      case 'admin':
        // Get all patients count
        const { count: patientCount, error: countError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        stats.patients = patientCount || 0;

        // Get staff list
        const { data: staffList, error: staffError } = await supabase
          .from('profiles')
          .select('*')
          .neq('role', 'patient')
          .order('created_at', { ascending: false });

        if (staffError) throw staffError;
        stats.staffList = staffList || [];

        // Get all prescriptions count
        const { count: prescriptionCount, error: prescError } = await supabase
          .from('prescriptions')
          .select('*', { count: 'exact', head: true });

        if (prescError) throw prescError;
        stats.prescriptions = prescriptionCount || 0;

        // Get recent patients for reception/admin
        const { data: adminPatients, error: adminPatientsError } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (adminPatientsError) throw adminPatientsError;
        stats.recentPatients = adminPatients || [];

        // Get recent prescriptions
        const { data: recentPrescriptions, error: recentPrescError } = await supabase
          .from('prescriptions')
          .select(`
            *,
            prescribed_by
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentPrescError) throw recentPrescError;
        
        // Get profile info for each prescription
        const processedPrescriptions = await Promise.all((recentPrescriptions || []).map(async (prescription) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', prescription.prescribed_by)
            .single();
          
          return {
            ...prescription,
            profiles: profileData
          };
        }));
        
        stats.recentPrescriptions = processedPrescriptions || [];
        break;

      case 'doctor':
        // Get doctor's upcoming appointments
        const { data: doctorAppointments, error: docApptError } = await supabase
          .from('appointments')
          .select(`
            id,
            date,
            status,
            reason,
            department,
            patient_id
          `)
          .eq('doctor_id', user.id)
          .gt('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(5);

        if (docApptError) throw docApptError;
        
        // Get patient details for each appointment
        const doctorProcessedAppointments = await Promise.all((doctorAppointments || []).map(async (appt) => {
          const { data: patientData } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('id', appt.patient_id)
            .single();
          
          return {
            ...appt,
            patients: patientData
          };
        }));
        
        stats.upcomingAppointments = doctorProcessedAppointments || [];

        // Get recent patients for this doctor
        const { data: recentPatients, error: patientsError } = await supabase
          .from('appointments')
          .select(`
            patient_id
          `)
          .eq('doctor_id', user.id)
          .order('date', { ascending: false })
          .limit(5);

        if (patientsError) throw patientsError;
        
        // Get patient details
        const recentPatientDetails = await Promise.all((recentPatients || []).map(async (appt) => {
          const { data: patientData } = await supabase
            .from('patients')
            .select('id, name, gender, dob, email, phone')
            .eq('id', appt.patient_id)
            .single();
          
          return patientData;
        }));
        
        stats.recentPatients = recentPatientDetails.filter(Boolean) || [];

        // Get recent prescriptions for this doctor
        const { data: doctorPrescriptions, error: doctorPrescError } = await supabase
          .from('prescriptions')
          .select(`
            *
          `)
          .eq('prescribed_by', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (doctorPrescError) throw doctorPrescError;
        
        // Get profile info for each prescription
        const doctorProcessedPrescriptions = await Promise.all((doctorPrescriptions || []).map(async (prescription) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', prescription.prescribed_by)
            .single();
          
          return {
            ...prescription,
            profiles: profileData
          };
        }));
        
        stats.recentPrescriptions = doctorProcessedPrescriptions || [];
        break;

      case 'patient':
        // Get patient's upcoming appointments
        const { data: patientAppointments, error: patApptError } = await supabase
          .from('appointments')
          .select(`
            id,
            date,
            status,
            reason,
            department,
            doctor_id
          `)
          .eq('patient_id', user.id)
          .gt('date', new Date().toISOString())
          .order('date', { ascending: true });

        if (patApptError) throw patApptError;
        
        // Get doctor details for each appointment
        const patientProcessedAppointments = await Promise.all((patientAppointments || []).map(async (appt) => {
          const { data: doctorData } = await supabase
            .from('profiles')
            .select('id, name, department')
            .eq('id', appt.doctor_id)
            .single();
          
          return {
            ...appt,
            doctors: doctorData
          };
        }));
        
        stats.upcomingAppointments = patientProcessedAppointments || [];
        
        // Get patient's prescriptions
        const { data: patientPrescriptions, error: patPrescError } = await supabase
          .from('prescriptions')
          .select(`
            *
          `)
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false });

        if (patPrescError) throw patPrescError;
        
        // Get profile info for each prescription
        const patientProcessedPrescriptions = await Promise.all((patientPrescriptions || []).map(async (prescription) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', prescription.prescribed_by)
            .single();
          
          return {
            ...prescription,
            profiles: profileData
          };
        }));
        
        stats.recentPrescriptions = patientProcessedPrescriptions || [];

        // Get patient's lab tests
        const { data: patientLabTests, error: patLabError } = await supabase
          .from('lab_tests')
          .select('*')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false });

        if (patLabError) throw patLabError;
        stats.labTests = patientLabTests || [];
        break;

      case 'nurse':
        // Get all patients with recent appointments
        const { data: nursePatients, error: nurseError } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (nurseError) throw nurseError;
        stats.recentPatients = nursePatients || [];
        break;

      case 'lab_technician':
        // Get pending lab tests
        const { data: pendingLabTests, error: labTestsError } = await supabase
          .from('lab_tests')
          .select(`
            *,
            patient_id
          `)
          .eq('status', 'Pending')
          .order('created_at', { ascending: false });

        if (labTestsError) throw labTestsError;
        
        // Get patient details for each lab test
        const processedLabTests = await Promise.all((pendingLabTests || []).map(async (test) => {
          const { data: patientData } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('id', test.patient_id)
            .single();
          
          return {
            ...test,
            patients: patientData
          };
        }));
        
        stats.pendingRequests = processedLabTests || [];
        stats.pendingLabTests = processedLabTests?.length || 0;
        break;

      case 'pharmacist':
        // Get pending prescriptions
        const { data: pharmacistPrescriptions, error: pharmacistPrescError } = await supabase
          .from('prescriptions')
          .select(`
            *
          `)
          .order('created_at', { ascending: false });

        if (pharmacistPrescError) throw pharmacistPrescError;
        
        // Get profile and patient info for each prescription
        const pharmacistProcessedPrescriptions = await Promise.all((pharmacistPrescriptions || []).map(async (prescription) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', prescription.prescribed_by)
            .single();
          
          const { data: patientData } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('id', prescription.patient_id)
            .single();
          
          return {
            ...prescription,
            profiles: profileData,
            patients: patientData
          };
        }));
        
        stats.recentPrescriptions = pharmacistProcessedPrescriptions || [];
        stats.prescriptions = pharmacistProcessedPrescriptions?.length || 0;

        // Get low stock medications
        const { data: lowStockMeds, error: medsError } = await supabase
          .from('medications')
          .select('*')
          .lt('stock_level', 20)  // Assuming low stock is less than 20 units
          .order('stock_level', { ascending: true });

        if (medsError) throw medsError;
        stats.lowStockMedications = lowStockMeds || [];
        break;

      case 'receptionist':
        // Get all patients count
        const { count: receptionistPatientCount, error: receptionistCountError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        if (receptionistCountError) throw receptionistCountError;
        stats.patients = receptionistPatientCount || 0;

        // Get recent patients for reception
        const { data: receptionistPatients, error: receptionistPatientsError } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (receptionistPatientsError) throw receptionistPatientsError;
        stats.recentPatients = receptionistPatients || [];
        break;
    }

    return stats;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
