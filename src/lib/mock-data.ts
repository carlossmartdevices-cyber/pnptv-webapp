import type { User, Post, LiveEvent, Space, Comment } from './types';

export const mockUsers: User[] = [
  {
    uid: 'admin-user',
    email: 'admin@pnptv.app',
    displayName: 'Admin',
    photoURL: 'https://placehold.co/100x100/A020F0/FFFFFF.png',
    isAdmin: true,
    isPerformer: false,
    bio: 'Running the show.',
    slug: 'admin',
  },
  {
    uid: 'performer-user',
    email: 'performer@pnptv.app',
    displayName: 'Violet Verse',
    photoURL: 'https://placehold.co/100x100/9400D3/FFFFFF.png',
    isAdmin: false,
    isPerformer: true,
    category: 'Vocalist',
    bio: 'Singing my heart out in shades of purple. Catch my next live session!',
    gallery: [
      'https://placehold.co/600x400/9400D3/FFFFFF.png',
      'https://placehold.co/600x400/A020F0/FFFFFF.png',
      'https://placehold.co/600x400/282828/FFFFFF.png',
    ],
    slug: 'violet-verse',
  },
  {
    uid: 'regular-user-1',
    email: 'user1@pnptv.app',
    displayName: 'Cosmic Coder',
    photoURL: 'https://placehold.co/100x100/282828/FFFFFF.png',
    isAdmin: false,
    isPerformer: false,
    bio: 'Just here for the vibes and the code.',
    slug: 'cosmic-coder',
  },
  {
    uid: 'regular-user-2',
    displayName: 'Galaxy Gazer',
    email: 'user2@pnptv.app',
    photoURL: 'https://placehold.co/100x100.png',
    isAdmin: false,
    isPerformer: false,
    slug: 'galaxy-gazer',
  },
  {
    uid: 'regular-user-3',
    displayName: 'Neon Nomad',
    email: 'user3@pnptv.app',
    photoURL: 'https://placehold.co/100x100.png',
    isAdmin: false,
    isPerformer: false,
    slug: 'neon-nomad',
  }
];

const mockComments: Comment[] = [
    {
        id: 'comment-1',
        author: mockUsers[2],
        content: 'This looks amazing!',
        createdAt: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
        id: 'comment-2',
        author: mockUsers[3],
        content: 'Love this track!',
        createdAt: new Date(Date.now() - 1000 * 60 * 10)
    }
]

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    author: mockUsers[1],
    content: 'Excited to announce my new track "Electric Dreams" is dropping next week! 🚀 #newmusic',
    imageUrl: 'https://placehold.co/1200x600/9400D3/FFFFFF.png?text=Electric+Dreams',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    comments: mockComments,
  },
  {
    id: 'post-2',
    author: mockUsers[2],
    content: 'Just deployed a new feature on my side project. Feels good to ship! 🚢',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    comments: [],
  },
  {
    id: 'post-3',
    author: mockUsers[3],
    content: 'The stars look amazing tonight. ✨',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    comments: [],
  },
];

export const mockLiveEvents: LiveEvent[] = [
  {
    id: 'event-1',
    title: 'Violet Verse: Live Acoustic Session',
    description: 'Join Violet Verse for an intimate live acoustic set, premiering her new songs. Exclusively for PRIME members.',
    imageUrl: 'https://placehold.co/800x450/A020F0/FFFFFF.png?text=Live+Event',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // In 3 days
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 'event-2',
    title: 'Admin Q&A: The Future of the App',
    description: 'The PNPtv App admin team will be live to answer your questions about the platform and what\'s coming next.',
    imageUrl: 'https://placehold.co/800x450/9400D3/FFFFFF.png?text=Q%26A',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // In 1 week
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

export const mockSpaces: Space[] = [
    {
        id: 'space-1',
        name: 'General',
        description: 'A place for general chatter and community announcements.',
        channels: [
            {
                id: 'channel-1-1',
                name: 'general-chat',
                type: 'text',
                messages: [
                    { id: 'msg-1', author: mockUsers[2], content: 'Welcome everyone!', createdAt: new Date(Date.now() - 1000 * 60 * 60) },
                    { id: 'msg-2', author: mockUsers[3], content: 'Hey there! Glad to be here.', createdAt: new Date(Date.now() - 1000 * 60 * 55) },
                ]
            },
            {
                id: 'channel-1-2',
                name: 'lounge',
                type: 'voice',
                messages: []
            }
        ]
    },
    {
        id: 'space-2',
        name: 'Performers Corner',
        description: 'A space for performers to collaborate, share tips, and plan events.',
        channels: [
            {
                id: 'channel-2-1',
                name: 'performance-feedback',
                type: 'text',
                messages: [
                     { id: 'msg-3', author: mockUsers[1], content: 'Anyone have tips for stage fright?', createdAt: new Date(Date.now() - 1000 * 60 * 120) },
                ]
            },
            {
                id: 'channel-2-2',
                name: 'collaboration-station',
                type: 'voice',
                messages: []
            }
        ]
    },
     {
        id: 'space-3',
        name: 'Content Creation',
        description: 'Discuss gear, software, and techniques for creating amazing content.',
        channels: [
            {
                id: 'channel-3-1',
                name: 'video-editing',
                type: 'text',
                messages: []
            },
            {
                id: 'channel-3-2',
                name: 'audio-production',
                type: 'text',
                messages: []
            },
             {
                id: 'channel-3-3',
                name: 'live-jam',
                type: 'voice',
                messages: []
            }
        ]
    }
];
