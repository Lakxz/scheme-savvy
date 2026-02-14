import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile, INDIAN_STATES, GenderType, CategoryType, OccupationType, EducationType, DisabilityType } from '@/types/database';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    age: undefined,
    gender: undefined,
    category: 'general',
    occupation: undefined,
    education: undefined,
    disability: 'none',
    annual_income: 0,
    state: '',
    district: '',
    is_bpl: false,
    is_minority: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          age: profile.age,
          gender: profile.gender,
          category: profile.category,
          occupation: profile.occupation,
          education: profile.education,
          disability: profile.disability,
          annual_income: profile.annual_income,
          state: profile.state,
          district: profile.district,
          is_bpl: profile.is_bpl,
          is_minority: profile.is_minority,
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your eligibility profile has been saved. Check your dashboard for matching schemes!',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              Eligibility Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete your profile to discover government schemes you're eligible for.
            </p>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details for scheme eligibility</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    max={150}
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || undefined })}
                    placeholder="Your age"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender || ''}
                    onValueChange={(value) => setProfile({ ...profile, gender: value as GenderType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={profile.category || 'general'}
                    onValueChange={(value) => setProfile({ ...profile, category: value as CategoryType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="obc">OBC</SelectItem>
                      <SelectItem value="sc">SC</SelectItem>
                      <SelectItem value="st">ST</SelectItem>
                      <SelectItem value="ews">EWS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Occupation & Education */}
            <Card>
              <CardHeader>
                <CardTitle>Occupation & Education</CardTitle>
                <CardDescription>Your professional and educational background</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Select
                    value={profile.occupation || ''}
                    onValueChange={(value) => setProfile({ ...profile, occupation: value as OccupationType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self_employed">Self Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="homemaker">Homemaker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select
                    value={profile.education || ''}
                    onValueChange={(value) => setProfile({ ...profile, education: value as EducationType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Formal Education</SelectItem>
                      <SelectItem value="primary">Primary (1-5)</SelectItem>
                      <SelectItem value="secondary">Secondary (6-10)</SelectItem>
                      <SelectItem value="higher_secondary">Higher Secondary (11-12)</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="postgraduate">Post Graduate</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income (₹)</Label>
                  <Input
                    id="income"
                    type="number"
                    min={0}
                    value={profile.annual_income || ''}
                    onChange={(e) => setProfile({ ...profile, annual_income: parseInt(e.target.value) || 0 })}
                    placeholder="Your annual income"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disability">Disability Status</Label>
                  <Select
                    value={profile.disability || 'none'}
                    onValueChange={(value) => setProfile({ ...profile, disability: value as DisabilityType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select disability status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="visual">Visual Impairment</SelectItem>
                      <SelectItem value="hearing">Hearing Impairment</SelectItem>
                      <SelectItem value="locomotor">Locomotor Disability</SelectItem>
                      <SelectItem value="mental">Mental Disability</SelectItem>
                      <SelectItem value="multiple">Multiple Disabilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Your state and district for regional schemes</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={profile.state || ''}
                    onValueChange={(value) => setProfile({ ...profile, state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={profile.district || ''}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    placeholder="Enter your district"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Special Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Special Categories</CardTitle>
                <CardDescription>Additional eligibility criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bpl">Below Poverty Line (BPL)</Label>
                    <p className="text-sm text-muted-foreground">Do you have a BPL card?</p>
                  </div>
                  <Switch
                    id="bpl"
                    checked={profile.is_bpl || false}
                    onCheckedChange={(checked) => setProfile({ ...profile, is_bpl: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="minority">Minority Community</Label>
                    <p className="text-sm text-muted-foreground">Do you belong to a minority community?</p>
                  </div>
                  <Switch
                    id="minority"
                    checked={profile.is_minority || false}
                    onCheckedChange={(checked) => setProfile({ ...profile, is_minority: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile & Find Schemes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
