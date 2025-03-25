export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          created_by: string
          date: string
          department: string | null
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          date: string
          department?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          department?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          results: string | null
          status: string
          test_date: string
          test_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          results?: string | null
          status?: string
          test_date?: string
          test_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          results?: string | null
          status?: string
          test_date?: string
          test_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          created_at: string
          created_by: string
          diagnosis: string
          id: string
          patient_id: string
          prescription: string | null
          treatment: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          diagnosis: string
          id?: string
          patient_id: string
          prescription?: string | null
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          diagnosis?: string
          id?: string
          patient_id?: string
          prescription?: string | null
          treatment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          stock_level: number
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          stock_level?: number
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          stock_level?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          blood_type: string | null
          created_at: string
          created_by: string
          dob: string | null
          email: string
          gender: string | null
          id: string
          insurance: string | null
          medical_conditions: string[] | null
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string
          created_by: string
          dob?: string | null
          email: string
          gender?: string | null
          id?: string
          insurance?: string | null
          medical_conditions?: string[] | null
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string
          created_by?: string
          dob?: string | null
          email?: string
          gender?: string | null
          id?: string
          insurance?: string | null
          medical_conditions?: string[] | null
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          dosage: string
          id: string
          medicine_name: string
          patient_id: string
          prescribed_by: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          id?: string
          medicine_name: string
          patient_id: string
          prescribed_by: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          id?: string
          medicine_name?: string
          patient_id?: string
          prescribed_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          department?: string | null
          email: string
          id: string
          name: string
          role: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
