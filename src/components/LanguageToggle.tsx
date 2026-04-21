import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="font-medium">{language === 'en' ? 'EN' : 'த'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          {t('lang.english')} (EN)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('ta')}
          className={language === 'ta' ? 'bg-accent' : ''}
        >
          {t('lang.tamil')} (தமிழ்)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
