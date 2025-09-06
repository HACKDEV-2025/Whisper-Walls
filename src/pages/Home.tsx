// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import Layout from '@/components/Layout';
// import { useAuth } from '@/contexts/AuthContext';
// import { 
//   MessageSquare, 
//   Shield, 
//   Globe, 
//   Zap, 
//   Users, 
//   TrendingUp, 
//   MessageCircle,
//   Eye,
//   ChevronRight
// } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import { supabase } from '@/integrations/supabase/client';

// export default function Home() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   // Fetch stats
//   const { data: stats } = useQuery({
//     queryKey: ['home-stats'],
//     queryFn: async () => {
//       const [whispers, users, comments] = await Promise.all([
//         supabase.from('whispers').select('id', { count: 'exact' }),
//         supabase.from('profiles').select('id', { count: 'exact' }),
//         supabase.from('comments').select('id', { count: 'exact' })
//       ]);

//       return {
//         totalWhispers: whispers.count || 0,
//         activeUsers: users.count || 0,
//         totalComments: comments.count || 0
//       };
//     }
//   });

//   return (
//     <Layout>
//       <div className="relative">
//         {/* Hero Section */}
//         <section className="relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
//           <div className="container mx-auto px-4 py-24 relative">
//             <div className="max-w-4xl mx-auto text-center">
//               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
//                 <Zap className="h-4 w-4 text-primary" />
//                 <span className="text-sm font-medium">Built for Anonymous Expression</span>
//               </div>
              
//               <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
//                 Whisper Walls
//               </h1>
              
//               <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
//                 Share your thoughts anonymously. Connect with others through authentic, 
//                 unfiltered conversations in a safe digital space.
//               </p>
              
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <Button
//                   size="lg"
//                   onClick={() => navigate('/wall')}
//                   className="gap-2"
//                 >
//                   <Eye className="h-5 w-5" />
//                   Browse Whispers
//                 </Button>
//                 {!user && (
//                   <Button
//                     size="lg"
//                     variant="outline"
//                     onClick={() => navigate('/auth')}
//                     className="gap-2"
//                   >
//                     Get Started
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
//                 )}
//                 {user && (
//                   <Button
//                     size="lg"
//                     variant="outline"
//                     onClick={() => navigate('/create')}
//                     className="gap-2"
//                   >
//                     Create Whisper
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
//                 )}
//               </div>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
//               <Card className="p-6 text-center glass-effect border-border/50">
//                 <div className="text-3xl font-bold text-primary mb-2">
//                   {stats?.totalWhispers.toLocaleString() || '0'}
//                 </div>
//                 <div className="text-sm text-muted-foreground">Anonymous Whispers</div>
//               </Card>
//               <Card className="p-6 text-center glass-effect border-border/50">
//                 <div className="text-3xl font-bold text-primary mb-2">
//                   {stats?.totalComments.toLocaleString() || '0'}
//                 </div>
//                 <div className="text-sm text-muted-foreground">Active Conversations</div>
//               </Card>
//               <Card className="p-6 text-center glass-effect border-border/50">
//                 <div className="text-3xl font-bold text-primary mb-2">24/7</div>
//                 <div className="text-sm text-muted-foreground">Community Online</div>
//               </Card>
//             </div>
//           </div>
//         </section>

//         {/* Features Section */}
//         <section className="py-24 bg-muted/30">
//           <div className="container mx-auto px-4">
//             <div className="text-center mb-12">
//               <h2 className="text-3xl font-bold mb-4">Why Choose Whisper Wall?</h2>
//               <p className="text-muted-foreground max-w-2xl mx-auto">
//                 Experience the freedom of anonymous expression with enterprise-grade 
//                 security and community-driven moderation.
//               </p>
//             </div>

//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
//               <Card className="p-6 hover:shadow-lg transition-shadow glass-effect border-border/50">
//                 <Shield className="h-10 w-10 text-primary mb-4" />
//                 <h3 className="text-xl font-semibold mb-2">Complete Anonymity</h3>
//                 <p className="text-muted-foreground">
//                   Your identity is protected. No registration required, no tracking, 
//                   pure anonymous expression.
//                 </p>
//               </Card>

//               <Card className="p-6 hover:shadow-lg transition-shadow glass-effect border-border/50">
//                 <Globe className="h-10 w-10 text-primary mb-4" />
//                 <h3 className="text-xl font-semibold mb-2">Global Community</h3>
//                 <p className="text-muted-foreground">
//                   Connect with voices from around the world. Share perspectives 
//                   across cultures and boundaries.
//                 </p>
//               </Card>

//               <Card className="p-6 hover:shadow-lg transition-shadow glass-effect border-border/50">
//                 <Zap className="h-10 w-10 text-primary mb-4" />
//                 <h3 className="text-xl font-semibold mb-2">Real-time Engagement</h3>
//                 <p className="text-muted-foreground">
//                   Live reactions, instant comments, and trending topics that 
//                   matter to the community.
//                 </p>
//               </Card>

//               <Card className="p-6 hover:shadow-lg transition-shadow glass-effect border-border/50">
//                 <Users className="h-10 w-10 text-primary mb-4" />
//                 <h3 className="text-xl font-semibold mb-2">Community Moderation</h3>
//                 <p className="text-muted-foreground">
//                   Self-regulating community with voting systems and collaborative 
//                   content curation.
//                 </p>
//               </Card>

//               <Card className="p-6 hover:shadow-lg transition-shadow glass-effect border-border/50">
//                 <TrendingUp className="h-10 w-10 text-primary mb-4" />
//                 <h3 className="text-xl font-semibold mb-2">Trending Insights</h3>
//                 <p className="text-muted-foreground">
//                   Discover what's capturing the community's attention with 
//                   advanced analytics and trends.
//                 </p>
//               </Card>

//               <Card className="p-6 hover:shadow-lg transition-shadow glass-effect border-border/50">
//                 <MessageCircle className="h-10 w-10 text-primary mb-4" />
//                 <h3 className="text-xl font-semibold mb-2">Rich Conversations</h3>
//                 <p className="text-muted-foreground">
//                   Threaded discussions, emoji reactions, and multimedia support 
//                   for expressive communication.
//                 </p>
//               </Card>
//             </div>
//           </div>
//         </section>

//         {/* CTA Section */}
//         <section className="py-24">
//           <div className="container mx-auto px-4 text-center">
//             <h2 className="text-3xl font-bold mb-4">Ready to Share Your Voice?</h2>
//             <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
//               Join thousands of others in authentic, anonymous conversations. 
//               Your thoughts matter, your identity stays private.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button
//                 size="lg"
//                 onClick={() => navigate('/wall')}
//                 className="gap-2"
//               >
//                 <MessageSquare className="h-5 w-5" />
//                 Start Browsing
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 onClick={() => navigate('/about')}
//               >
//                 Learn More
//               </Button>
//             </div>
//           </div>
//         </section>
//       </div>
//     </Layout>
//   );
// }





import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Shield, 
  Globe, 
  Zap, 
  Users, 
  TrendingUp, 
  MessageCircle,
  Eye,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const [whispers, users, comments] = await Promise.all([
        supabase.from('whispers').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('comments').select('id', { count: 'exact' })
      ]);

      return {
        totalWhispers: whispers.count || 0,
        activeUsers: users.count || 0,
        totalComments: comments.count || 0
      };
    }
  });

  return (
    <Layout>
      <div className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background animate-gradient" />
          <div className="container mx-auto px-4 py-24 relative">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 shadow-sm">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">Built for Anonymous Expression</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-text">
                Whisper Walls
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Share your thoughts anonymously. Connect with others through authentic, 
                unfiltered conversations in a safe digital space.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" onClick={() => navigate('/wall')} className="gap-2">
                    <Eye className="h-5 w-5" />
                    Browse Whispers
                  </Button>
                </motion.div>
                {!user && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/auth')}
                      className="gap-2"
                    >
                      Get Started
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
                {user && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/create')}
                      className="gap-2"
                    >
                      Create Whisper
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Card className="p-6 text-center glass-effect border-border/50 hover:shadow-xl transition-all">
                <div className="text-4xl font-bold text-primary mb-2 animate-pulse">
                  {stats?.totalWhispers.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Anonymous Whispers</div>
              </Card>
              <Card className="p-6 text-center glass-effect border-border/50 hover:shadow-xl transition-all">
                <div className="text-4xl font-bold text-primary mb-2 animate-pulse">
                  {stats?.totalComments.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Active Conversations</div>
              </Card>
              <Card className="p-6 text-center glass-effect border-border/50 hover:shadow-xl transition-all">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Community Online</div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Whisper Wall?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the freedom of anonymous expression with enterprise-grade 
                security and community-driven moderation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: Shield, title: "Complete Anonymity", text: "Your identity is protected. No registration required, no tracking, pure anonymous expression." },
                { icon: Globe, title: "Global Community", text: "Connect with voices from around the world. Share perspectives across cultures and boundaries." },
                { icon: Zap, title: "Real-time Engagement", text: "Live reactions, instant comments, and trending topics that matter to the community." },
                { icon: Users, title: "Community Moderation", text: "Self-regulating community with voting systems and collaborative content curation." },
                { icon: TrendingUp, title: "Trending Insights", text: "Discover what's capturing the community's attention with advanced analytics and trends." },
                { icon: MessageCircle, title: "Rich Conversations", text: "Threaded discussions, emoji reactions, and multimedia support for expressive communication." }
              ].map((feature, i) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 hover:shadow-xl hover:-translate-y-1 transition-all glass-effect border-border/50">
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.text}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-purple-200/10 to-transparent blur-3xl" />
          <div className="container mx-auto px-4 text-center relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Share Your Voice?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of others in authentic, anonymous conversations. 
                Your thoughts matter, your identity stays private.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/wall')} className="gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Start Browsing
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/about')}>
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
