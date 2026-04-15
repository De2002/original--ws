import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Moon, Sun, BookOpen, User, Settings, Home, PenLine, BarChart3, CircleHelp, CircleUserRound } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { auth, signOut, onAuthStateChanged, FirebaseUser } from '@/lib/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const mobileBottomNavItems = [
    { label: 'For You', to: '/', icon: Home },
    { label: 'Thoughts', to: '/search?q=thoughts', icon: PenLine },
    { label: 'Analysis', to: '/search?q=analysis', icon: BarChart3 },
    { label: 'Q and A', to: '/search?q=questions', icon: CircleHelp },
    { label: 'Account', to: user ? '/admin' : '/admin', icon: CircleUserRound },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shrink-0">
              <BookOpen size={24} />
            </div>
            <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-primary truncate">Wordstack</span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Input
              type="text"
              placeholder="Search poems, poets, lines..."
              className="pl-10 bg-muted/50 border-none focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}>
                  <User size={20} />
                  <span>Admin</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/admin')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut(auth)}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <Settings size={20} />
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background p-4 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            </form>
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-muted rounded-md">Home</Link>
              <Link to="/search?type=poet" onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-muted rounded-md">Poets</Link>
              <Link to="/search?type=era" onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-muted rounded-md">Eras</Link>
              <div className="flex items-center justify-between p-2">
                <span>Dark Mode</span>
                <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
              </div>
              {user && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-muted rounded-md text-primary font-medium">Admin Dashboard</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="container mx-auto px-3 sm:px-4 py-6 pb-24 sm:pb-8 sm:py-8">
        {children}
      </main>

      <footer className="hidden md:block border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">
                <BookOpen size={18} />
              </div>
              <span className="text-xl font-serif font-bold text-primary">Wordstack</span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              A modern classic poetry library built around discovery, comprehension, and atmosphere. Powered by Gemini AI.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Explore</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/search?era=Romantic" className="hover:text-primary">Romantic Era</Link></li>
              <li><Link to="/search?era=Victorian" className="hover:text-primary">Victorian Era</Link></li>
              <li><Link to="/search?era=Modern" className="hover:text-primary">Modern Era</Link></li>
              <li><Link to="/search?theme=Nature" className="hover:text-primary">Nature Poems</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">About</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/admin" className="hover:text-primary">Admin Access</Link></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Wordstack. Built with passion for poetry.
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 md:hidden">
        <div className="grid h-16 grid-cols-5">
          {mobileBottomNavItems.map((item) => {
            const [itemPath, itemQuery = ''] = item.to.split('?');
            const currentPath = location.pathname;
            const currentQuery = location.search.replace(/^\?/, '');
            const isActive = itemPath === '/'
              ? currentPath === '/'
              : currentPath === itemPath && (!itemQuery || itemQuery === currentQuery);
            const Icon = item.icon;
            const itemClassName = cn(
              'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            );

            return (
              <Link key={item.label} to={item.to} className={itemClassName}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
