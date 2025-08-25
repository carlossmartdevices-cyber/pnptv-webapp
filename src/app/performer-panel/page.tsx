'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, Film, Mic, User } from 'lucide-react';

export default function PerformerPanelPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user?.isPerformer) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user?.isPerformer) {
    return <div className="flex h-screen items-center justify-center">Access Denied.</div>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl py-12">
         <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Performer Panel</h1>
            <p className="text-muted-foreground">Manage your content and connect with your audience.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Management</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Edit Your Profile</div>
                    <p className="text-xs text-muted-foreground">Update your bio, category, and gallery.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Content Upload</CardTitle>
                    <FilePlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Add New Content</div>
                    <p className="text-xs text-muted-foreground">Upload new photos and videos. (Mocked)</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Go Live</CardTitle>
                    <Mic className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Start a Live Stream</div>
                    <p className="text-xs text-muted-foreground">Engage with your fans in real-time. (Mocked)</p>
                </CardContent>
            </Card>
        </div>
        <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Content Overview (Mock Data)</CardTitle>
                    <CardDescription>A list of your uploaded content would appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No content uploaded yet.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
