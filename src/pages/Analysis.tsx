import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Rss, Search as SearchIcon, BarChart3 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

type AnalysisArticle = {
  url: string;
  title: string;
  publishedAt?: string;
};

const FEED_URL = 'https://analysis.wordstack.io/sitemap-posts.xml';

export default function Analysis() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<AnalysisArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const response = await fetch(FEED_URL, {
          mode: 'cors',
          headers: {
            Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8',
          },
        });

        if (!response.ok) {
          throw new Error(`Feed request failed: ${response.status}`);
        }

        const xmlText = await response.text();
        const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
        const parseError = xml.querySelector('parsererror');
        if (parseError) {
          throw new Error('Invalid sitemap XML response');
        }

        const nextArticles = Array.from(xml.querySelectorAll('url'))
          .map((node) => {
            const url = node.querySelector('loc')?.textContent?.trim() || '';
            const publishedAt = node.querySelector('lastmod')?.textContent?.trim() || undefined;
            const slug = url.replace(/\/$/, '').split('/').pop() || '';
            const title = slug
              .replace(/[-_]+/g, ' ')
              .replace(/\b\w/g, (match) => match.toUpperCase());

            return { url, title, publishedAt };
          })
          .filter((article) => article.url);

        setArticles(nextArticles);
      } catch (error) {
        console.error('Analysis feed error:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles;
    const q = searchTerm.toLowerCase();
    return articles.filter((article) =>
      article.title.toLowerCase().includes(q) || article.url.toLowerCase().includes(q),
    );
  }, [articles, searchTerm]);

  return (
    <div className="space-y-8 sm:space-y-10 pb-20">
      <Helmet>
        <title>Analysis Feed | Wordstack</title>
      </Helmet>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Analysis</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Rss size={14} />
              Articles fetched from analysis.wordstack.io
            </p>
          </div>
        </div>

        <div className="relative max-w-2xl">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search analysis feed..."
            className="h-12 pl-11 rounded-2xl shadow-sm"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <a key={article.url} href={article.url} target="_blank" rel="noopener noreferrer" className="group">
              <Card className="h-full border-none shadow-md hover:shadow-xl transition-all bg-gradient-to-b from-card to-muted/20">
                <CardContent className="p-6 space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1 text-[11px] font-semibold text-primary">
                    <Rss size={12} />
                    ANALYSIS
                  </div>
                  <h2 className="text-xl font-serif font-bold leading-snug group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  {article.publishedAt && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-primary font-bold text-xs pt-1">
                    READ ARTICLE <ExternalLink size={14} />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-3xl space-y-2">
          <p className="text-xl text-muted-foreground">No matching analysis articles found.</p>
          <a
            href={FEED_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline inline-flex items-center gap-2"
          >
            Open sitemap feed directly <ExternalLink size={16} />
          </a>
        </div>
      )}
    </div>
  );
}
