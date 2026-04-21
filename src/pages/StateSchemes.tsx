import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Scheme, INDIAN_STATES } from '@/types/database';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SchemeCard } from '@/components/schemes/SchemeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2, Search, Filter, Sparkles, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StateSchemesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [fetching, setFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [schemes, searchQuery, stateFilter]);

  const fetchSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .eq('is_active', true)
        .eq('scheme_level', 'state')
        .order('application_deadline', { ascending: true });

      if (error) throw error;
      setSchemes((data as Scheme[]) || []);
    } catch (error) {
      console.error('Error fetching state schemes:', error);
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
          s.benefits?.toLowerCase().includes(query) ||
          s.states?.some((st) => st.toLowerCase().includes(query))
      );
    }

    if (stateFilter !== 'all') {
      filtered = filtered.filter((s) => s.states?.includes(stateFilter));
    }

    setFilteredSchemes(filtered);
    setCurrentPage(1);
  };

  const fetchWithAI = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-state-schemes');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: t('schemes.updated'),
        description: `${data.count} ${t('schemes.aiSuccess')}`,
      });
      await fetchSchemes();
    } catch (error: any) {
      console.error('AI fetch error:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('schemes.aiError'),
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

  // Available states from data
  const availableStates = Array.from(
    new Set(schemes.flatMap((s) => s.states || []))
  ).sort();

  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchemes = filteredSchemes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-7 w-7 text-primary" />
              {t('state.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('state.subtitle')}</p>
          </div>
          <Button onClick={fetchWithAI} disabled={fetching} className="shrink-0">
            {fetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {fetching ? t('schemes.fetching') : t('state.fetchAI')}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('state.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('state.filterState')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allStates')}</SelectItem>
                {(availableStates.length > 0 ? availableStates : INDIAN_STATES).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('state.noResults')}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {t('schemes.showing')} {startIndex + 1}-{Math.min(endIndex, filteredSchemes.length)} {t('schemes.of')}{' '}
              {filteredSchemes.length} {t('schemes.schemes')}
              {totalPages > 1 && ` (${t('schemes.page')} ${currentPage} / ${totalPages})`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={
                          currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
