import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Scheme, Profile } from '@/types/database';
import { calculateEligibility, getDaysUntilExpiry, getExpiryStatus } from '@/lib/eligibility-engine';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ExternalLink, Calendar, Building2, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SchemeDetails() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    try {
      const { data: schemeData } = await supabase
        .from('schemes')
        .select('*')
        .eq('id', id)
        .single();

      setScheme(schemeData as Scheme);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">{t('details.notFound')}</h1>
          <Button asChild className="mt-4">
            <Link to="/schemes">{t('nav.browseSchemes')}</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(scheme.application_deadline);
  const expiryStatus = getExpiryStatus(daysUntilExpiry);
  const eligibility = profile ? calculateEligibility(profile, scheme) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/schemes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('details.back')}
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold">{scheme.name}</h1>
                {expiryStatus === 'expired' ? (
                  <Badge variant="destructive">{t('card.expired')}</Badge>
                ) : expiryStatus === 'urgent' ? (
                  <Badge variant="destructive" className="animate-pulse">
                    <Clock className="h-3 w-3 mr-1" />
                    {daysUntilExpiry} {t('card.daysLeftUrgent')}
                  </Badge>
                ) : expiryStatus === 'warning' ? (
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {daysUntilExpiry} {t('card.daysLeft')}
                  </Badge>
                ) : null}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Building2 className="h-4 w-4" />
                <span>{scheme.ministry}</span>
              </div>

              <p className="text-lg">{scheme.description}</p>
            </div>

            {scheme.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('details.benefits')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{scheme.benefits}</p>
                </CardContent>
              </Card>
            )}

            {scheme.documents_required && scheme.documents_required.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('details.requiredDocs')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scheme.documents_required.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('details.criteria')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scheme.min_age !== null || scheme.max_age !== null ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('details.ageRange')}</span>
                    <span>{scheme.min_age || 0} - {scheme.max_age || '∞'} {t('details.years')}</span>
                  </div>
                ) : null}
                
                {scheme.gender && scheme.gender.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('profile.gender')}</span>
                    <span className="capitalize">{scheme.gender.join(', ')}</span>
                  </div>
                )}

                {scheme.categories && scheme.categories.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('profile.category')}</span>
                    <span className="uppercase">{scheme.categories.join(', ')}</span>
                  </div>
                )}

                {scheme.max_income !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('details.maxIncome')}</span>
                    <span>₹{scheme.max_income.toLocaleString()}</span>
                  </div>
                )}

                {scheme.bpl_only && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('details.bplOnly')}</span>
                    <Badge variant="secondary">{t('common.yes')}</Badge>
                  </div>
                )}

                {scheme.minority_only && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('details.minoritiesOnly')}</span>
                    <Badge variant="secondary">{t('common.yes')}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Eligibility Check */}
            {user && eligibility && (
              <Card className={eligibility.isEligible ? 'border-primary/50' : 'border-amber-500/50'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {eligibility.isEligible ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-amber-500" />
                    )}
                    {t('details.yourEligibility')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-muted/50">
                    <span className={`text-3xl font-bold ${eligibility.isEligible ? 'text-primary' : 'text-amber-600'}`}>
                      {eligibility.confidenceScore}%
                    </span>
                    <p className="text-sm text-muted-foreground">{t('details.matchScore')}</p>
                  </div>

                  {eligibility.reasons.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-primary mb-2">{t('details.qualifyBecause')}</p>
                      <ul className="space-y-1">
                        {eligibility.reasons.slice(0, 3).map((reason, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {eligibility.missingCriteria.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-600 mb-2">{t('details.missing')}</p>
                      <ul className="space-y-1">
                        {eligibility.missingCriteria.slice(0, 3).map((criteria, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <XCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Apply Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('details.applyNow')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheme.application_deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{t('details.deadline')}: {new Date(scheme.application_deadline).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                )}

                {scheme.application_url && expiryStatus !== 'expired' ? (
                  <Button asChild className="w-full">
                    <a href={scheme.application_url} target="_blank" rel="noopener noreferrer">
                      {t('details.applyOfficial')}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : expiryStatus === 'expired' ? (
                  <Button disabled className="w-full">
                    {t('details.appClosed')}
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    {t('details.noLink')}
                  </Button>
                )}

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    <Link to="/auth" className="text-primary hover:underline">{t('nav.signIn')}</Link> {t('details.signInToCheck')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
