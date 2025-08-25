'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockUsers } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Performers() {
  const performers = mockUsers.filter((user) => user.isPerformer);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Featured Performers</h2>
        <p className="text-muted-foreground">
          Discover the talented creators lighting up the community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {performers.map((performer) => (
          <Card key={performer.uid} className="flex flex-col">
            <CardHeader className="p-0">
                <div className="relative h-40 w-full">
                    <Image
                        src={performer.gallery?.[0] ?? 'https://placehold.co/600x400.png'}
                        alt={`${performer.displayName}'s gallery`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="musician portrait"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={performer.photoURL ?? 'https://placehold.co/100x100.png'}
                  alt={performer.displayName ?? ''}
                  width={64}
                  height={64}
                  className="rounded-full border-4 border-background"
                />
                <div>
                  <CardTitle className="text-xl">{performer.displayName}</CardTitle>
                  <Badge variant="outline">{performer.category}</Badge>
                </div>
              </div>
              <CardDescription className="line-clamp-3">{performer.bio}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/performers/${performer.slug}`}>
                  View Profile <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
