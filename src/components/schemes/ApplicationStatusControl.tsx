import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ApplicationStatus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bookmark, CheckCircle2, ChevronDown, Send, ThumbsUp, XCircle, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Props {
  schemeId: string;
  className?: string;
}

const STATUS_META: Record<ApplicationStatus, { labelKey: string; variant: 'secondary' | 'default' | 'destructive' | 'outline' }> = {
  interested: { labelKey: 'apps.statusInterested', variant: 'secondary' },
  applied: { labelKey: 'apps.statusApplied', variant: 'default' },
  approved: { labelKey: 'apps.statusApproved', variant: 'default' },
  rejected: { labelKey: 'apps.statusRejected', variant: 'destructive' },
};

export function ApplicationStatusControl({ schemeId, className }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_scheme_applications')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('scheme_id', schemeId)
        .maybeSingle();
      if (data) {
        setStatus(data.status as ApplicationStatus);
        setAppId(data.id);
      }
    })();
  }, [user, schemeId]);

  if (!user) return null;

  const setNew = async (next: ApplicationStatus) => {
    setBusy(true);
    try {
      if (appId) {
        const { error } = await supabase
          .from('user_scheme_applications')
          .update({
            status: next,
            applied_at: next === 'applied' || next === 'approved' ? new Date().toISOString() : null,
          })
          .eq('id', appId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('user_scheme_applications')
          .insert({
            user_id: user.id,
            scheme_id: schemeId,
            status: next,
            applied_at: next === 'applied' || next === 'approved' ? new Date().toISOString() : null,
          })
          .select('id')
          .single();
        if (error) throw error;
        setAppId(data.id);
      }
      setStatus(next);
      toast({ title: t('apps.tracked') });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: t('common.error') });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!appId) return;
    setBusy(true);
    try {
      // No DELETE policy on the table, so we revert to "interested" instead.
      // Simpler UX: just reset status visually and warn user.
      const { error } = await supabase
        .from('user_scheme_applications')
        .update({ status: 'interested', applied_at: null })
        .eq('id', appId);
      if (error) throw error;
      setStatus('interested');
      toast({ title: t('apps.tracked') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={status ? 'outline' : 'default'} disabled={busy} className="w-full">
            {status ? (
              <>
                <Badge variant={STATUS_META[status].variant} className="mr-2">
                  {t(STATUS_META[status].labelKey as any)}
                </Badge>
                {t('apps.updateStatus')}
              </>
            ) : (
              <>
                <Bookmark className="mr-2 h-4 w-4" />
                {t('apps.markInterested')}
              </>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setNew('interested')}>
            <Bookmark className="mr-2 h-4 w-4" />
            {t('apps.markInterested')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setNew('applied')}>
            <Send className="mr-2 h-4 w-4" />
            {t('apps.markApplied')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setNew('approved')}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {t('apps.markApproved')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setNew('rejected')}>
            <XCircle className="mr-2 h-4 w-4" />
            {t('apps.markRejected')}
          </DropdownMenuItem>
          {status && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={remove}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('apps.remove')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
