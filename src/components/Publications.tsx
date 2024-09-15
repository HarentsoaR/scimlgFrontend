import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ThumbsUp, MessageSquare, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import PublicationModal from "./PublicationModal";
import NewPublicationModal from "./NewPublicationModal";
import ApprovalModal from "./ApprovalModal";
import { parseCookies } from "nookies";

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

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.id;

      const publicationsWithLikes = await Promise.all(response.data.map(async (pub: Publication) => {
        const hasLiked = await axios.get(`http://localhost:8080/likes/check/${pub.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return {
          ...pub,
          likes: typeof pub.likes === 'number' ? pub.likes : 0,
          hasLiked: hasLiked.data, // Assuming the response is a boolean
        };
      }));

      setPublications(publicationsWithLikes);
    } catch (error) {
      console.error('Error fetching publications:', error);
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

      // Update the publications state with the new likes count
      setPublications(publications.map(pub =>
        pub.id === id ? { ...pub, likes: typeof response.data.likes === 'number' ? response.data.likes : 0 } : pub // Ensure likes is a number
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

  const handleApprovalClick = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsApprovalModalOpen(true);
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
      likes: 0
    };
    setPublications([publication, ...publications]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'under_review':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
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
                    <Avatar>
                      <AvatarFallback>{pub.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold">{pub.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pub.user.name} • {new Date(pub.createdAt).toLocaleDateString()} at {new Date(pub.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleReadClick(pub)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex items-center space-x-1 ${pub.hasLiked ? 'bg-blue-100' : ''}`}
                      onClick={() => handleLikePublication(pub.id)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{pub.likeCounts} {pub.likeCounts === 1 || pub.likeCounts === 0 ? 'Like' : 'Likes'}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 cursor-default">
                      <MessageSquare className="w-4 h-4" />
                      <span>{pub.comments.length} Comments</span>
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
