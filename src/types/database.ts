export type GenderType = 'male' | 'female' | 'other';
export type CategoryType = 'general' | 'obc' | 'sc' | 'st' | 'ews';
export type OccupationType = 'student' | 'employed' | 'self_employed' | 'unemployed' | 'farmer' | 'retired' | 'homemaker';
export type EducationType = 'none' | 'primary' | 'secondary' | 'higher_secondary' | 'graduate' | 'postgraduate' | 'doctorate';
export type DisabilityType = 'none' | 'visual' | 'hearing' | 'locomotor' | 'mental' | 'multiple';
export type AppRole = 'user' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  age: number | null;
  gender: GenderType | null;
  category: CategoryType;
  occupation: OccupationType | null;
  education: EducationType | null;
  disability: DisabilityType;
  annual_income: number;
  state: string | null;
  district: string | null;
  is_bpl: boolean;
  is_minority: boolean;
  created_at: string;
  updated_at: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string | null;
  ministry: string;
  benefits: string | null;
  documents_required: string[] | null;
  application_url: string | null;
  application_deadline: string | null;
  min_age: number | null;
  max_age: number | null;
  gender: GenderType[] | null;
  categories: CategoryType[] | null;
  occupations: OccupationType[] | null;
  education_levels: EducationType[] | null;
  disabilities: DisabilityType[] | null;
  max_income: number | null;
  states: string[] | null;
  bpl_only: boolean;
  minority_only: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSchemeApplication {
  id: string;
  user_id: string;
  scheme_id: string;
  status: 'interested' | 'applied' | 'approved' | 'rejected';
  applied_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  scheme_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  is_read: boolean;
  created_at: string;
}

export interface EligibilityResult {
  scheme: Scheme;
  isEligible: boolean;
  confidenceScore: number;
  reasons: string[];
  missingCriteria: string[];
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];
