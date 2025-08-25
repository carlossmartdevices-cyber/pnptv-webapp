'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockPosts, mockUsers } from '@/lib/mock-data';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

export default function PerformerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { slug } = params;
  const [performer, setPerformer] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/');
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    const foundPerformer = mockUsers.find((u) => u.slug === slug && u.isPerformer);
    setPerformer(foundPerformer);
  }, [slug]);

  if (authLoading || performer === undefined) {
    return <div className="flex h-screen items-center justify-center">Loading performer...</div>;
  }
  
  if (performer === null) {
     return <div className="flex h-screen items-center justify-center">Performer not found.</div>;
  }

  const performerPosts = mockPosts.filter((post) => post.author.uid === performer.uid);
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'P';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl py-12">
        <Card>
          <CardHeader className="relative h-64 bg-secondary p-6">
             <Image src={performer.gallery?.[0] ?? 'https://placehold.co/1200x400'} alt="Performer banner" layout="fill" objectFit='cover' className="opacity-50" />
             <div className="absolute -bottom-16 left-6 z-10">
                <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={performer.photoURL ?? ''} />
                    <AvatarFallback className="text-4xl">{getInitials(performer.displayName)}</AvatarFallback>
                </Avatar>
             </div>
          </CardHeader>
          <CardContent className="pt-20 px-6">
            <CardTitle className="text-4xl">{performer.displayName}</CardTitle>
            <Badge className="mt-2 text-md">{performer.category}</Badge>
            <p className="mt-4 text-lg">{performer.bio ?? 'No bio provided.'}</p>
          </CardContent>
        </Card>

        <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(performer.gallery ?? []).map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                        <Image src={img} alt={`Gallery image ${index + 1}`} layout="fill" objectFit="cover" />
                    </div>
                ))}
            </div>
        </div>

        <h3 className="text-2xl font-bold mt-12 mb-6">{performer.displayName}'s Posts</h3>
        <div className="space-y-4">
          {performerPosts.length > 0 ? (
            performerPosts.map((post) => (
              <Card key={post.id} className="w-full">
                 <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.photoURL ?? ''} alt={post.author.displayName ?? ''} />
                      <AvatarFallback>{getInitials(post.author.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.author.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">{performer.displayName} hasn't posted anything yet.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
