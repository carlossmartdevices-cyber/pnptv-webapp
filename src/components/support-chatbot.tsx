'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { askCristina } from '@/ai/flows/support-chat';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function SupportChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          sender: 'bot',
          text: `Hello ${user?.displayName ?? 'there'}! I'm Cristina, your AI support agent. How can I help you today?`,
        },
      ]);
    }
  }, [isOpen, user]);

  useEffect(() => {
     if (scrollAreaRef.current) {
        // A bit of a hack to get to the underlying scrollable element
        const scrollableView = scrollAreaRef.current.querySelector('div');
        if (scrollableView) {
             scrollableView.scrollTop = scrollableView.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await askCristina({ query: input });
      const botMessage: Message = { sender: 'bot', text: result.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'bot',
        text: 'Sorry, I seem to be having some trouble right now. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.5 }}
              className="w-80 h-[500px] bg-popover rounded-lg shadow-2xl border flex flex-col origin-bottom-right"
            >
              <header className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="text-primary" />
                  <h3 className="font-semibold">Cristina AI Support</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </header>
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                 <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-end gap-2 ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.sender === 'bot' && (
                        <Avatar className="h-6 w-6">
                            <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                       {msg.sender === 'user' && user && (
                         <Avatar className="h-6 w-6">
                           <AvatarImage src={user.photoURL ?? ''} />
                           <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                         </Avatar>
                       )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                        <div className="max-w-[80%] rounded-lg px-3 py-2 bg-secondary flex items-center">
                            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <form onSubmit={handleSubmit} className="p-4 border-t flex items-start gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something..."
                  className="flex-1 min-h-[40px] max-h-24"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                  }}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </Button>
      </div>
    </>
  );
}
