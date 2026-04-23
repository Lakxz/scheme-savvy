import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { Bell, LogOut, User, Shield, Menu, X, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const load = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnread(count || 0);
    };
    load();
    const channel = supabase
      .channel('nav-notif')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-foreground">GovScheme</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/schemes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.browseSchemes')}
            </Link>
            <Link to="/state-schemes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.stateSchemes')}
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.dashboard')}
                </Link>
                <Link to="/applications" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.applications')}
                </Link>
              </>
            )}
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link to="/notifications" aria-label={t('nav.notifications')}>
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile">{t('nav.profile')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/applications"><ClipboardList className="mr-2 h-4 w-4" />{t('nav.applications')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">{t('nav.signIn')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?mode=signup">{t('nav.getStarted')}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <Link to="/schemes" className="block text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.browseSchemes')}
            </Link>
            <Link to="/state-schemes" className="block text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.stateSchemes')}
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.dashboard')}
                </Link>
                <Link to="/applications" className="block text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.applications')}
                </Link>
                <Link to="/notifications" className="block text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.notifications')}{unread > 0 && ` (${unread})`}
                </Link>
                <Link to="/profile" className="block text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.profileShort')}
                </Link>
                <Button variant="outline" onClick={handleSignOut} className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>{t('nav.signIn')}</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>{t('nav.getStarted')}</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
