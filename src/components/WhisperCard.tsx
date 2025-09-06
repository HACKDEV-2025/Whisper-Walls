import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Heart, MessageCircle, Clock, Hash, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WhisperCardProps {
  whisper: {
    id: string;
    content: string;
    category: string;
    is_anonymous: boolean;
    user_id: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    user_has_liked?: boolean;
  };
}

export default function WhisperCard({ whisper }: WhisperCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(whisper.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(whisper.likes_count);

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error('Please sign in to like whispers');
        navigate('/auth');
        return;
      }

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('whisper_likes')
          .delete()
          .eq('whisper_id', whisper.id)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update likes count
        await supabase
          .from('whispers')
          .update({ likes_count: Math.max(0, likesCount - 1) })
          .eq('id', whisper.id);

        return false;
      } else {
        // Like
        const { error } = await supabase
          .from('whisper_likes')
          .insert({ whisper_id: whisper.id, user_id: user.id });

        if (error) throw error;

        // Update likes count
        await supabase
          .from('whispers')
          .update({ likes_count: likesCount + 1 })
          .eq('id', whisper.id);

        return true;
      }
    },
    onSuccess: (liked) => {
      setIsLiked(liked ?? false);
      setLikesCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
      queryClient.invalidateQueries({ queryKey: ['whispers'] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const categoryColors: Record<string, string> = {
    general: 'bg-blue-500/10 text-blue-500',
    confession: 'bg-purple-500/10 text-purple-500',
    advice: 'bg-green-500/10 text-green-500',
    question: 'bg-yellow-500/10 text-yellow-500',
    thought: 'bg-pink-500/10 text-pink-500',
    story: 'bg-orange-500/10 text-orange-500'
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer glass-effect border-border/50"
      onClick={() => navigate(`/whisper/${whisper.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge 
            variant="secondary" 
            className={categoryColors[whisper.category] || 'bg-gray-500/10 text-gray-500'}
          >
            <Hash className="h-3 w-3 mr-1" />
            {whisper.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(whisper.created_at), { addSuffix: true })}
          </div>
        </div>

        <p className="text-foreground line-clamp-4 mb-4">
          {whisper.content}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{whisper.is_anonymous ? 'Anonymous' : 'User'}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          {likesCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/whisper/${whisper.id}`);
          }}
        >
          <MessageCircle className="h-4 w-4" />
          {whisper.comments_count}
        </Button>
      </CardFooter>
    </Card>
  );
}