import type { ReactNode } from 'react';
import Header from '@/components/header';
import CommunityCrystal from '@/components/community-crystal';
import SupportChatbot from '@/components/support-chatbot';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <CommunityCrystal />
      <SupportChatbot />
    </div>
  );
}
