'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import Link from 'next/link';
import { mockUsers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';


export default function CommunityCrystal() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const controls = useDragControls();
  const crystalRef = useRef<HTMLDivElement>(null);
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    const savedPosition = localStorage.getItem('crystal-position');
    if (savedPosition) {
        try {
            const pos = JSON.parse(savedPosition);
            // boundary checks
            const x = Math.min(window.innerWidth - 80, Math.max(20, pos.x));
            const y = Math.min(window.innerHeight - 80, Math.max(20, pos.y));
            setPosition({x, y});
        } catch(e) {
            // ignore
        }
    } else {
        setPosition({x: window.innerWidth - 100, y: window.innerHeight - 100});
    }

  }, []);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

  const nearbyUsers = mockUsers.slice(0, 12);

  if (!isClient) return null;

  return (
    <>
      <motion.div
        ref={crystalRef}
        drag
        dragListener={false}
        onPointerDown={(e) => controls.start(e)}
        dragMomentum={false}
        className="fixed z-50 cursor-grab active:cursor-grabbing"
        style={{
          width: '64px',
          height: '64px',
          clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
        }}
        initial={{ x: position.x, y: position.y, scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onDragEnd={() => {
            if(crystalRef.current) {
                const rect = crystalRef.current.getBoundingClientRect();
                const newPos = {x: rect.left, y: rect.top};
                setPosition(newPos);
                localStorage.setItem('crystal-position', JSON.stringify(newPos));
            }
        }}
        
      >
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full h-full bg-gradient-to-br from-primary to-accent transition-all duration-300 hover:brightness-125 focus:outline-none focus:ring-4 focus:ring-ring",
            "flex items-center justify-center text-primary-foreground animate-[shimmer_5s_ease-in-out_infinite]"
          )}
          style={{
            backgroundSize: '200% 200%',
          }}
        >
          <Users className="h-6 w-6" />
        </button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Community Crystal</DialogTitle>
            <DialogDescription>
              Discover recently active users in the community.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {nearbyUsers.map((user) => (
              <div key={user.uid} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={user.photoURL ?? ''} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.bio ?? 'A member of the community.'}</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/profile/${user.uid}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}
