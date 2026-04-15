import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Share2, Settings2, Sparkles, BookOpen, ListTree, History, MessageSquare, ChevronRight, ArrowLeft, Type, AlignLeft, BadgeCheck } from 'lucide-react';
import { db, doc, getDoc, collection, query, where, limit, getDocs } from '@/lib/firebase';
import { analyzePoem, askAboutPoem, PoemAnalysis } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function PoemDetail() {
  const { id } = useParams();
  const [poem, setPoem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<PoemAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showSettings, setShowSettings] = useState(false);
  const [relatedPoems, setRelatedPoems] = useState<any[]>([]);
  const expertCommentary = poem?.expertCommentary;
  const hasExpertCommentary = Boolean(
    expertCommentary?.highlight ||
    expertCommentary?.name ||
    expertCommentary?.credentials ||
    expertCommentary?.profilePic
  );

  useEffect(() => {
    async function fetchPoem() {
      if (!id) return;
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'poems', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPoem({ id: docSnap.id, ...docSnap.data() as any });
          if (data.analysisCache) {
            setAnalysis(data.analysisCache);
          }
          
          // Fetch related poems
          const relatedSnap = await getDocs(query(
            collection(db, 'poems'), 
            where('poetId', '==', data.poetId),
            limit(4)
          ));
          setRelatedPoems(relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() as any }))
            .filter(p => p.id !== id)
          );
        }
      } catch (error) {
        console.error("Error fetching poem:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPoem();
  }, [id]);

  const handleAnalyze = async () => {
    if (!poem) return;
    setAnalyzing(true);
    try {
      const result = await analyzePoem(poem.title, poem.poetName, poem.content);
      setAnalysis(result);
      // In a real app, we would update the cache in Firestore here
    } catch (error) {
      toast.error("Failed to analyze poem. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poem || !question.trim()) return;
    setAsking(true);
    try {
      const result = await askAboutPoem(poem.title, poem.poetName, poem.content, question);
      setAnswer(result);
    } catch (error) {
      toast.error("Failed to get an answer. Please try again.");
    } finally {
      setAsking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poem.title,
          text: `Read "${poem.title}" by ${poem.poetName} on Wordstack.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!poem) return <div className="text-center py-20">Poem not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <Helmet>
        <title>{poem.title} by {poem.poetName} | Wordstack</title>
        <meta name="description" content={`Read and analyze ${poem.title} by ${poem.poetName}. AI-powered line-by-line analysis and historical context.`} />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Library
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold tracking-tight break-words">{poem.title}</h1>
          <Link to={`/poet/${poem.poetId}`} className="text-2xl text-primary font-serif italic hover:underline block">
            by {poem.poetName}
          </Link>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary">{poem.era}</Badge>
            {poem.themes?.map((t: string) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
            {poem.mood && <Badge variant="outline" className="bg-primary/5">{poem.mood}</Badge>}
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)} className={showSettings ? 'bg-primary text-primary-foreground' : ''}>
            <Settings2 size={20} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 size={20} />
          </Button>
          {poem.audioUrl && (
            <Button className="rounded-full gap-2 bg-royal-blue hover:bg-royal-blue-light">
              <Play size={18} fill="currentColor" />
              Listen
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Poem Content */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="bg-muted/30 border-none">
                  <CardContent className="p-6 flex flex-wrap gap-8">
                    <div className="flex-1 min-w-[200px] space-y-4">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="flex items-center gap-2"><Type size={16} /> Font Size</span>
                        <span>{fontSize}px</span>
                      </div>
                      <Slider value={[fontSize]} min={12} max={32} step={1} onValueChange={(v) => setFontSize(v[0])} />
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-4">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="flex items-center gap-2"><AlignLeft size={16} /> Line Spacing</span>
                        <span>{lineHeight.toFixed(1)}</span>
                      </div>
                      <Slider value={[lineHeight]} min={1} max={3} step={0.1} onValueChange={(v) => setLineHeight(v[0])} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 md:p-16">
              <div 
                className="poem-content font-serif text-center md:text-left"
                style={{ 
                  '--poem-font-size': `${fontSize}px`, 
                  '--poem-line-height': lineHeight 
                } as React.CSSProperties}
              >
                {poem.content}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / AI Analysis */}
        <div className="space-y-8">
          <div className="sticky top-24 space-y-8">
            <Card className="border-primary/20 overflow-hidden">
              <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <Sparkles size={18} />
                  Smart Analysis
                </div>
                {!analysis && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={handleAnalyze} 
                    disabled={analyzing}
                    className="h-8 text-xs"
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze with AI'}
                  </Button>
                )}
              </div>
              <CardContent className="p-0">
                {analysis ? (
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="w-full rounded-none bg-muted/50 h-auto min-h-12 overflow-x-auto whitespace-nowrap">
                      <TabsTrigger value="summary" className="flex-1 gap-1 min-w-[110px]"><BookOpen size={14} /> Summary</TabsTrigger>
                      <TabsTrigger value="lines" className="flex-1 gap-1 min-w-[95px]"><ListTree size={14} /> Lines</TabsTrigger>
                      <TabsTrigger value="context" className="flex-1 gap-1 min-w-[110px]"><History size={14} /> Context</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="h-[400px]">
                      <div className="p-6">
                        <TabsContent value="summary" className="mt-0">
                          <div className="markdown-body text-sm">
                            <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                          </div>
                        </TabsContent>
                        <TabsContent value="lines" className="mt-0">
                          <div className="markdown-body text-sm">
                            <ReactMarkdown>{analysis.lineByLine}</ReactMarkdown>
                          </div>
                        </TabsContent>
                        <TabsContent value="context" className="mt-0">
                          <div className="markdown-body text-sm">
                            <ReactMarkdown>{analysis.historicalContext}</ReactMarkdown>
                          </div>
                        </TabsContent>
                      </div>
                    </ScrollArea>
                  </Tabs>
                ) : (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <Sparkles size={32} />
                    </div>
                    <p className="text-muted-foreground text-sm">Unlock deep insights, line-by-line analysis, and historical context with Gemini AI.</p>
                    <Button onClick={handleAnalyze} disabled={analyzing} className="w-full">
                      {analyzing ? 'Analyzing Poem...' : 'Analyze Poem'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Expert Commentary */}
            {poem.expertCommentary?.name && (
              <Card className="border-primary/20 lg:hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <BadgeCheck size={18} />
                    Expert Commentary
                  </div>
                  {poem.expertCommentary?.highlight && (
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {poem.expertCommentary.highlight}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    {poem.expertCommentary?.profilePic ? (
                      <img
                        src={poem.expertCommentary.profilePic}
                        alt={poem.expertCommentary.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 border flex items-center justify-center text-primary font-bold">
                        {poem.expertCommentary.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold leading-tight">{poem.expertCommentary.name}</p>
                      {poem.expertCommentary?.credentials && (
                        <p className="text-xs text-muted-foreground">{poem.expertCommentary.credentials}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Q&A Section */}
            <Card className="border-none bg-muted/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <MessageSquare size={18} />
                  Ask a Question
                </div>
                <form onSubmit={handleAsk} className="space-y-3">
                  <Input 
                    placeholder="What does the raven symbolize?" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="bg-background border-none"
                  />
                  <Button type="submit" disabled={asking || !question.trim()} className="w-full">
                    {asking ? 'Thinking...' : 'Ask AI'}
                  </Button>
                </form>
                {answer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-background rounded-lg text-sm border"
                  >
                    <div className="markdown-body">
                      <ReactMarkdown>{answer}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Poems */}
      {relatedPoems.length > 0 && (
        <section className="space-y-8 pt-12 border-t">
          <h3 className="text-3xl font-serif font-bold">More by {poem.poetName}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedPoems.map((p) => (
              <Link key={p.id} to={`/poem/${p.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow border-none bg-muted/20">
                  <CardContent className="p-6 space-y-2">
                    <h4 className="font-serif font-bold text-lg line-clamp-1">{p.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">{p.content}</p>
                    <div className="flex items-center gap-1 text-primary text-xs font-bold pt-2">
                      READ MORE <ChevronRight size={14} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
