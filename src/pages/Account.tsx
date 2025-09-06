import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { User, Search, Trash2, Clock, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SearchHistoryItem {
  id: string;
  search_term: string;
  category: string | null;
  created_at: string;
}

interface Profile {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  // Fetch search history
  const { data: searchHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['searchHistory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as SearchHistoryItem[];
    },
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (newName: string) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: newName })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  // Delete search history item
  const deleteSearchItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
      toast({
        title: "Deleted",
        description: "Search item removed from history.",
      });
    },
  });

  // Clear all search history
  const clearAllHistory = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
      toast({
        title: "Cleared",
        description: "All search history has been cleared.",
      });
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate('/');
  };

  const handleSaveName = () => {
    updateProfile.mutate(fullName);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        className="max-w-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveName}>
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setFullName(profile?.full_name || '');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-lg">
                        {profile?.full_name || 'No name set'}
                      </h3>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="mt-1"
                      >
                        Edit name
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="text-muted-foreground">{profile?.email}</div>
              </div>

              <div className="space-y-2">
                <Label>Member since</Label>
                <div className="text-muted-foreground">
                  {profile?.created_at && format(new Date(profile.created_at), 'MMMM d, yyyy')}
                </div>
              </div>

              <Button 
                onClick={handleSignOut}
                variant="destructive"
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Search History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search History</CardTitle>
                  <CardDescription>Your recent searches</CardDescription>
                </div>
                {searchHistory && searchHistory.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearAllHistory.mutate()}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading search history...
                </div>
              ) : searchHistory && searchHistory.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.search_term}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {item.category && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <Badge variant="secondary" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(item.created_at), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSearchItem.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No search history yet</p>
                  <p className="text-sm mt-1">Your searches will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}