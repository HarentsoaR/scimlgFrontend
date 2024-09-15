"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from './ui/input';
import { ThumbsUp, MessageSquare, Send } from "lucide-react";
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

  useEffect(() => {
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
            <DialogTitle>{publication.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Avatar>
                  <AvatarImage src={publication.user.avatar} alt={publication.user.name} />
                  <AvatarFallback>{publication.user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{publication.user.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{new Date(publication.createdAt).toLocaleDateString()} at {new Date(publication.createdAt).toLocaleTimeString()}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p>{publication.content}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Button variant="outline" size="sm" className="flex items-center space-x-1" onClick={handleLikesClick}>
                <ThumbsUp className="w-4 h-4" />
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
                    <Avatar>
                      <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}</span>
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
            <Avatar className="w-8 h-8">
              <AvatarImage src={publication.user.avatar} alt={publication.user.name} />
              <AvatarFallback>{publication.user.name[0]}</AvatarFallback>
            </Avatar>
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
