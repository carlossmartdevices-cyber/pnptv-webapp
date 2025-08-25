'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { mockPosts, mockUsers } from '@/lib/mock-data';
import type { Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';

export default function WhatsNew() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPostContent, setNewPostContent] = useState('');

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !user) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: user,
      content: newPostContent,
      createdAt: new Date(),
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={user?.photoURL ?? ''} />
                    <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                     <Textarea
                        placeholder="What's on your mind?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
            <Send />
            <span>Post</span>
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="w-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
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
        ))}
      </div>
    </div>
  );
}
