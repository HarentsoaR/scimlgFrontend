"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ThumbsUp, MessageSquare, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import PublicationModal from "./PublicationModal";
import NewPublicationModal from "./NewPublicationModal";
import ApprovalModal from "./ApprovalModal";
import { parseCookies } from "nookies";
import { HeartIcon } from 'lucide-react';

interface User {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  content: string;
  user: User;
}

interface Publication {
  id: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  createdAt: string;
  updatedAt: string;
  user: User;
  evaluations: any[];
  comments: Comment[];
  likes: number; // Change likes to a number
  hasLiked: boolean;
  followerCount: number; // Add follower count
}

export default function Publications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewPublicationModalOpen, setIsNewPublicationModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const itemsPerPage = 3;


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
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.get('http://localhost:8080/articles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const publicationsWithDetails = await Promise.all(response.data.map(async (pub: Publication) => {
        const hasLiked = await axios.get(`http://localhost:8080/likes/check/${pub.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const followerCountResponse = await axios.get(`http://localhost:8080/follow/${pub.user.id}/followers/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        return {
          ...pub,
          likes: typeof pub.likes === 'number' ? pub.likes : 0,
          hasLiked: hasLiked.data,
          followerCount: followerCountResponse.data, // Set follower count
        };
      }));

      // Sort publications by createdAt date in descending order
      publicationsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setPublications(publicationsWithDetails);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };


  const handleApprove = async (id: number) => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.patch(`http://localhost:8080/articles/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setPublications(publications.map(pub =>
          pub.id === id ? { ...pub, status: 'approved' } : pub
        ));
        setIsApprovalModalOpen(false);
      }
    } catch (error) {
      console.error('Error approving publication:', error);
    }
  };

  const handleReject = async (id: number) => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.patch(`http://localhost:8080/articles/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setPublications(publications.map(pub =>
          pub.id === id ? { ...pub, status: 'rejected' } : pub
        ));
        setIsApprovalModalOpen(false);
      }
    } catch (error) {
      console.error('Error rejecting publication:', error);
    }
  };

  const handleLikePublication = async (id: number) => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.post(`http://localhost:8080/likes/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPublications(publications.map(pub =>
        pub.id === id ? { ...pub, likes: typeof response.data.likes === 'number' ? response.data.likes : 0 } : pub
      ));
      fetchPublications()
    } catch (error) {
      console.error('Error liking publication:', error);
    }
  };

  const filteredPublications = publications.filter(pub =>
    (pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.user.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || pub.status === statusFilter)
  );

  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPublications = filteredPublications.slice(startIndex, endIndex);

  const handleReadClick = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  const handleNewPublication = (newPublication: { title: string; content: string }) => {
    const publication: Publication = {
      id: publications.length + 1,
      title: newPublication.title,
      content: newPublication.content,
      user: { id: 0, name: "Current User" }, // Replace with actual user name
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      evaluations: [],
      comments: [],
      likes: 0,
      hasLiked: false,
      followerCount: 0 // Initialize follower count
    };
    setPublications([publication, ...publications]);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Publications</CardTitle>
          <Button
            variant="ghost"
            onClick={() => setIsNewPublicationModalOpen(true)}
            className="transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <Input
              placeholder="Search publications..."
              className="flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            {currentPublications.map((pub) => (
              <Card key={pub.id} className="mb-4 hover:bg-slate-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                      <Avatar className="relative w-12 h-12 border-2 border-background shadow-lg group-hover:scale-105 transition duration-300">
                        <AvatarImage
                          src={pub.user.avatar}
                          alt={pub.user.name}
                          className="rounded-full object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-semibold">
                          {pub.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div> */}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold">{pub.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pub.user.name} • {pub.followerCount === 1 ? 'Follower' : 'Followers'} • {formatPublicationDate(new Date(pub.createdAt))}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleReadClick(pub)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex items-center space-x-1 ${pub.hasLiked ? 'bg-blue-100' : ''}`}
                      onClick={() => handleLikePublication(pub.id)}
                    >
                      {/* <ThumbsUp className="w-4 h-4" /> */}
                      <HeartIcon className="w-4 h-4" />
                      <span>{pub.likeCounts} {pub.likeCounts === 1 ? 'Like' : 'Likes'}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 cursor-default">
                      <MessageSquare className="w-4 h-4" />
                      <span>{pub.comments.length} {pub.comments.length === 1 ? 'Comment' : 'Comments'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <PublicationModal
        publication={selectedPublication}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPublish={fetchPublications}
      />
      <NewPublicationModal
        isOpen={isNewPublicationModalOpen}
        onClose={() => setIsNewPublicationModalOpen(false)}
        onSubmit={handleNewPublication}
        onPublish={fetchPublications}
      />
      <ApprovalModal
        publication={selectedPublication}
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
