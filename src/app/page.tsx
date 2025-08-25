'use client';

import { useAuth } from '@/hooks/use-auth';
import AgeGate from '@/components/age-gate';
import { useAgeGate } from '@/hooks/use-age-gate';
import MainLayout from '@/components/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WhatsNew from '@/components/views/whats-new';
import LiveEvents from '@/components/views/live';
import Performers from '@/components/views/performers';
import { PnpTvSparkIcon } from '@/components/icons';

export default function Home() {
  const { user, loading } = useAuth();
  const { isVerified, verify } = useAgeGate();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <PnpTvSparkIcon className="h-16 w-16 animate-pulse" />
      </div>
    );
  }

  if (!user || !isVerified) {
    return <AgeGate onVerified={() => verify()} />;
  }

  return (
    <MainLayout>
      <div className="flex-1 p-4 md:p-8 pt-6">
        <Tabs defaultValue="whats-new" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-6 bg-secondary">
            <TabsTrigger value="whats-new">What's New</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="performers">Performers</TabsTrigger>
          </TabsList>
          <TabsContent value="whats-new">
            <WhatsNew />
          </TabsContent>
          <TabsContent value="live">
            <LiveEvents />
          </TabsContent>
          <TabsContent value="performers">
            <Performers />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
