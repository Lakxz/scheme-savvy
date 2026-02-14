import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Scheme, EligibilityResult } from '@/types/database';
import { calculateEligibility, getDaysUntilExpiry, getExpiryStatus } from '@/lib/eligibility-engine';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EligibilityCard } from '@/components/schemes/EligibilityCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle, CheckCircle2, Clock, FileText, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [eligibilityResults, setEligibilityResults] = useState<EligibilityResult[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch all active schemes
      const { data: schemesData } = await supabase
        .from('schemes')
        .select('*')
        .eq('is_active', true);

      if (schemesData) {
        setSchemes(schemesData as Scheme[]);
        
        // Calculate eligibility for each scheme
        if (profileData) {
          const results = schemesData.map((scheme) => 
            calculateEligibility(profileData, scheme as Scheme)
          );
          // Sort by confidence score
          results.sort((a, b) => b.confidenceScore - a.confidenceScore);
          setEligibilityResults(results);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const eligibleSchemes = eligibilityResults.filter(r => r.isEligible);
  const partiallyEligible = eligibilityResults.filter(r => !r.isEligible && r.confidenceScore >= 50);
  const urgentSchemes = eligibilityResults.filter(r => {
    const days = getDaysUntilExpiry(r.scheme.application_deadline);
    return r.isEligible && days !== null && days <= 7 && days >= 0;
  });

  const isProfileIncomplete = !profile?.age || !profile?.gender || !profile?.occupation;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || 'Citizen'}!</h1>
          <p className="text-muted-foreground mt-1">
            Your personalized government scheme recommendations
          </p>
        </div>

        {/* Profile Incomplete Warning */}
        {isProfileIncomplete && (
          <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-medium">Complete Your Profile</p>
                  <p className="text-sm text-muted-foreground">
                    Fill in your details to get accurate scheme recommendations
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/profile">
                  Update Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{eligibleSchemes.length}</p>
                  <p className="text-sm text-muted-foreground">Eligible Schemes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{partiallyEligible.length}</p>
                  <p className="text-sm text-muted-foreground">Partial Match</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10">
                  <Clock className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{urgentSchemes.length}</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{schemes.length}</p>
                  <p className="text-sm text-muted-foreground">Total Schemes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Alerts */}
        {urgentSchemes.length > 0 && (
          <Card className="mb-6 border-destructive/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <Clock className="h-5 w-5" />
                Deadline Alert!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These eligible schemes are expiring within 7 days. Apply now!
              </p>
              <div className="flex flex-wrap gap-2">
                {urgentSchemes.map((result) => (
                  <Badge key={result.scheme.id} variant="destructive" className="text-sm py-1 px-3">
                    {result.scheme.name} - {getDaysUntilExpiry(result.scheme.application_deadline)}d left
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheme Tabs */}
        <Tabs defaultValue="eligible" className="space-y-6">
          <TabsList>
            <TabsTrigger value="eligible">
              Eligible ({eligibleSchemes.length})
            </TabsTrigger>
            <TabsTrigger value="partial">
              Partial Match ({partiallyEligible.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Schemes ({eligibilityResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eligible" className="space-y-4">
            {eligibleSchemes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {isProfileIncomplete 
                      ? 'Complete your profile to see eligible schemes'
                      : 'No fully eligible schemes found. Check partial matches or update your profile.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {eligibleSchemes.map((result) => (
                  <EligibilityCard key={result.scheme.id} result={result} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="partial" className="space-y-4">
            {partiallyEligible.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No partial matches found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {partiallyEligible.map((result) => (
                  <EligibilityCard key={result.scheme.id} result={result} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {eligibilityResults.map((result) => (
                <EligibilityCard key={result.scheme.id} result={result} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
