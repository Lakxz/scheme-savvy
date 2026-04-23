import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/database';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, AlertTriangle, Info, Clock, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    setItems((data || []) as Notification[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    load();
  };

  const runScan = async () => {
    setScanning(true);
    try {
      const { error } = await supabase.functions.invoke('scheme-alerts-scan', {
        body: { user_id: user?.id },
      });
      if (error) throw error;
      toast({ title: t('notif.scanDone') });
      load();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: t('common.error') });
    } finally {
      setScanning(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const iconFor = (type: string | null) => {
    if (type === 'urgent') return <Clock className="h-5 w-5 text-destructive" />;
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <Info className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-7 w-7 text-primary" />
              {t('notif.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('notif.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={runScan} disabled={scanning}>
              {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {scanning ? t('notif.checking') : t('notif.checkNow')}
            </Button>
            {items.some((i) => !i.is_read) && (
              <Button variant="ghost" onClick={markAllRead}>
                {t('notif.markRead')}
              </Button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {t('notif.empty')}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <Card key={n.id} className={n.is_read ? '' : 'border-primary/50 bg-primary/5'}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-0.5">{iconFor(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium">{n.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    {n.scheme_id && (
                      <Button asChild variant="link" size="sm" className="px-0 h-auto mt-2">
                        <Link to={`/schemes/${n.scheme_id}`}>{t('notif.viewScheme')} →</Link>
                      </Button>
                    )}
                  </div>
                  {!n.is_read && <Badge variant="default" className="text-xs">new</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
