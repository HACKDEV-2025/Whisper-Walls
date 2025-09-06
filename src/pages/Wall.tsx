import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import WhisperCard from '@/components/WhisperCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Whisper {
  id: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  user_has_liked?: boolean;
}

export default function Wall() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [hasSearched, setHasSearched] = useState(false);

  // Save search to history
  useEffect(() => {
    const saveSearch = async () => {
      if (!user || !searchTerm.trim() || !hasSearched) return;
      
      try {
        await supabase
          .from('search_history')
          .insert({
            user_id: user.id,
            search_term: searchTerm.trim(),
            category: category !== 'all' ? category : null,
          });
        setHasSearched(false);
      } catch (error) {
        console.error('Failed to save search:', error);
      }
    };

    const debounce = setTimeout(() => {
      if (hasSearched) {
        saveSearch();
      }
    }, 1000);

    return () => clearTimeout(debounce);
  }, [searchTerm, category, user, hasSearched]);

  // Fetch whispers
  const { data: whispers, isLoading } = useQuery({
    queryKey: ['whispers', category, sortBy, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('whispers')
        .select('*');

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchTerm) {
        query = query.ilike('content', `%${searchTerm}%`);
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'popular') {
        query = query.order('likes_count', { ascending: false });
      } else if (sortBy === 'discussed') {
        query = query.order('comments_count', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Check if user has liked each whisper
      if (user && data) {
        const whisperIds = data.map(w => w.id);
        const { data: likes } = await supabase
          .from('whisper_likes')
          .select('whisper_id')
          .eq('user_id', user.id)
          .in('whisper_id', whisperIds);

        const likedWhisperIds = new Set(likes?.map(l => l.whisper_id) || []);
        return data.map(w => ({
          ...w,
          user_has_liked: likedWhisperIds.has(w.id)
        }));
      }

      return data;
    }
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'confession', label: 'Confessions' },
    { value: 'advice', label: 'Advice' },
    { value: 'question', label: 'Questions' },
    { value: 'thought', label: 'Thoughts' },
    { value: 'story', label: 'Stories' }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Whisper Wall</h1>
            <p className="text-muted-foreground">
              Browse anonymous thoughts from the community
            </p>
          </div>
          {user && (
            <Button onClick={() => navigate('/create')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Whisper
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search whispers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim()) {
                  setHasSearched(true);
                }
              }}
              className="pl-10"
            />
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="discussed">Most Discussed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Whispers Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : whispers && whispers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {whispers.map((whisper) => (
              <WhisperCard key={whisper.id} whisper={whisper} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No whispers found</p>
            {user && (
              <Button onClick={() => navigate('/create')}>
                Be the first to whisper
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}