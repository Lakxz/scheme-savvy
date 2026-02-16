import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Scheme } from '@/types/database';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SchemeCard } from '@/components/schemes/SchemeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Filter, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SchemesPage() {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ministryFilter, setMinistryFilter] = useState<string>('all');
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [schemes, searchQuery, ministryFilter]);

  const fetchSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .eq('is_active', true)
        .order('application_deadline', { ascending: true });

      if (error) throw error;
      setSchemes((data as Scheme[]) || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSchemes = () => {
    let filtered = [...schemes];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.ministry.toLowerCase().includes(query) ||
          s.benefits?.toLowerCase().includes(query)
      );
    }

    if (ministryFilter !== 'all') {
      filtered = filtered.filter((s) => s.ministry === ministryFilter);
    }

    setFilteredSchemes(filtered);
  };

  const fetchWithAI = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-schemes');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: 'Schemes Updated',
        description: `${data.count} new schemes fetched using AI`,
      });
      await fetchSchemes();
    } catch (error: any) {
      console.error('AI fetch error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch schemes with AI',
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

  const ministries = [...new Set(schemes.map((s) => s.ministry))];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Browse Government Schemes</h1>
            <p className="text-muted-foreground mt-1">
              Explore all available government schemes and find what you're eligible for
            </p>
          </div>
          <Button onClick={fetchWithAI} disabled={fetching} className="shrink-0">
            {fetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {fetching ? 'Fetching...' : 'Fetch with AI'}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schemes by name, ministry, or benefits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={ministryFilter} onValueChange={setMinistryFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by ministry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ministries</SelectItem>
                {ministries.map((ministry) => (
                  <SelectItem key={ministry} value={ministry}>
                    {ministry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No schemes found matching your criteria.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredSchemes.length} of {schemes.length} schemes
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
