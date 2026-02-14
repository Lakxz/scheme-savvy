import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scheme } from '@/types/database';
import { getDaysUntilExpiry, getExpiryStatus } from '@/lib/eligibility-engine';
import { Calendar, Building2, FileText, ExternalLink, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SchemeCardProps {
  scheme: Scheme;
  eligibilityScore?: number;
  showEligibility?: boolean;
}

export function SchemeCard({ scheme, eligibilityScore, showEligibility = false }: SchemeCardProps) {
  const daysUntilExpiry = getDaysUntilExpiry(scheme.application_deadline);
  const expiryStatus = getExpiryStatus(daysUntilExpiry);

  const getExpiryBadge = () => {
    switch (expiryStatus) {
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'urgent':
        return <Badge variant="destructive">{daysUntilExpiry} days left!</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-700">{daysUntilExpiry} days left</Badge>;
      case 'safe':
        return <Badge variant="outline">{daysUntilExpiry} days left</Badge>;
      default:
        return <Badge variant="outline">No deadline</Badge>;
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-tight">{scheme.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <Building2 className="h-3 w-3" />
              {scheme.ministry}
            </CardDescription>
          </div>
          {showEligibility && eligibilityScore !== undefined && (
            <div className={`text-center px-3 py-2 ${eligibilityScore >= 80 ? 'bg-emerald-500/20' : eligibilityScore >= 50 ? 'bg-amber-500/20' : 'bg-muted'}`}>
              <span className={`text-xl font-bold ${eligibilityScore >= 80 ? 'text-emerald-600' : eligibilityScore >= 50 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {eligibilityScore}%
              </span>
              <p className="text-[10px] text-muted-foreground">Match</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{scheme.description}</p>

        {scheme.benefits && (
          <div className="bg-muted/50 p-3 text-sm">
            <p className="font-medium text-xs text-muted-foreground mb-1">Benefits:</p>
            <p className="line-clamp-2">{scheme.benefits}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-auto">
          {getExpiryBadge()}
          {scheme.documents_required && (
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              {scheme.documents_required.length} docs
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" asChild className="flex-1">
            <Link to={`/schemes/${scheme.id}`}>View Details</Link>
          </Button>
          {scheme.application_url && expiryStatus !== 'expired' && (
            <Button asChild size="icon" variant="default">
              <a href={scheme.application_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
