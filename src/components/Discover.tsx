import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Users, MapPin, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import { parseCookies } from "nookies";
import { ProfileModal } from "./ProfileModal";

export default function Discover() {
  const [researchers, setResearchers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Number of researchers per page

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchResearchers();
  }, []);

  const fetchResearchers = async () => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.id;

    try {
      const response = await axios.get("http://localhost:8080/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const researchersData = response.data;

      // Filter out the current user
      const filteredResearchers = researchersData.filter((researcher) => researcher.id !== userId);

      // Check follow status and follower count for each researcher
      const followStatusPromises = filteredResearchers.map(async (researcher) => {
        const isFollowingResponse = await axios.get(`http://localhost:8080/follow/check/${researcher.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const followerCountResponse = await axios.get(`http://localhost:8080/follow/${researcher.id}/followers/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        return {
          ...researcher,
          isFollowing: isFollowingResponse.data, // Assuming the response returns a boolean
          followerCount: followerCountResponse.data // Set follower count
        };
      });

      const researchersWithFollowStatus = await Promise.all(followStatusPromises);
      setResearchers(researchersWithFollowStatus);
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFollowToggle = async (researcherId, isFollowing) => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      if (isFollowing) {
        // Unfollow the researcher
        await axios.delete(`http://localhost:8080/follow/${researcherId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setResearchers((prevResearchers) =>
          prevResearchers.map((researcher) =>
            researcher.id === researcherId ? { ...researcher, isFollowing: false } : researcher
          )
        );
        fetchResearchers()
      } else {
        // Follow the researcher
        await axios.post(`http://localhost:8080/follow/${researcherId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchResearchers()
        // Update local state to reflect follow
        setResearchers((prevResearchers) =>
          prevResearchers.map((researcher) =>
            researcher.id === researcherId ? { ...researcher, isFollowing: true } : researcher
          )
        );
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  const filteredResearchers = researchers.filter(researcher =>
    researcher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (researcher.title && researcher.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (researcher.institution && researcher.institution.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredResearchers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResearchers = filteredResearchers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Discover Researchers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search researchers, fields, or institutions..."
              className="w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <ScrollArea className="h-[calc(100vh-250px)]">
            {currentResearchers.map((researcher) => (
              <Card key={researcher.id} className="mb-4 hover:bg-slate-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <Avatar
                        className="relative w-12 h-12 border-2 border-background shadow-lg group-hover:scale-105 transition duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedUserId(researcher.id.toString());
                          setIsProfileModalOpen(true);
                        }}
                      >
                        <AvatarImage
                          src={researcher.avatar}
                          alt={researcher.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-medium">
                          {researcher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-2 ring-background transform translate-x-1/4 translate-y-1/4"></div> */}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold">{researcher.name}</h3>
                      {researcher.title && (
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {researcher.title}
                        </p>
                      )}
                      {researcher.institution && (
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {researcher.institution}
                        </p>
                      )}
                      {researcher.location && (
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {researcher.location}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {researcher.followerCount} {researcher.followerCount === 1 ? 'Follower' : 'Followers'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleFollowToggle(researcher.id, researcher.isFollowing)}>
                      {researcher.isFollowing ? (
                        <>
                          <Minus className="h-4 w-4 mr-1" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>

          {/* Pagination Controls */}
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
      <ProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUserId(null); // Reset user ID when closing
        }}
      />
    </div>
  );
}
