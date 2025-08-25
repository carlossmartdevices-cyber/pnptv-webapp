'use client';

import { mockSpaces } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hash, Mic } from 'lucide-react';
import Link from 'next/link';

export default function Spaces() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="text-center">
        <h2 className="text-3xl font-bold">Spaces</h2>
        <p className="text-muted-foreground">Join the conversation in our community channels.</p>
      </div>

      <div className="space-y-8">
        {mockSpaces.map((space) => (
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
