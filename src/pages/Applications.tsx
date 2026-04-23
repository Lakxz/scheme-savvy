import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ApplicationStatus, Scheme } from '@/types/database';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Row {
  id: string;
  scheme_id: string;
  status: ApplicationStatus;
  applied_at: string | null;
  created_at: string;
  scheme: Scheme;
}

export default function Applications() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('user_scheme_applications')
        .select('id, scheme_id, status, applied_at, created_at, scheme:schemes(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setRows(data as unknown as Row[]);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filterRows = (s: ApplicationStatus | 'all') =>
    s === 'all' ? rows : rows.filter((r) => r.status === s);

  const renderList = (list: Row[]) => {
    if (list.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">{t('apps.empty')}</p>
            <Button asChild>
              <Link to="/schemes">{t('apps.browse')}</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {list.map((r) => {
          const name = language === 'ta' && r.scheme.name_ta ? r.scheme.name_ta : r.scheme.name;
          const ministry = language === 'ta' && r.scheme.ministry_ta ? r.scheme.ministry_ta : r.scheme.ministry;
          return (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <Link to={`/schemes/${r.scheme_id}`} className="font-medium hover:underline block truncate">
                      {name}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">{ministry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.status === 'rejected' ? 'destructive' : r.status === 'approved' ? 'default' : 'secondary'}>
                    {t(`apps.status${r.status.charAt(0).toUpperCase() + r.status.slice(1)}` as any)}
                  </Badge>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/schemes/${r.scheme_id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('apps.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('apps.subtitle')}</p>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="all">{t('apps.tabAll')} ({rows.length})</TabsTrigger>
            <TabsTrigger value="interested">{t('apps.tabInterested')} ({filterRows('interested').length})</TabsTrigger>
            <TabsTrigger value="applied">{t('apps.tabApplied')} ({filterRows('applied').length})</TabsTrigger>
            <TabsTrigger value="approved">{t('apps.tabApproved')} ({filterRows('approved').length})</TabsTrigger>
            <TabsTrigger value="rejected">{t('apps.tabRejected')} ({filterRows('rejected').length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">{renderList(filterRows('all'))}</TabsContent>
          <TabsContent value="interested" className="mt-4">{renderList(filterRows('interested'))}</TabsContent>
          <TabsContent value="applied" className="mt-4">{renderList(filterRows('applied'))}</TabsContent>
          <TabsContent value="approved" className="mt-4">{renderList(filterRows('approved'))}</TabsContent>
          <TabsContent value="rejected" className="mt-4">{renderList(filterRows('rejected'))}</TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
