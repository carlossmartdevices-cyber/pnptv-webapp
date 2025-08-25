'use client';

import Link from 'next/link';
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Mail,
  ShieldCheck,
  Star,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers } from '@/lib/mock-data';

export function UserNav() {
  const { user, logout, setUser } = useAuth();

  if (!user) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/my-profile">
              <UserIcon />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <Link href="/community">
              <Users />
              <span>Community</span>
            </Link>
          </DropdownMenuItem>
          {user.isPerformer && (
             <DropdownMenuItem asChild>
               <Link href="/performer-panel">
                 <Star />
                 <span>Performer Panel</span>
               </Link>
             </DropdownMenuItem>
          )}
           {user.isAdmin && (
             <DropdownMenuItem asChild>
               <Link href="/admin">
                 <ShieldCheck />
                 <span>Admin Panel</span>
               </Link>
             </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Switch Account</DropdownMenuLabel>
           {mockUsers.map(mockUser => (
              <DropdownMenuItem key={mockUser.uid} onSelect={() => setUser(mockUser)}>
                {mockUser.displayName}
                {mockUser.uid === user.uid && <Star className="ml-auto fill-primary text-primary" />}
              </DropdownMenuItem>
           ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            <Link href="/contact">
              <Mail />
              <span>Contact</span>
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={logout}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
