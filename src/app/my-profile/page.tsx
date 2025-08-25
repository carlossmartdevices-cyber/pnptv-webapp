'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockPosts } from '@/lib/mock-data';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useEffect } from 'react';

export default function MyProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const userPosts = mockPosts.filter((post) => post.author.uid === user.uid);
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader className="relative h-48 bg-secondary p-6">
             <div className="absolute -bottom-16 left-6">
                <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={user.photoURL ?? ''} />
                    <AvatarFallback className="text-4xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
             </div>
          </CardHeader>
          <CardContent className="pt-20 px-6">
            <CardTitle className="text-3xl">{user.displayName}</CardTitle>
            <CardDescription className="text-base">{user.email}</CardDescription>
            {user.isPerformer && <Badge className="mt-2">{user.category}</Badge>}
            <p className="mt-4">{user.bio ?? 'No bio provided.'}</p>
          </CardContent>
        </Card>

        <h3 className="text-2xl font-bold mt-12 mb-6">My Posts</h3>
        <div className="space-y-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <Card key={post.id} className="w-full">
                <CardHeader>
                  <p className="text-sm text-muted-foreground">
                    Posted {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">You haven't posted anything yet.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
