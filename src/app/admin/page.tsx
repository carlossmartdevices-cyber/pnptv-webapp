'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { Crown } from 'lucide-react';

export default function AdminPage() {
  const { user: authUser, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !authUser?.isAdmin) {
      router.push('/');
    }
  }, [authUser, loading, router]);

  const togglePerformerRole = (uid: string) => {
    // In a real app, this would be a Genkit flow `setPerformerRole`
    setUsers(users.map(u => 
        u.uid === uid ? { ...u, isPerformer: !u.isPerformer } : u
    ));
    const targetUser = users.find(u => u.uid === uid);
    toast({
        title: "Role Updated",
        description: `${targetUser?.displayName} is ${!targetUser?.isPerformer ? "now a performer" : "no longer a performer"}.`
    });
  };

  if (loading || !authUser?.isAdmin) {
    return <div className="flex h-screen items-center justify-center">Access Denied.</div>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-12">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users and application settings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Promote or demote users to the performer role.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.isPerformer ? 'Performer' : 'User'}</TableCell>
                    <TableCell className="text-right">
                        {!user.isAdmin && (
                            <Button 
                                variant={user.isPerformer ? 'destructive' : 'default'} 
                                size="sm" 
                                onClick={() => togglePerformerRole(user.uid)}
                            >
                                <Crown className="mr-2 h-4 w-4" />
                                {user.isPerformer ? 'Demote' : 'Promote'}
                            </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
