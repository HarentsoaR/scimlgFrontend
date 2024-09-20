"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from './ui/input';
import { HeartIcon, MessageSquare, Send } from "lucide-react";
import { parseCookies } from "nookies";

interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface Comment {
  id: number;
  user: User;
  content: string;
  createdAt: string;
  likes: number;
}

interface Publication {
  id: number;
  title: string;
  user: User;
  createdAt: string;
  content: string;
  likes: number;
  comments: Comment[];
}

interface PublicationModalProps {
  publication: Publication | null;
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
}

export default function PublicationModal({ publication, isOpen, onClose, onPublish }: PublicationModalProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [likedUsers, setLikedUsers] = useState<User[]>([]);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function formatPublicationDate(publicationDate: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - publicationDate.getTime()) / 1000);
    const diffInDays = Math.floor(diffInSeconds / 86400); // Calculate the difference in days

    if (diffInSeconds < 60) {
      return 'Now'; // Less than a minute ago
    } else if (diffInSeconds < 300) { // 5 minutes
      return `${Math.floor(diffInSeconds / 60)}m ago`; // Use 'm' for minutes
    } else if (diffInSeconds < 3600) { // Less than 1 hour
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) { // Less than 24 hours
      return `${Math.floor(diffInSeconds / 3600)}h ago`; // Use 'h' for hours
    } else if (diffInDays < 30) { // Less than 30 days
      return `${diffInDays}d ago`; // Use 'd' for days
    } else {
      // For older dates, return a formatted date string
      return publicationDate.toLocaleDateString() + ' ' + publicationDate.toLocaleTimeString();
    }
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const cookies = parseCookies();
      const token = cookies.access_token;

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.id;

      try {
        const response = await axios.get(`http://localhost:8080/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();

    if (publication) {
      setComments(publication.comments);
    }
  }, [publication]);

  if (!publication) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return; // Prevent empty comments

    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.post(`http://localhost:8080/articles/${publication.id}/comments`, {
        content: newComment,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newCommentData = response.data;
      setComments([...comments, newCommentData]);
      setNewComment('');
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
      onPublish()
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleLikesClick = async () => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.get(`http://localhost:8080/articles/${publication.id}/likes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLikedUsers(response.data);
      setIsLikesModalOpen(true);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className='text-center font-semibold'>{publication.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center space-x-2 mt-2">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Avatar className="relative h-10 w-10 ring-2 ring-background">
                    <AvatarImage
                      src={publication.user.avatar}
                      alt={publication.user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-medium">
                      {publication.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background transform translate-x-1/4 translate-y-1/4"></div>
                </div>
                <span className="font-semibold">{publication.user.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{formatPublicationDate(new Date(publication.createdAt))}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p>{publication.content}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Button variant="outline" size="sm" className="flex items-center space-x-1" onClick={handleLikesClick}>
                <HeartIcon className="w-4 h-4" />
                <span>{publication.likeCounts} {publication.likeCounts === 1 || publication.likeCounts === 0 ? 'Like' : 'Likes'}</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length} Comments</span>
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <ScrollArea className="h-[200px] w-full border rounded-md overflow-hidden">
              <div className="space-y-4 p-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 border-b border-gray-200 pb-2 mb-2">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <Avatar className="relative h-10 w-10 ring-2 ring-background">
                        <AvatarImage
                          src={comment.user.avatar}
                          alt={comment.user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-medium">
                          {comment.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background transform translate-x-1/4 translate-y-1/4"></div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">{formatPublicationDate(new Date(comment.createdAt))}</span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" className="custom-scrollbar-thumb" />
            </ScrollArea>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            {/* <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <Avatar className="relative h-8 w-8 ring-2 ring-background">
                <AvatarImage
                  src={currentUser.avatar} // Use the current user's avatar
                  alt={currentUser.name} // Use the current user's name
                  className="object-cover rounded-full" // Ensure the image is rounded
                />
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-medium flex items-center justify-center rounded-full">
                  <span className="text-lg font-bold">
                    {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()} // Use the current user's initials
                  </span>
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-2 ring-background transform translate-x-1/4 translate-y-1/4"></div>
            </div> */}
            <form onSubmit={handleCommentSubmit} className="flex-grow flex items-center">
              <Input
                ref={commentInputRef}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-grow rounded-full bg-background"
              />
              <Button type="submit" size="icon" variant="ghost" className="ml-2">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLikesModalOpen} onOpenChange={() => setIsLikesModalOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Users who liked this publication</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {likedUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-4 py-2">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.name}</span>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
