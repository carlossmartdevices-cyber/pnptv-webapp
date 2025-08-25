'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { mockPosts } from '@/lib/mock-data';
import type { Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Send, Image as ImageIcon, Film, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function WhatsNew() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      if ((type === 'image' && !file.type.startsWith('image/')) || (type === 'video' && !file.type.startsWith('video/'))) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: `Please select a valid ${type} file.`,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setMediaDataUrl(loadEvent.target?.result as string);
        setMediaType(type);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearMedia = () => {
    setMediaDataUrl(null);
    setMediaType(null);
    if(imageInputRef.current) imageInputRef.current.value = '';
    if(videoInputRef.current) videoInputRef.current.value = '';
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !user) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: user,
      content: newPostContent,
      createdAt: new Date(),
      ...(mediaType === 'image' && { imageUrl: mediaDataUrl }),
      ...(mediaType === 'video' && { videoUrl: mediaDataUrl }),
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    clearMedia();
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
                    {mediaDataUrl && (
                      <div className="relative">
                        {mediaType === 'image' ? (
                           <Image src={mediaDataUrl} alt="Preview" width={500} height={300} className="rounded-md object-cover max-h-80 w-auto" />
                        ) : (
                           <video src={mediaDataUrl} controls className="rounded-md max-h-80 w-full" />
                        )}
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={clearMedia}>
                           <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
           <div className="flex gap-2">
               <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileSelect(e, 'image')} className="hidden" />
               <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileSelect(e, 'video')} className="hidden" />
               <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()}>
                   <ImageIcon />
               </Button>
               <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()}>
                   <Film />
               </Button>
           </div>

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
