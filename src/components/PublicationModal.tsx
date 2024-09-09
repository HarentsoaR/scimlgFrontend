"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare } from "lucide-react";
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
}

export default function PublicationModal({ publication, isOpen, onClose }: PublicationModalProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (publication) {
      setComments(publication.comments);
    }
  }, [publication]);

  if (!publication) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      // Assuming the API returns the newly created comment
      const newCommentData = response.data;
      setComments([...comments, newCommentData]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
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
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{publication.likes} Likes</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length} Comments</span>
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col">
          <h3 className="font-semibold text-lg mb-2">Comments</h3>
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
                    <Button variant="ghost" size="sm" className="mt-1 flex items-center space-x-1 p-0 h-auto">
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-xs">{comment.likes} Likes</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" className="custom-scrollbar-thumb" />
          </ScrollArea>
        </div>

        <div className="mt-4">
          <form onSubmit={handleCommentSubmit}>
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" className="mt-2">Post Comment</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}