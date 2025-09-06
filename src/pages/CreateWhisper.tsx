import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Send, Eye, EyeOff } from 'lucide-react';

export default function CreateWhisper() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to create a whisper');
      navigate('/auth');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write something');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('whispers').insert({
        content: content.trim(),
        category,
        is_anonymous: isAnonymous,
        user_id: user.id
      });

      if (error) throw error;

      toast.success('Your whisper has been shared!');
      navigate('/wall');
    } catch (error) {
      console.error('Error creating whisper:', error);
      toast.error('Failed to create whisper');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'confession', label: 'Confession' },
    { value: 'advice', label: 'Advice Needed' },
    { value: 'question', label: 'Question' },
    { value: 'thought', label: 'Random Thought' },
    { value: 'story', label: 'Story' }
  ];

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
              <p className="text-muted-foreground mb-6">
                You need to be signed in to create a whisper
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto glass-effect">
          <CardHeader>
            <CardTitle>Create a Whisper</CardTitle>
            <CardDescription>
              Share your thoughts with the community anonymously
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">What's on your mind?</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, ask a question, tell a story..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length}/1000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
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
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {isAnonymous ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="anonymous" className="cursor-pointer">
                      Post Anonymously
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isAnonymous 
                        ? 'Your identity will be hidden' 
                        : 'Your profile will be visible'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/wall')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="flex-1 gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Sharing...' : 'Share Whisper'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}