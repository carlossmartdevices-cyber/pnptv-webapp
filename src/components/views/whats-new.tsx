'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { mockPosts } from '@/lib/mock-data';
import type { Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Send, Link as LinkIcon, Film, Image as ImageIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WhatsNew() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);


  const handleCreatePost = () => {
    if (!newPostContent.trim() || !user) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: user,
      content: newPostContent,
      createdAt: new Date(),
      ...(mediaType === 'image' && { imageUrl: mediaUrl }),
      ...(mediaType === 'video' && { videoUrl: mediaUrl }),
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setMediaUrl('');
    setMediaType(null);
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
                <div className="w-full space-y-2">
                     <Textarea
                        placeholder="What's on your mind?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="w-full"
                    />
                    {mediaType && (
                        <div className="flex gap-2 items-center">
                            {mediaType === 'image' ? <ImageIcon className="text-muted-foreground"/> : <Film className="text-muted-foreground"/>}
                            <Input 
                                placeholder={mediaType === 'image' ? "Image URL..." : "Video URL..."}
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LinkIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setMediaType('image')}>
                  <ImageIcon className="mr-2" /> Add Image
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setMediaType('video')}>
                  <Film className="mr-2" /> Add Video
                </DropdownMenuItem>
                 {mediaType && <DropdownMenuItem onSelect={() => {setMediaType(null); setMediaUrl('')}}>Remove Media</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>

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
              {post.imageUrl && (
                <div className="mt-4 relative aspect-video rounded-lg overflow-hidden">
                    <Image src={post.imageUrl} alt="Post image" layout="fill" objectFit="cover" data-ai-hint="social media image" />
                </div>
              )}
              {post.videoUrl && (
                 <div className="mt-4 relative aspect-video rounded-lg overflow-hidden">
                    <video src={post.videoUrl} controls className="w-full h-full" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
