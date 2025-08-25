'use client';

import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/main-layout';
import { Input } from '@/components/ui/input';
import { mockUsers } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  
  if (!loading && !user) {
    router.push('/');
    return null;
  }
  
  const filteredUsers = mockUsers.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl py-12">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Our Community</h1>
            <p className="text-muted-foreground">Browse and connect with all members of PNPtv Spark.</p>
        </div>
        
        <div className="mb-8 max-w-lg mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by name..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(member => (
            <Card key={member.uid}>
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/50">
                    <AvatarImage src={member.photoURL ?? ''} />
                    <AvatarFallback className="text-3xl">{getInitials(member.displayName)}</AvatarFallback>
                </Avatar>
                <CardTitle>{member.displayName}</CardTitle>
                <CardDescription>
                  {member.isPerformer ? <Badge className="mt-1">{member.category}</Badge> : 'Community Member'}
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-4 line-clamp-2 h-10">
                  {member.bio ?? 'A vibrant member of the Spark community.'}
                </p>
              </CardContent>
              <CardContent className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/profile/${member.uid}`}>
                    View Profile <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
