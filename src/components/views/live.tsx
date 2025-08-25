'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockLiveEvents } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { LiveEvent } from '@/lib/types';


const eventFormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    imageUrl: z.string().url("Please enter a valid image URL"),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {message: "Invalid date format"}),
});


const CreateEventForm = ({onEventCreated}: {onEventCreated: (event: LiveEvent) => void}) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "https://placehold.co/800x450/282828/FFFFFF.png?text=New+Event",
            eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0]
        }
    });

    function onSubmit(values: z.infer<typeof eventFormSchema>) {
        const newEvent: LiveEvent = {
            id: `event-${Date.now()}`,
            ...values,
            eventDate: new Date(values.eventDate),
            createdAt: new Date(),
        };
        onEventCreated(newEvent);
        toast({ title: "Event Created!", description: "Your new live event has been posted." });
        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle /> Create Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Live Event</DialogTitle>
                    <DialogDescription>
                        Fill out the details for your new event announcement.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="eventDate" render={({ field }) => (
                            <FormItem><FormLabel>Event Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default function LiveEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState(mockLiveEvents);

  const handleEventCreated = (newEvent: LiveEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Live Events</h2>
        <p className="text-muted-foreground">Announcements for Q&As, premieres, and more.</p>
        {user?.isAdmin && (
            <div className="mt-4">
               <CreateEventForm onEventCreated={handleEventCreated} />
            </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader className="p-0">
              <div className="relative h-56 w-full">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="event poster"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Badge variant="secondary" className="mb-2">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(event.eventDate, 'PPP')}
              </Badge>
              <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
