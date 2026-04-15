import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { db, collection, getDocs } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type TopicPageProps = {
  title: string;
  keyword: string;
};

export default function TopicPage({ title, keyword }: TopicPageProps) {
  const [loading, setLoading] = useState(true);
  const [poems, setPoems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTopicPoems() {
      setLoading(true);
      try {
        const poemsSnap = await getDocs(collection(db, 'poems'));
        const allPoems = poemsSnap.docs.map((d) => ({ id: d.id, ...d.data() as any }));
        const q = keyword.toLowerCase();
        const filtered = allPoems.filter((poem) =>
          poem.title?.toLowerCase().includes(q) ||
          poem.content?.toLowerCase().includes(q) ||
          poem.poetName?.toLowerCase().includes(q),
        );

        setPoems(filtered);
      } catch (error) {
        console.error(`${title} page fetch error:`, error);
        setPoems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTopicPoems();
  }, [keyword, title]);

  return (
    <div className="space-y-8 sm:space-y-10 pb-20">
      <Helmet>
        <title>{title} | Wordstack</title>
      </Helmet>

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold">{title}</h1>
        <p className="text-muted-foreground">
          Curated results around <span className="font-semibold">{keyword}</span>.
        </p>
      </header>

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
                  <h2 className="text-2xl font-serif font-bold">{poem.title}</h2>
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
          <p className="text-xl text-muted-foreground">No poems found for {title.toLowerCase()}.</p>
        </div>
      )}
    </div>
  );
}
