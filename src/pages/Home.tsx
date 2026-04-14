import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowRight, Sparkles, Wind, Heart, Skull, Shield, Zap, History, Clock, Globe } from 'lucide-react';
import { db, collection, getDocs, query, limit, orderBy } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';

const ERAS = [
  { name: 'Romantic', icon: <Heart size={20} />, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  { name: 'Victorian', icon: <History size={20} />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { name: 'Modern', icon: <Zap size={20} />, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  { name: 'Renaissance', icon: <Globe size={20} />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
];

const THEMES = [
  { name: 'Love', icon: <Heart size={16} /> },
  { name: 'Nature', icon: <Wind size={16} /> },
  { name: 'Death', icon: <Skull size={16} /> },
  { name: 'War', icon: <Shield size={16} /> },
  { name: 'Hope', icon: <Sparkles size={16} /> },
];

const MOODS = ['Melancholic', 'Joyful', 'Pensive', 'Heroic', 'Serene', 'Dark'];

export default function Home() {
  const [featuredPoem, setFeaturedPoem] = useState<any>(null);
  const [popularPoems, setPopularPoems] = useState<any[]>([]);
  const [famousPoets, setFamousPoets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const poemsSnap = await getDocs(query(collection(db, 'poems'), limit(6)));
        const poetsSnap = await getDocs(query(collection(db, 'poets'), limit(6)));
        
        const poems = poemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        const poets = poetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        setPopularPoems(poems);
        setFamousPoets(poets);
        if (poems.length > 0) setFeaturedPoem(poems[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      <Helmet>
        <title>Wordstack | Classic Poetry Library</title>
        <meta name="description" content="Explore a comprehensive library of classic poems and poets. Powered by Gemini AI for deep analysis and understanding." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden rounded-2xl sm:rounded-3xl bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
        <div className="relative container mx-auto px-4 sm:px-8 text-center space-y-6 sm:space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight"
          >
            Where Every Word <br /> <span className="italic text-sky-300">Resonates</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto font-sans"
          >
            Wordstack is a modern classic poetry library built around discovery, comprehension, and atmosphere.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {THEMES.map((theme) => (
              <Link key={theme.name} to={`/search?theme=${theme.name}`}>
                <Badge variant="secondary" className="px-4 py-2 text-sm gap-2 hover:bg-white hover:text-primary transition-colors cursor-pointer">
                  {theme.icon}
                  {theme.name}
                </Badge>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Poem of the Day */}
      {featuredPoem && (
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
              <Sparkles size={18} />
              Poem of the Day
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold break-words">{featuredPoem.title}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground italic">by {featuredPoem.poetName}</p>
            <div className="poem-content text-base sm:text-lg line-clamp-6 opacity-80 break-words">
              {featuredPoem.content}
            </div>
            <Link to={`/poem/${featuredPoem.id}`}>
              <Button className="group gap-2 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
                Read Full Poem
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src={featuredPoem.imageUrl || `https://picsum.photos/seed/${featuredPoem.title}/800/1000`} 
              alt={featuredPoem.title}
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </motion.div>
        </section>
      )}

      {/* Era-based Browsing */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold">Browse by Era</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ERAS.map((era) => (
            <Link key={era.name} to={`/search?era=${era.name}`}>
              <Card className={`hover:scale-105 transition-transform cursor-pointer border-none ${era.color}`}>
                <CardContent className="p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    {era.icon}
                  </div>
                  <span className="font-bold text-base sm:text-lg text-center">{era.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Classics */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold">Popular Classics</h3>
          <Link to="/search" className="text-primary font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
          ) : (
            popularPoems.map((poem) => (
              <motion.div key={poem.id} whileHover={{ y: -5 }}>
                <Link to={`/poem/${poem.id}`}>
                  <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-xl transition-shadow">
                    <div className="aspect-video relative">
                      <img 
                        src={poem.imageUrl || `https://picsum.photos/seed/${poem.title}/600/400`} 
                        alt={poem.title}
                        className="object-cover w-full h-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <CardContent className="p-6 space-y-2">
                      <h4 className="text-xl font-serif font-bold">{poem.title}</h4>
                      <p className="text-muted-foreground">{poem.poetName}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {poem.themes?.slice(0, 2).map((t: string) => (
                          <Badge key={t} variant="outline" className="text-[10px] uppercase tracking-tighter">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Famous Poets */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold">Famous Poets</h3>
          <Link to="/search?type=poet" className="text-primary font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {loading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="w-64 h-80 flex-shrink-0 rounded-2xl" />)
          ) : (
            famousPoets.map((poet) => (
              <motion.div key={poet.id} whileHover={{ scale: 1.02 }} className="flex-shrink-0 w-64">
                <Link to={`/poet/${poet.id}`}>
                  <Card className="overflow-hidden border-none shadow-lg group">
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
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Mood-based Discovery */}
      <section className="bg-muted/30 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center space-y-6 sm:space-y-8">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold">How are you feeling?</h3>
        <p className="text-muted-foreground">Discover poems that match your current mood.</p>
        <div className="flex flex-wrap justify-center gap-4">
          {MOODS.map((mood) => (
            <Link key={mood} to={`/search?mood=${mood}`}>
              <Button variant="outline" className="rounded-full px-8 hover:bg-primary hover:text-primary-foreground transition-all">
                {mood}
              </Button>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
