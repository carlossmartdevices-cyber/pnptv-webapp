export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  isPerformer?: boolean;
  category?: string;
  bio?: string;
  gallery?: string[];
  slug?: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventDate: Date;
  createdAt: Date;
}
