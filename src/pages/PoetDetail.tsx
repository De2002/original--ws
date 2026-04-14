import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, History, Quote, BookOpen, ChevronRight, ArrowLeft, Globe, MapPin } from 'lucide-react';
import { db, doc, getDoc, collection, query, where, getDocs } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';

export default function PoetDetail() {
  const { id } = useParams();
  const [poet, setPoet] = useState<any>(null);
  const [poems, setPoems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoet() {
      if (!id) return;
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'poets', id));
        if (docSnap.exists()) {
          setPoet({ id: docSnap.id, ...docSnap.data() as any });
          
          // Fetch poet's poems
          const poemsSnap = await getDocs(query(collection(db, 'poems'), where('poetId', '==', id)));
          setPoems(poemsSnap.docs.map(d => ({ id: d.id, ...d.data() as any })));
        }
      } catch (error) {
        console.error("Error fetching poet:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPoet();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row gap-12">
          <Skeleton className="w-full md:w-1/3 aspect-[3/4] rounded-3xl" />
          <div className="flex-1 space-y-6">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!poet) return <div className="text-center py-20">Poet not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      <Helmet>
        <title>{poet.name} | Biography & Poems | Wordstack</title>
        <meta name="description" content={`Explore the life and works of ${poet.name}. Biography, writing style, influence, and a collection of their best poems.`} />
      </Helmet>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row gap-12 items-start">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full md:w-1/3 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl relative"
        >
          <img 
            src={poet.imageUrl || `https://picsum.photos/seed/${poet.name}/600/800`} 
            alt={poet.name}
            className="object-cover w-full h-full"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </motion.div>

        <div className="flex-1 space-y-6">
          <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Library
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight">{poet.name}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground font-medium">
            <span className="flex items-center gap-2"><Calendar size={18} /> {poet.birthDate} — {poet.deathDate}</span>
            <span className="flex items-center gap-2"><History size={18} /> {poet.era} Era</span>
          </div>
          <p className="text-xl leading-relaxed text-muted-foreground font-serif italic">
            "{poet.style}"
          </p>
          <div className="flex gap-2">
            <Badge className="bg-primary hover:bg-primary-light">{poet.era}</Badge>
            <Badge variant="outline">Classic Poet</Badge>
          </div>
        </div>
      </section>

      {/* Detailed Info Tabs */}
      <Tabs defaultValue="bio" className="w-full">
        <TabsList className="w-full justify-start rounded-none bg-transparent border-b h-14 gap-8">
          <TabsTrigger value="bio" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-lg font-bold">Biography</TabsTrigger>
          <TabsTrigger value="poems" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-lg font-bold">Poems ({poems.length})</TabsTrigger>
          <TabsTrigger value="influence" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-lg font-bold">Influence</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-lg font-bold">Timeline</TabsTrigger>
        </TabsList>

        <div className="py-12">
          <TabsContent value="bio" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-lg dark:prose-invert max-w-none font-serif text-xl leading-loose text-muted-foreground">
              {poet.bio}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <Card className="bg-muted/30 border-none">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Quote size={20} />
                    Writing Style
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{poet.style}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-none">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Globe size={20} />
                    Legacy
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{poet.influence}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="poems" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {poems.map((poem) => (
                <Link key={poem.id} to={`/poem/${poem.id}`}>
                  <Card className="h-full hover:shadow-xl transition-all border-none shadow-md group">
                    <CardContent className="p-8 space-y-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <BookOpen size={20} />
                      </div>
                      <h3 className="text-2xl font-serif font-bold">{poem.title}</h3>
                      <p className="text-muted-foreground line-clamp-3 italic">{poem.content}</p>
                      <div className="flex items-center gap-1 text-primary font-bold text-sm pt-2">
                        READ POEM <ChevronRight size={16} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="influence" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl space-y-8">
              <h3 className="text-3xl font-serif font-bold">Literary Influence</h3>
              <p className="text-xl leading-relaxed text-muted-foreground font-serif">
                {poet.influence}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl space-y-12">
              {poet.timeline?.map((item: any, index: number) => (
                <div key={index} className="flex gap-8 relative">
                  {index !== poet.timeline.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-border"></div>
                  )}
                  <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold z-10">
                    {item.year.slice(-2)}
                  </div>
                  <div className="space-y-2 pb-12">
                    <span className="text-primary font-bold text-xl">{item.year}</span>
                    <p className="text-lg text-muted-foreground">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
