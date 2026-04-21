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
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

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
        title: t('profile.updated'),
        description: t('profile.updatedDesc'),
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('profile.saveError'),
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
              {t('profile.title')}
            </h1>
            <p className="text-muted-foreground mt-2">{t('profile.subtitle')}</p>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.personal')}</CardTitle>
                <CardDescription>{t('profile.personalDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder={t('profile.fullNamePh')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">{t('profile.age')}</Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    max={150}
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || undefined })}
                    placeholder={t('profile.agePh')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">{t('profile.gender')}</Label>
                  <Select
                    value={profile.gender || ''}
                    onValueChange={(value) => setProfile({ ...profile, gender: value as GenderType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('profile.male')}</SelectItem>
                      <SelectItem value="female">{t('profile.female')}</SelectItem>
                      <SelectItem value="other">{t('profile.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t('profile.category')}</Label>
                  <Select
                    value={profile.category || 'general'}
                    onValueChange={(value) => setProfile({ ...profile, category: value as CategoryType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t('profile.general')}</SelectItem>
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
                <CardTitle>{t('profile.occupationEdu')}</CardTitle>
                <CardDescription>{t('profile.occupationDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">{t('profile.occupation')}</Label>
                  <Select
                    value={profile.occupation || ''}
                    onValueChange={(value) => setProfile({ ...profile, occupation: value as OccupationType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectOccupation')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">{t('profile.student')}</SelectItem>
                      <SelectItem value="employed">{t('profile.employed')}</SelectItem>
                      <SelectItem value="self_employed">{t('profile.selfEmployed')}</SelectItem>
                      <SelectItem value="unemployed">{t('profile.unemployed')}</SelectItem>
                      <SelectItem value="farmer">{t('profile.farmer')}</SelectItem>
                      <SelectItem value="retired">{t('profile.retired')}</SelectItem>
                      <SelectItem value="homemaker">{t('profile.homemaker')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">{t('profile.education')}</Label>
                  <Select
                    value={profile.education || ''}
                    onValueChange={(value) => setProfile({ ...profile, education: value as EducationType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectEducation')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('profile.eduNone')}</SelectItem>
                      <SelectItem value="primary">{t('profile.eduPrimary')}</SelectItem>
                      <SelectItem value="secondary">{t('profile.eduSecondary')}</SelectItem>
                      <SelectItem value="higher_secondary">{t('profile.eduHigherSec')}</SelectItem>
                      <SelectItem value="graduate">{t('profile.eduGraduate')}</SelectItem>
                      <SelectItem value="postgraduate">{t('profile.eduPostgrad')}</SelectItem>
                      <SelectItem value="doctorate">{t('profile.eduDoctorate')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income">{t('profile.income')}</Label>
                  <Input
                    id="income"
                    type="number"
                    min={0}
                    value={profile.annual_income || ''}
                    onChange={(e) => setProfile({ ...profile, annual_income: parseInt(e.target.value) || 0 })}
                    placeholder={t('profile.incomePh')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disability">{t('profile.disability')}</Label>
                  <Select
                    value={profile.disability || 'none'}
                    onValueChange={(value) => setProfile({ ...profile, disability: value as DisabilityType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectDisability')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('profile.disNone')}</SelectItem>
                      <SelectItem value="visual">{t('profile.disVisual')}</SelectItem>
                      <SelectItem value="hearing">{t('profile.disHearing')}</SelectItem>
                      <SelectItem value="locomotor">{t('profile.disLocomotor')}</SelectItem>
                      <SelectItem value="mental">{t('profile.disMental')}</SelectItem>
                      <SelectItem value="multiple">{t('profile.disMultiple')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.location')}</CardTitle>
                <CardDescription>{t('profile.locationDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">{t('profile.state')}</Label>
                  <Select
                    value={profile.state || ''}
                    onValueChange={(value) => setProfile({ ...profile, state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.selectState')} />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">{t('profile.district')}</Label>
                  <Input
                    id="district"
                    value={profile.district || ''}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    placeholder={t('profile.districtPh')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Special Categories */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.special')}</CardTitle>
                <CardDescription>{t('profile.specialDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bpl">{t('profile.bpl')}</Label>
                    <p className="text-sm text-muted-foreground">{t('profile.bplDesc')}</p>
                  </div>
                  <Switch
                    id="bpl"
                    checked={profile.is_bpl || false}
                    onCheckedChange={(checked) => setProfile({ ...profile, is_bpl: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="minority">{t('profile.minority')}</Label>
                    <p className="text-sm text-muted-foreground">{t('profile.minorityDesc')}</p>
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
                  {t('profile.saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('profile.save')}
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
