export type GenderType = 'male' | 'female' | 'other';
export type CategoryType = 'general' | 'obc' | 'sc' | 'st' | 'ews';
export type OccupationType = 'student' | 'employed' | 'self_employed' | 'unemployed' | 'farmer' | 'retired' | 'homemaker';
export type EducationType = 'none' | 'primary' | 'secondary' | 'higher_secondary' | 'graduate' | 'postgraduate' | 'doctorate';
export type DisabilityType = 'none' | 'visual' | 'hearing' | 'locomotor' | 'mental' | 'multiple';
export type AppRole = 'user' | 'admin';
export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced' | 'separated';
export type FarmerType = 'landless' | 'marginal' | 'small' | 'medium' | 'large';
export type RationCardType = 'none' | 'apl' | 'bpl' | 'aay' | 'priority';
export type ApplicationStatus = 'interested' | 'applied' | 'approved' | 'rejected';

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
  // New fields
  marital_status: MaritalStatus | null;
  dependents: number;
  religion: string | null;
  sub_caste: string | null;
  land_acres: number;
  farmer_type: FarmerType | null;
  has_bank_account: boolean;
  has_aadhaar: boolean;
  ration_card: RationCardType;
  email_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface Scheme {
  id: string;
  name: string;
  name_ta: string | null;
  description: string | null;
  description_ta: string | null;
  ministry: string;
  ministry_ta: string | null;
  benefits: string | null;
  benefits_ta: string | null;
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
  // New matching fields
  marital_statuses: MaritalStatus[] | null;
  religions: string[] | null;
  farmer_types: FarmerType[] | null;
  max_land_acres: number | null;
  requires_bank_account: boolean;
  requires_aadhaar: boolean;
  ration_cards: RationCardType[] | null;
  scheme_level?: 'central' | 'state';
  created_at: string;
  updated_at: string;
}

export interface UserSchemeApplication {
  id: string;
  user_id: string;
  scheme_id: string;
  status: ApplicationStatus;
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

export interface EligibilityItem {
  code: string;
  params?: Record<string, string | number>;
}

export interface EligibilityResult {
  scheme: Scheme;
  isEligible: boolean;
  confidenceScore: number;
  reasons: string[];
  missingCriteria: string[];
  reasonItems: EligibilityItem[];
  missingItems: EligibilityItem[];
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

export const RELIGIONS = [
  'Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Other'
];
