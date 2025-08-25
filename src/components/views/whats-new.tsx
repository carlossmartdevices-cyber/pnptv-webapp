'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import type { Post, Comment } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Send, Image as ImageIcon, Film, X, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';


const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;

const CommentSection = ({ post, onCommentAdded }: { post: Post; onCommentAdded: (postId: string, newComment: Comment) => void; }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  
  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: user,
      content: newComment,
      createdAt: new Date(),
    };
    onCommentAdded(post.id, comment);
    setNewComment('');
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
    <div className="pt-4 space-y-4">
      <Separator />
       {post.comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.photoURL ?? ''} />
            <AvatarFallback>{getInitials(comment.author.displayName)}</AvatarFallback>
          </Avatar>
          <div className="bg-secondary rounded-lg p-2 text-sm w-full">
            <div className="flex items-baseline gap-2">
              <p className="font-semibold text-xs">{comment.author.displayName}</p>
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
            </div>
            <p>{comment.content}</p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2">
        <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL ?? ''} />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
        </Avatar>
        <Input
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
          className="h-9"
        />
        <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
          <Send />
        </Button>
      </div>
    </div>
  )
}

export default function WhatsNew() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate(),
            comments: (data.comments || []).map((c: any) => ({...c, createdAt: c.createdAt?.toDate()}))
        } as Post);
      });
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      const fileSizeMB = file.size / 1024 / 1024;
      if (type === 'image') {
        if (!file.type.startsWith('image/')) {
            toast({ variant: "destructive", title: "Invalid File Type", description: "Please select an image file." });
            return;
        }
        if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
            toast({ variant: "destructive", title: "Image Too Large", description: `Please select an image smaller than ${MAX_IMAGE_SIZE_MB}MB.` });
            return;
        }
      } else if (type === 'video') {
         if (!file.type.startsWith('video/')) {
            toast({ variant: "destructive", title: "Invalid File Type", description: "Please select a video file." });
            return;
        }
        if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
            toast({ variant: "destructive", title: "Video Too Large", description: `Please select a video smaller than ${MAX_VIDEO_SIZE_MB}MB.` });
            return;
        }
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

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;
    setIsUploading(true);

    let mediaUrl = '';
    if (mediaDataUrl && mediaType) {
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}`);
        const uploadResult = await uploadString(storageRef, mediaDataUrl, 'data_url');
        mediaUrl = await getDownloadURL(uploadResult.ref);
    }

    const newPost = {
      author: {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      content: newPostContent,
      createdAt: serverTimestamp(),
      comments: [],
      ...(mediaType === 'image' && { imageUrl: mediaUrl }),
      ...(mediaType === 'video' && { videoUrl: mediaUrl }),
    };

    await addDoc(collection(db, 'posts'), newPost);
    
    setNewPostContent('');
    clearMedia();
    setIsUploading(false);
    toast({ title: "Post created!" });
  };
  
  const handleCommentAdded = async (postId: string, newComment: Comment) => {
    if(!user) return;
    const postRef = doc(db, "posts", postId);
    const commentToAdd = {
        id: `comment-${Date.now()}`,
        author: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL
        },
        content: newComment.content,
        createdAt: serverTimestamp()
    };
    await updateDoc(postRef, {
        comments: arrayUnion(commentToAdd)
    });
  }

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
                        disabled={isUploading}
                    />
                    {mediaDataUrl && (
                      <div className="relative">
                        {mediaType === 'image' ? (
                           <Image src={mediaDataUrl} alt="Preview" width={500} height={300} className="rounded-md object-cover max-h-80 w-auto" />
                        ) : (
                           <video src={mediaDataUrl} controls className="rounded-md max-h-80 w-full" />
                        )}
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={clearMedia} disabled={isUploading}>
                           <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
           <div className="flex gap-2">
               <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileSelect(e, 'image')} className="hidden" disabled={isUploading} />
               <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileSelect(e, 'video')} className="hidden" disabled={isUploading} />
               <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} disabled={isUploading}>
                   <ImageIcon />
               </Button>
               <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()} disabled={isUploading}>
                   <Film />
               </Button>
           </div>

          <Button onClick={handleCreatePost} disabled={!newPostContent.trim() || isUploading}>
            {isUploading ? 'Posting...' : 'Post'}
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
                    {post.createdAt ? formatDistanceToNow(post.createdAt, { addSuffix: true }) : 'just now'}
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
               {(post.imageUrl || post.videoUrl) && (
                <CommentSection post={post} onCommentAdded={handleCommentAdded} />
              )}
            </CardContent>
             {!post.imageUrl && !post.videoUrl && (
                <CardFooter className="flex flex-col items-start">
                  <CommentSection post={post} onCommentAdded={handleCommentAdded} />
                </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
