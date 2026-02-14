-- Create enums for user profile fields
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE public.category_type AS ENUM ('general', 'obc', 'sc', 'st', 'ews');
CREATE TYPE public.occupation_type AS ENUM ('student', 'employed', 'self_employed', 'unemployed', 'farmer', 'retired', 'homemaker');
CREATE TYPE public.education_type AS ENUM ('none', 'primary', 'secondary', 'higher_secondary', 'graduate', 'postgraduate', 'doctorate');
CREATE TYPE public.disability_type AS ENUM ('none', 'visual', 'hearing', 'locomotor', 'mental', 'multiple');
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Create profiles table for user eligibility data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    age INTEGER CHECK (age >= 0 AND age <= 150),
    gender gender_type,
    category category_type DEFAULT 'general',
    occupation occupation_type,
    education education_type,
    disability disability_type DEFAULT 'none',
    annual_income NUMERIC DEFAULT 0,
    state TEXT,
    district TEXT,
    is_bpl BOOLEAN DEFAULT false,
    is_minority BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create schemes table
CREATE TABLE public.schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    ministry TEXT NOT NULL,
    benefits TEXT,
    documents_required TEXT[],
    application_url TEXT,
    application_deadline DATE,
    -- Eligibility criteria
    min_age INTEGER,
    max_age INTEGER,
    gender gender_type[],
    categories category_type[],
    occupations occupation_type[],
    education_levels education_type[],
    disabilities disability_type[],
    max_income NUMERIC,
    states TEXT[],
    bpl_only BOOLEAN DEFAULT false,
    minority_only BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_scheme_applications table to track applications
CREATE TABLE public.user_scheme_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    scheme_id UUID REFERENCES public.schemes(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'interested' CHECK (status IN ('interested', 'applied', 'approved', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, scheme_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    scheme_id UUID REFERENCES public.schemes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scheme_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Schemes policies (public read, admin write)
CREATE POLICY "Anyone can view active schemes" ON public.schemes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage schemes" ON public.schemes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User scheme applications policies
CREATE POLICY "Users can view own applications" ON public.user_scheme_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.user_scheme_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.user_scheme_applications FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON public.schemes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();