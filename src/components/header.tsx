import Link from 'next/link';
import { PnpTvAppIcon } from '@/components/icons';
import { UserNav } from '@/components/user-nav';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <PnpTvAppIcon className="h-6 w-6" />
            <span className="font-bold">PNPtv App</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
