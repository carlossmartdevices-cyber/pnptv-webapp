'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from './types';
import { mockUsers } from './mock-data';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage to persist session
    try {
      const savedUser = localStorage.getItem('spark-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
      localStorage.removeItem('spark-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetUser = (user: User | null) => {
    setUser(user);
    if (user) {
      localStorage.setItem('spark-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('spark-user');
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    // Mock login: find user by email. In real app, this would be a Firebase call.
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      handleSetUser(foundUser);
    } else {
      // For demo, log in as first regular user if not found
      handleSetUser(mockUsers[2]);
    }
    setLoading(false);
  };

  const signup = async (email: string, pass: string, displayName: string) => {
    setLoading(true);
    // Mock signup: create a new user object
    const newUser: User = {
      uid: `new-user-${Date.now()}`,
      email,
      displayName,
      photoURL: `https://placehold.co/100x100.png?text=${displayName.charAt(0)}`,
      isAdmin: false,
      isPerformer: false,
    };
    mockUsers.push(newUser);
    handleSetUser(newUser);
    setLoading(false);
  };

  const logout = () => {
    handleSetUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    setUser: handleSetUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
