'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MainLayout from '@/components/main-layout';
import { mockSpaces, mockUsers } from '@/lib/mock-data';
import type { Channel, Message } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Hash, Mic, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { id } = params;
  
  const [channel, setChannel] = useState<Channel | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const findChannel = () => {
      for (const space of mockSpaces) {
        const found = space.channels.find(c => c.id === id);
        if (found) {
          setChannel(found);
          setMessages(found.messages);
          return;
        }
      }
      setChannel(null);
    }
    findChannel();
  }, [id]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

  const handleSendMessage = () => {
    if(!newMessage.trim() || !user) return;

    const message: Message = {
        id: `msg-${Date.now()}`,
        author: user,
        content: newMessage,
        createdAt: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  if (authLoading || channel === undefined) {
    return <div className="flex h-screen items-center justify-center">Loading channel...</div>;
  }
  
  if (channel === null) {
     return <div className="flex h-screen items-center justify-center">Channel not found.</div>;
  }

  const renderTextChannel = () => (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-3">
                    <Avatar>
                        <AvatarImage src={msg.author.photoURL ?? ''} />
                        <AvatarFallback>{getInitials(msg.author.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-baseline gap-2">
                             <p className="font-semibold">{msg.author.displayName}</p>
                             <p className="text-xs text-muted-foreground">{format(msg.createdAt, 'p')}</p>
                        </div>
                        <p className="text-foreground">{msg.content}</p>
                    </div>
                </div>
            ))}
        </div>
        <div className="p-4 border-t">
            <div className="flex items-center gap-2">
                <Input 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={`Message #${channel.name}`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                    }}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send />
                </Button>
            </div>
        </div>
    </div>
  );

  const renderVoiceChannel = () => (
      <Card className="m-4">
        <CardHeader>
            <CardTitle>Voice Channel</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            <Mic className="h-16 w-16 mx-auto text-primary" />
            <p className="mt-4 text-lg">You have joined the voice channel <span className="font-bold">{channel.name}</span>.</p>
            <p className="text-muted-foreground">Voice functionality is not implemented in this prototype.</p>
            <Button className="mt-6">Leave Channel</Button>
        </CardContent>
      </Card>
  );

  return (
    <MainLayout>
        <div className="container mx-auto max-w-5xl py-4">
            <div className="flex items-center gap-4 mb-4">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/"><ArrowLeft /></Link>
                </Button>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    {channel.type === 'text' ? <Hash /> : <Mic />}
                    {channel.name}
                </h2>
            </div>
            {channel.type === 'text' ? renderTextChannel() : renderVoiceChannel()}
        </div>
    </MainLayout>
  );
}
