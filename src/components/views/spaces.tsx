'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { mockSpaces } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hash, Mic, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Space } from '@/lib/types';


const spaceFormSchema = z.object({
  name: z.string().min(3, "Space name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const CreateSpaceForm = ({onSpaceCreated}: {onSpaceCreated: (space: Space) => void}) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof spaceFormSchema>>({
        resolver: zodResolver(spaceFormSchema),
        defaultValues: {
            name: "",
            description: "",
        }
    });

    function onSubmit(values: z.infer<typeof spaceFormSchema>) {
        const newSpace: Space = {
            id: `space-${Date.now()}`,
            ...values,
            channels: [
                {id: `chan-${Date.now()}-1`, name: 'general', type: 'text', messages: []},
                {id: `chan-${Date.now()}-2`, name: 'lounge', type: 'voice', messages: []},
            ],
        };
        onSpaceCreated(newSpace);
        toast({ title: "Space Created!", description: "Your new space is now live." });
        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle /> Create Space
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Space</DialogTitle>
                    <DialogDescription>
                       Spaces are collections of text and voice channels for your community.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Space Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit">Create Space</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default function Spaces() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState(mockSpaces);

  const handleSpaceCreated = (newSpace: Space) => {
    setSpaces(prev => [...prev, newSpace]);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="text-center">
        <h2 className="text-3xl font-bold">Spaces</h2>
        <p className="text-muted-foreground">Join the conversation in our community channels.</p>
         {user?.isAdmin && (
            <div className="mt-4">
               <CreateSpaceForm onSpaceCreated={handleSpaceCreated} />
            </div>
        )}
      </div>

      <div className="space-y-8">
        {spaces.map((space) => (
          <Card key={space.id}>
            <CardHeader>
              <CardTitle>{space.name}</CardTitle>
              <CardDescription>{space.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {space.channels.map((channel) => (
                  <Button asChild variant="ghost" className="w-full justify-start" key={channel.id}>
                    <Link href={`/spaces/${channel.id}`}>
                      {channel.type === 'text' ? <Hash /> : <Mic />}
                      <span>{channel.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
