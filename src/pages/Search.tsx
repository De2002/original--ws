import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, BookOpen, User, ArrowRight, X } from 'lucide-react';
import { db, collection, getDocs, query, where, orderBy } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const eraParam = searchParams.get('era') || '';
  const themeParam = searchParams.get('theme') || '';
  const moodParam = searchParams.get('mood') || '';
  const typeParam = searchParams.get('type') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [poems, setPoems] = useState<any[]>([]);
  const [poets, setPoets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      setLoading(true);
      try {
        let poemsQuery: any = collection(db, 'poems');
        let poetsQuery: any = collection(db, 'poets');

        // Apply filters
        if (eraParam) {
          poemsQuery = query(poemsQuery, where('era', '==', eraParam));
          poetsQuery = query(poetsQuery, where('era', '==', eraParam));
        }
        if (moodParam) {
          poemsQuery = query(poemsQuery, where('mood', '==', moodParam));
        }
        if (themeParam) {
          poemsQuery = query(poemsQuery, where('themes', 'array-contains', themeParam));
        }

        const [poemsSnap, poetsSnap] = await Promise.all([
          getDocs(poemsQuery),
          getDocs(poetsQuery)
        ]);

        let poemsResults = poemsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        let poetsResults = poetsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

        // Client-side text search (Firestore doesn't support full-text search natively without extra services)
        if (queryParam) {
          const q = queryParam.toLowerCase();
          poemsResults = poemsResults.filter(p => 
            p.title.toLowerCase().includes(q) || 
            p.content.toLowerCase().includes(q) || 
            p.poetName.toLowerCase().includes(q)
          );
          poetsResults = poetsResults.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.bio.toLowerCase().includes(q)
          );
        }

        setPoems(poemsResults);
        setPoets(poetsResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [queryParam, eraParam, themeParam, moodParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');
    setSearchParams(params);
  };

  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    setSearchParams(params);
  };

  return (
    <div className="space-y-12 pb-20">
      <Helmet>
        <title>Search Poems & Poets | Wordstack</title>
      </Helmet>

      {/* Search Header */}
      <div className="space-y-6">
        <h1 className="text-4xl font-serif font-bold">Search Library</h1>
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, line, or poet..."
            className="h-14 pl-12 text-lg rounded-2xl shadow-sm"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl">Search</Button>
        </form>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {eraParam && (
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              Era: {eraParam} <X size={14} className="cursor-pointer" onClick={() => clearFilter('era')} />
            </Badge>
          )}
          {themeParam && (
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              Theme: {themeParam} <X size={14} className="cursor-pointer" onClick={() => clearFilter('theme')} />
            </Badge>
          )}
          {moodParam && (
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              Mood: {moodParam} <X size={14} className="cursor-pointer" onClick={() => clearFilter('mood')} />
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue={typeParam === 'poet' ? 'poets' : 'poems'} className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-12 gap-8">
          <TabsTrigger value="poems" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold text-lg">
            Poems ({poems.length})
          </TabsTrigger>
          <TabsTrigger value="poets" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold text-lg">
            Poets ({poets.length})
          </TabsTrigger>
        </TabsList>

        <div className="py-8">
          <TabsContent value="poems" className="mt-0 space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
              </div>
            ) : poems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {poems.map((poem) => (
                  <Link key={poem.id} to={`/poem/${poem.id}`}>
                    <Card className="h-full hover:shadow-xl transition-all border-none shadow-md group">
                      <CardContent className="p-8 space-y-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <BookOpen size={20} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold">{poem.title}</h3>
                        <p className="text-muted-foreground italic">by {poem.poetName}</p>
                        <p className="text-muted-foreground line-clamp-3 text-sm">{poem.content}</p>
                        <div className="flex items-center gap-1 text-primary font-bold text-xs pt-2">
                          READ FULL POEM <ArrowRight size={14} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-3xl">
                <p className="text-xl text-muted-foreground">No poems found matching your search.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="poets" className="mt-0 space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
              </div>
            ) : poets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {poets.map((poet) => (
                  <Link key={poet.id} to={`/poet/${poet.id}`}>
                    <Card className="overflow-hidden border-none shadow-lg group h-full">
                      <div className="aspect-[3/4] relative">
                        <img 
                          src={poet.imageUrl || `https://picsum.photos/seed/${poet.name}/400/600`} 
                          alt={poet.name}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h4 className="text-xl font-serif font-bold">{poet.name}</h4>
                          <p className="text-xs opacity-80 uppercase tracking-widest">{poet.era}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-3xl">
                <p className="text-xl text-muted-foreground">No poets found matching your search.</p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
