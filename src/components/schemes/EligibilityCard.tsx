import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EligibilityResult } from '@/types/database';
import { getDaysUntilExpiry, getExpiryStatus } from '@/lib/eligibility-engine';
import { CheckCircle2, XCircle, AlertCircle, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface EligibilityCardProps {
  result: EligibilityResult;
}

export function EligibilityCard({ result }: EligibilityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { scheme, isEligible, confidenceScore, reasons, missingCriteria } = result;

  const daysUntilExpiry = getDaysUntilExpiry(scheme.application_deadline);
  const expiryStatus = getExpiryStatus(daysUntilExpiry);

  const getStatusIcon = () => {
    if (isEligible) return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
    if (confidenceScore >= 50) return <AlertCircle className="h-6 w-6 text-amber-500" />;
    return <XCircle className="h-6 w-6 text-destructive" />;
  };

  const getStatusText = () => {
    if (isEligible) return 'Eligible';
    if (confidenceScore >= 50) return 'Partially Eligible';
    return 'Not Eligible';
  };

  const getExpiryBadge = () => {
    if (expiryStatus === 'expired') return <Badge variant="destructive">Expired</Badge>;
    if (expiryStatus === 'urgent') return <Badge variant="destructive" className="animate-pulse"><Clock className="h-3 w-3 mr-1" />{daysUntilExpiry}d left!</Badge>;
    if (expiryStatus === 'warning') return <Badge variant="secondary" className="bg-amber-500/20 text-amber-700"><Clock className="h-3 w-3 mr-1" />{daysUntilExpiry}d left</Badge>;
    if (daysUntilExpiry) return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{daysUntilExpiry}d</Badge>;
    return null;
  };

  return (
    <Card className={`transition-all ${isEligible ? 'border-emerald-500/50' : confidenceScore >= 50 ? 'border-amber-500/50' : 'border-border'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {getStatusIcon()}
            <div className="space-y-1">
              <CardTitle className="text-base leading-tight">{scheme.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{scheme.ministry}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 text-sm font-semibold ${
              isEligible ? 'bg-emerald-500/20 text-emerald-600' : 
              confidenceScore >= 50 ? 'bg-amber-500/20 text-amber-600' : 
              'bg-muted text-muted-foreground'
            }`}>
              {confidenceScore}% Match
            </div>
            {getExpiryBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={isEligible ? 'default' : 'secondary'}>
            {getStatusText()}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? 'Hide Details' : 'Show Why'}
            {expanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
          </Button>
        </div>

        {expanded && (
          <div className="space-y-3 pt-2 border-t border-border">
            {reasons.length > 0 && (
              <div>
                <p className="text-xs font-medium text-emerald-600 mb-2">✓ Why you qualify:</p>
                <ul className="space-y-1">
                  {reasons.map((reason, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {missingCriteria.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-600 mb-2">⚠ What's missing:</p>
                <ul className="space-y-1">
                  {missingCriteria.map((criteria, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scheme.benefits && (
              <div className="bg-muted/50 p-3">
                <p className="text-xs font-medium mb-1">Benefits:</p>
                <p className="text-xs text-muted-foreground">{scheme.benefits}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to={`/schemes/${scheme.id}`}>Full Details</Link>
          </Button>
          {scheme.application_url && isEligible && expiryStatus !== 'expired' && (
            <Button size="sm" asChild>
              <a href={scheme.application_url} target="_blank" rel="noopener noreferrer">
                Apply <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
