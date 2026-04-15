import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, LogIn, LayoutDashboard, BookOpen, User as UserIcon, Database } from 'lucide-react';
import { auth, db, signInWithPopup, googleProvider, signOut, onAuthStateChanged, FirebaseUser, collection, getDocs, setDoc, doc, deleteDoc, query, orderBy } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Admin() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [poets, setPoets] = useState<any[]>([]);
  const [poems, setPoems] = useState<any[]>([]);
  const [editingPoet, setEditingPoet] = useState<any>(null);
  const [editingPoem, setEditingPoem] = useState<any>(null);
  const [showPoetForm, setShowPoetForm] = useState(false);
  const [showPoemForm, setShowPoemForm] = useState(false);

  const buildDefaultExpertCommentary = (poemTitle: string, poetName: string) => ({
    highlight: `A close reading of "${poemTitle}" reveals how ${poetName} layers imagery, tone, and symbolism to deepen the poem's emotional impact.`,
    name: 'Editorial Notes Team',
    credentials: 'Wordstack Poetry Editors',
    profilePic: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  async function fetchData() {
    try {
      const poetsSnap = await getDocs(query(collection(db, 'poets'), orderBy('name')));
      const poemsSnap = await getDocs(query(collection(db, 'poems'), orderBy('title')));
      setPoets(poetsSnap.docs.map(d => ({ id: d.id, ...d.data() as any })));
      setPoems(poemsSnap.docs.map(d => ({ id: d.id, ...d.data() as any })));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error("Login failed");
    }
  };

  const handleSavePoet = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const poetData = {
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
      era: formData.get('era') as string,
      birthDate: formData.get('birthDate') as string,
      deathDate: formData.get('deathDate') as string,
      style: formData.get('style') as string,
      influence: formData.get('influence') as string,
      imageUrl: formData.get('imageUrl') as string,
    };

    try {
      const poetId = editingPoet?.id || poetData.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'poets', poetId), poetData);
      toast.success("Poet saved");
      setShowPoetForm(false);
      setEditingPoet(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to save poet");
    }
  };

  const handleSavePoem = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const poemData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      poetId: formData.get('poetId') as string,
      poetName: poets.find(p => p.id === formData.get('poetId'))?.name || '',
      era: formData.get('era') as string,
      themes: (formData.get('themes') as string).split(',').map(t => t.trim()),
      mood: formData.get('mood') as string,
      imageUrl: formData.get('imageUrl') as string,
      audioUrl: formData.get('audioUrl') as string,
      expertCommentary: {
        highlight: formData.get('expertHighlight') as string,
        name: formData.get('expertName') as string,
        credentials: formData.get('expertCredentials') as string,
        profilePic: formData.get('expertProfilePic') as string,
      },
    };

    try {
      const poemId = editingPoem?.id || poemData.title.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'poems', poemId), poemData);
      toast.success("Poem saved");
      setShowPoemForm(false);
      setEditingPoem(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to save poem");
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const seedData = async () => {
    if (!confirm("This will seed initial data. Continue?")) return;
    try {
      const initialPoets = [
        {
          id: 'edgar-allan-poe',
          name: 'Edgar Allan Poe',
          bio: 'Edgar Allan Poe was an American writer, poet, editor, and literary critic. Poe is best known for his poetry and short stories, particularly his tales of mystery and the macabre.',
          era: 'Romantic',
          birthDate: '1809',
          deathDate: '1849',
          style: 'Dark Romanticism, Gothic',
          influence: 'Pioneer of the short story, inventor of detective fiction, and major influence on horror and science fiction.',
          imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
          timeline: [
            { year: '1809', event: 'Born in Boston' },
            { year: '1827', event: 'Published Tamerlane and Other Poems' },
            { year: '1845', event: 'Published The Raven' },
            { year: '1849', event: 'Died in Baltimore' }
          ]
        },
        {
          id: 'emily-dickinson',
          name: 'Emily Dickinson',
          bio: 'Emily Dickinson was an American poet. Little-known during her life, she has since been regarded as one of the most important figures in American poetry.',
          era: 'Romantic',
          birthDate: '1830',
          deathDate: '1886',
          style: 'Unconventional punctuation, slant rhyme, short lines',
          influence: 'Major influence on modern poetry and feminist literature.',
          imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop',
          timeline: [
            { year: '1830', event: 'Born in Amherst' },
            { year: '1850', event: 'Began writing poetry seriously' },
            { year: '1886', event: 'Died in Amherst' },
            { year: '1890', event: 'First collection published posthumously' }
          ]
        }
      ];

      const initialPoems = [
        {
          id: 'the-raven',
          title: 'The Raven',
          content: `Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore—
    While I nodded, nearly napping, suddenly there came a tapping,
As of some one gently rapping, rapping at my chamber door.
“’Tis some visitor,” I muttered, “tapping at my chamber door—
            Only this and nothing more.”`,
          poetId: 'edgar-allan-poe',
          poetName: 'Edgar Allan Poe',
          era: 'Romantic',
          themes: ['Death', 'Loss', 'Madness'],
          mood: 'Melancholic',
          imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2070&auto=format&fit=crop',
          expertCommentary: {
            highlight: 'Poe uses the raven as a relentless refrain to externalize the speaker’s grief until language itself becomes a haunted chamber.',
            name: 'Dr. Helena Marks',
            credentials: 'PhD in 19th-Century American Literature',
            profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop'
          }
        },
        {
          id: 'hope-is-the-thing-with-feathers',
          title: '“Hope” is the thing with feathers',
          content: `“Hope” is the thing with feathers -
That perches in the soul -
And sings the tune without the words -
And never stops - at all -

And sweetest - in the Gale - is heard -
And sore must be the storm -
That could abash the little Bird
That kept so many warm -`,
          poetId: 'emily-dickinson',
          poetName: 'Emily Dickinson',
          era: 'Romantic',
          themes: ['Hope', 'Nature', 'Resilience'],
          mood: 'Serene',
          imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?q=80&w=2069&auto=format&fit=crop',
          expertCommentary: {
            highlight: 'Dickinson’s bird is not fragile optimism but a resilient internal force that sings most clearly in crisis.',
            name: 'Prof. Anita Rowe',
            credentials: 'Professor of American Poetry, Amherst Studies',
            profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop'
          }
        }
      ];

      for (const p of initialPoets) await setDoc(doc(db, 'poets', p.id), p);
      for (const p of initialPoems) await setDoc(doc(db, 'poems', p.id), p);

      // Backfill expert commentary for any existing poem docs that don't have it yet.
      const allPoemsSnap = await getDocs(collection(db, 'poems'));
      for (const poemDoc of allPoemsSnap.docs) {
        const poem = poemDoc.data() as any;
        if (!poem.expertCommentary?.highlight && !poem.expertCommentary?.name) {
          await setDoc(doc(db, 'poems', poemDoc.id), {
            ...poem,
            expertCommentary: buildDefaultExpertCommentary(poem.title || 'Untitled', poem.poetName || 'Unknown Poet'),
          });
        }
      }
      
      toast.success("Seeding complete!");
      fetchData();
    } catch (error) {
      toast.error("Seeding failed");
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <Database size={40} />
        </div>
        <h1 className="text-3xl font-serif font-bold">Admin Portal</h1>
        <p className="text-muted-foreground">Sign in to manage Wordstack library content.</p>
        <Button onClick={handleLogin} className="w-full gap-2 py-6 text-lg">
          <LogIn size={20} /> Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold truncate">Admin Dashboard</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={seedData} className="w-full sm:w-auto">Seed Data</Button>
          <Button variant="ghost" onClick={() => signOut(auth)} className="w-full sm:w-auto">Sign Out</Button>
        </div>
      </div>

      <Tabs defaultValue="poems">
        <TabsList className="w-full justify-start h-auto min-h-12 bg-muted/50 rounded-xl p-1 overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="poems" className="flex-1 gap-2 min-w-[130px]"><BookOpen size={18} /> Poems</TabsTrigger>
          <TabsTrigger value="poets" className="flex-1 gap-2 min-w-[130px]"><UserIcon size={18} /> Poets</TabsTrigger>
        </TabsList>

        <TabsContent value="poems" className="pt-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold">Manage Poems</h2>
            <Button onClick={() => { setEditingPoem(null); setShowPoemForm(true); }} className="gap-2 w-full sm:w-auto">
              <Plus size={18} /> Add Poem
            </Button>
          </div>

          {showPoemForm && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>{editingPoem ? 'Edit Poem' : 'New Poem'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePoem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Title</label>
                    <Input name="title" defaultValue={editingPoem?.title} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Poet</label>
                    <select name="poetId" defaultValue={editingPoem?.poetId} className="w-full h-10 px-3 rounded-md border bg-background" required>
                      <option value="">Select a poet</option>
                      {poets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold">Content</label>
                    <textarea name="content" defaultValue={editingPoem?.content} className="w-full h-64 p-4 rounded-md border bg-background font-serif" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Era</label>
                    <Input name="era" defaultValue={editingPoem?.era} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Mood</label>
                    <Input name="mood" defaultValue={editingPoem?.mood} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Themes (comma separated)</label>
                    <Input name="themes" defaultValue={editingPoem?.themes?.join(', ')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Image URL</label>
                    <Input name="imageUrl" defaultValue={editingPoem?.imageUrl} />
                  </div>
                  <div className="space-y-2 md:col-span-2 pt-2">
                    <h4 className="text-sm font-bold text-primary">Expert Commentary (Mobile)</h4>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold">Expert Highlight</label>
                    <textarea
                      name="expertHighlight"
                      defaultValue={editingPoem?.expertCommentary?.highlight}
                      className="w-full h-24 p-3 rounded-md border bg-background"
                      placeholder="Short expert insight shown under Smart Analysis on mobile."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Expert Name</label>
                    <Input name="expertName" defaultValue={editingPoem?.expertCommentary?.name} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Expert Credentials</label>
                    <Input name="expertCredentials" defaultValue={editingPoem?.expertCommentary?.credentials} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold">Expert Profile Pic URL</label>
                    <Input name="expertProfilePic" defaultValue={editingPoem?.expertCommentary?.profilePic} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 md:col-span-2 pt-4">
                    <Button type="submit" className="gap-2 w-full sm:w-auto"><Save size={18} /> Save Poem</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowPoemForm(false)} className="w-full sm:w-auto">Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poems.map(p => (
              <Card key={p.id} className="group">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-serif font-bold text-xl">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">by {p.poetName}</p>
                  <div className="flex gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" onClick={() => { setEditingPoem(p); setShowPoemForm(true); }}><Edit2 size={14} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete('poems', p.id)}><Trash2 size={14} /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="poets" className="pt-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold">Manage Poets</h2>
            <Button onClick={() => { setEditingPoet(null); setShowPoetForm(true); }} className="gap-2 w-full sm:w-auto">
              <Plus size={18} /> Add Poet
            </Button>
          </div>

          {showPoetForm && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>{editingPoet ? 'Edit Poet' : 'New Poet'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePoet} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Name</label>
                    <Input name="name" defaultValue={editingPoet?.name} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Era</label>
                    <Input name="era" defaultValue={editingPoet?.era} required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold">Bio</label>
                    <textarea name="bio" defaultValue={editingPoet?.bio} className="w-full h-32 p-4 rounded-md border bg-background" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Birth Year</label>
                    <Input name="birthDate" defaultValue={editingPoet?.birthDate} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Death Year</label>
                    <Input name="deathDate" defaultValue={editingPoet?.deathDate} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Style</label>
                    <Input name="style" defaultValue={editingPoet?.style} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Influence</label>
                    <Input name="influence" defaultValue={editingPoet?.influence} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Image URL</label>
                    <Input name="imageUrl" defaultValue={editingPoet?.imageUrl} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 md:col-span-2 pt-4">
                    <Button type="submit" className="gap-2 w-full sm:w-auto"><Save size={18} /> Save Poet</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowPoetForm(false)} className="w-full sm:w-auto">Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {poets.map(p => (
              <Card key={p.id} className="group overflow-hidden">
                <div className="aspect-square relative">
                  <img src={p.imageUrl || `https://picsum.photos/seed/${p.name}/400/400`} alt={p.name} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { setEditingPoet(p); setShowPoetForm(true); }}><Edit2 size={14} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete('poets', p.id)}><Trash2 size={14} /></Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.era}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
