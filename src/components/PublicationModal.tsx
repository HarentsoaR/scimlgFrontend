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
  userStatus: boolean; // Add userStatus field
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
    const diffInDays = Math.floor(diffInSeconds / 86400);

    if (diffInSeconds < 60) return 'Now';
    if (diffInSeconds < 300) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return publicationDate.toLocaleDateString() + ' ' + publicationDate.toLocaleTimeString();
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

    const fetchPublicationAndCommentsStatus = async () => {
      if (publication) {
        // Fetch publication owner status
        const cookies = parseCookies();
        const token = cookies.access_token;

        try {
          const ownerStatusResponse = await axios.get(`http://localhost:8080/active/${publication.user.id}/check`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          publication.user.userStatus = ownerStatusResponse.data.isActive; // Update owner status

          // Fetch comments with user statuses
          const updatedComments = await Promise.all(publication.comments.map(async (comment) => {
            const commenterStatusResponse = await axios.get(`http://localhost:8080/active/${comment.user.id}/check`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return {
              ...comment,
              user: {
                ...comment.user,
                userStatus: commenterStatusResponse.data.isActive, // Update commenter status
              },
            };
          }));

          setComments(updatedComments); // Set updated comments with statuses
        } catch (error) {
          console.error('Error fetching user statuses:', error);
        }
      }
    };

    fetchCurrentUser();
    fetchPublicationAndCommentsStatus();
  }, [publication]);

  if (!publication) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.post(`http://localhost:8080/comments/${publication.id}/comments`, {
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
      onPublish();
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
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${publication.user.userStatus ? 'bg-green-500' : 'bg-gray-500'}`}></div>
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
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${comment.user.userStatus ? 'bg-green-500' : 'bg-gray-500'}`}></div>
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
            {/* Render liked users here */}
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
