import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Heart, 
  MessageCircle, 
  Clock, 
  Hash, 
  User, 
  Send,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  is_anonymous: boolean;
  user_id: string;
  created_at: string;
  likes_count: number;
  user_has_liked?: boolean;
}

export default function WhisperDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch whisper details
  const { data: whisper, isLoading: whisperLoading } = useQuery({
    queryKey: ['whisper', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whispers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user has liked the whisper
      if (user) {
        const { data: like } = await supabase
          .from('whisper_likes')
          .select('id')
          .eq('whisper_id', id!)
          .eq('user_id', user.id)
          .single();

        return { ...data, user_has_liked: !!like };
      }

      return { ...data, user_has_liked: false };
    }
  });

  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('whisper_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user has liked each comment
      if (user && data) {
        const commentIds = data.map(c => c.id);
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const likedCommentIds = new Set(likes?.map(l => l.comment_id) || []);
        return data.map(c => ({
          ...c,
          user_has_liked: likedCommentIds.has(c.id)
        }));
      }

      return data;
    }
  });

  // Like whisper mutation
  const likeWhisperMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error('Please sign in to like whispers');
        navigate('/auth');
        return;
      }

      if (whisper?.user_has_liked) {
        // Unlike
        await supabase
          .from('whisper_likes')
          .delete()
          .eq('whisper_id', id!)
          .eq('user_id', user.id);

        await supabase
          .from('whispers')
          .update({ likes_count: Math.max(0, whisper.likes_count - 1) })
          .eq('id', id!);
      } else {
        // Like
        await supabase
          .from('whisper_likes')
          .insert({ whisper_id: id!, user_id: user.id });

        await supabase
          .from('whispers')
          .update({ likes_count: (whisper?.likes_count || 0) + 1 })
          .eq('id', id!);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whisper', id] });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error('Please sign in to comment');
        navigate('/auth');
        return;
      }

      const { error } = await supabase.from('comments').insert({
        content: commentContent.trim(),
        whisper_id: id!,
        user_id: user.id,
        is_anonymous: true
      });

      if (error) throw error;

      // Update comments count
      await supabase
        .from('whispers')
        .update({ comments_count: (whisper?.comments_count || 0) + 1 })
        .eq('id', id!);
    },
    onSuccess: () => {
      setCommentContent('');
      toast.success('Comment added!');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['whisper', id] });
    },
    onError: () => {
      toast.error('Failed to add comment');
    }
  });

  // Delete whisper mutation
  const deleteWhisperMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('whispers')
        .delete()
        .eq('id', id!)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Whisper deleted');
      navigate('/wall');
    },
    onError: () => {
      toast.error('Failed to delete whisper');
    }
  });

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setIsSubmitting(true);
    await addCommentMutation.mutateAsync();
    setIsSubmitting(false);
  };

  const categoryColors: Record<string, string> = {
    general: 'bg-blue-500/10 text-blue-500',
    confession: 'bg-purple-500/10 text-purple-500',
    advice: 'bg-green-500/10 text-green-500',
    question: 'bg-yellow-500/10 text-yellow-500',
    thought: 'bg-pink-500/10 text-pink-500',
    story: 'bg-orange-500/10 text-orange-500'
  };

  if (whisperLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (!whisper) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Whisper not found</h2>
              <Button onClick={() => navigate('/wall')}>
                Back to Wall
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/wall')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Wall
        </Button>

        {/* Whisper Card */}
        <Card className="mb-6 glass-effect">
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge 
                variant="secondary" 
                className={categoryColors[whisper.category] || 'bg-gray-500/10 text-gray-500'}
              >
                <Hash className="h-3 w-3 mr-1" />
                {whisper.category}
              </Badge>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(whisper.created_at), { addSuffix: true })}
                </div>
                {user && user.id === whisper.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteWhisperMutation.mutate()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4 whitespace-pre-wrap">{whisper.content}</p>
            
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${whisper.user_has_liked ? 'text-red-500' : ''}`}
                onClick={() => likeWhisperMutation.mutate()}
              >
                <Heart className={`h-4 w-4 ${whisper.user_has_liked ? 'fill-current' : ''}`} />
                {whisper.likes_count}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                {whisper.comments_count} comments
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                <User className="h-4 w-4" />
                {whisper.is_anonymous ? 'Anonymous' : 'User'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comment Form */}
        {user && (
          <Card className="mb-6 glass-effect">
            <CardContent className="p-6">
              <form onSubmit={handleComment} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !commentContent.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Comments</h3>
          {commentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment.id} className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {comment.is_anonymous ? 'Anonymous' : 'User'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="glass-effect">
              <CardContent className="p-8 text-center text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}