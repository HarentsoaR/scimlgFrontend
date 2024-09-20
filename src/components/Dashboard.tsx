"use client";
import { useEffect, useState } from "react"
import { Bell, Home, User, Search, Menu, BookOpen, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import UserProfile from "../components/UserProfile"
import Publications from "../components/Publications"
import Discover from "../components/Discover"
import Profile from "../components/Profile"
import { parseCookies } from "nookies";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const [notifications, setNotifications] = useState([
    { id: 1, content: "Your research paper has been approved for publication." },
    { id: 2, content: "New comment on your recent post about climate change." },
    { id: 3, content: "Upcoming webinar: 'Advances in Malagasy Biodiversity Research'" },
  ])

  const [publications, setPublications] = useState([]);
  const cookies = parseCookies();
  const token = cookies.access_token;
  const { isAuthenticated } = useAuth(); // Get authentication status


  // const checkUserActive = async () => {
  //   try {
  //     if (!token) throw new Error("No token found");
  //     const decodedToken = JSON.parse(atob(token.split('.')[1]));
  //     const userid = decodedToken.id;
  //     const userId = userid;
  //     const response = await axios.get(`http://localhost:8080/${userId}/check`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     return response.data.isActive; // Assuming the response structure is { isActive: boolean }
  //   } catch (error) {
  //     console.error("Failed to check user active status:", error);
  //     return false; // Return false or handle the error as needed
  //   }
  // };

  useEffect(() => {
    const fetchPublications = async () => {
      if (!isAuthenticated) {
        console.error('User is not authenticated.');
        return; // Exit if not authenticated
      }

      const cookies = parseCookies();
      const token = cookies.access_token; // Get the token from cookies

      try {
        const response = await axios.get('http://localhost:8080/articles/followed', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const publicationsWithDetails = await Promise.all(response.data.map(async (pub) => {
          const hasLiked = await axios.get(`http://localhost:8080/likes/check/${pub.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const followerCountResponse = await axios.get(`http://localhost:8080/follow/${pub.user.id}/followers/count`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userStatusResponse = await axios.get(`http://localhost:8080/active/${pub.user.id}/check`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          return {
            ...pub,
            likes: typeof pub.likes === 'number' ? pub.likes : 0,
            hasLiked: hasLiked.data,
            followerCount: followerCountResponse.data,
            userStatus: userStatusResponse.data.isActive,
          };
        }));

        setPublications(publicationsWithDetails);
      } catch (error) {
        console.error('Error fetching publications:', error);
      }
    };
    // const checkActiveStatus = async () => {
    //   const isActive = await checkUserActive(); // Check if user is active
    //     console.log("User active status:", isActive);
    // };
    // checkActiveStatus();

    //SYSTEM
    fetchPublications()
    const publicationsInterval = setInterval(() => {
      fetchPublications();
    }, 3000); // Refresh publications every 30 seconds

    return () => {
      clearInterval(publicationsInterval);
    };
  }, [isAuthenticated]);

  const [currentView, setCurrentView] = useState('home')

  const renderMainContent = () => {
    switch (currentView) {
      case 'publications':
        return <Publications />
      case 'discover':
        return <Discover />
      case 'profile':
        return <Profile />
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-200px)]">
                {publications.map((pub) => (
                  <div key={pub.id} className="mb-4 border-b pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-emerald-200 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                        <Avatar className="relative w-10 h-10 border-2 border-background shadow-lg group-hover:scale-105 transition duration-300">
                          <AvatarImage
                            src={pub.user.avatar}
                            alt={pub.user.name}
                            className="rounded-full object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-semibold">
                            {pub.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${pub.userStatus ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      </div>
                      <span className="font-semibold">{pub.user.name} • {new Date(pub.createdAt).toLocaleDateString()} at {new Date(pub.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="mt-2">{pub.content}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{pub.likeCounts} {pub.likeCounts === 1 ? 'Like' : 'Likes'}</span>
                      <span>{pub.followerCount} {pub.followerCount === 1 ? 'Follower' : 'Followers'}</span>
                      <span>{pub.hasLiked ? 'You liked this' : 'You have not liked this'}</span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center p-5">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="#" onClick={() => setCurrentView('home')}>
              <span className="hidden font-bold sm:inline-block">Malagasy Science</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a className={`transition-colors hover:text-foreground/80 ${currentView === 'home' ? 'text-foreground' : 'text-foreground/60'}`} href="#" onClick={() => setCurrentView('home')}>Home</a>
              <a className={`transition-colors hover:text-foreground/80 ${currentView === 'publications' ? 'text-foreground' : 'text-foreground/60'}`} href="#" onClick={() => setCurrentView('publications')}>Publications</a>
              <a className={`transition-colors hover:text-foreground/80 ${currentView === 'discover' ? 'text-foreground' : 'text-foreground/60'}`} href="#" onClick={() => setCurrentView('discover')}>Discover</a>
            </nav>
          </div>
          <Button variant="outline" size="icon" className="mr-2 md:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Input
                placeholder="Search Malagasy Science..."
                className="h-9 md:w-[300px] lg:w-[400px]"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto mt-4 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col space-y-2">
                <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'home' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setCurrentView('home')}>
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
                <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'profile' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setCurrentView('profile')}>
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </a>
                <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'publications' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setCurrentView('publications')}>
                  <BookOpen className="h-4 w-4" />
                  <span>Publications</span>
                </a>
                <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'discover' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setCurrentView('discover')}>
                  <Compass className="h-4 w-4" />
                  <span>Discover</span>
                </a>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Dynamic Content */}
        <section className="md:col-span-2">
          {renderMainContent()}
        </section>

        {/* Notifications */}
        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-200px)]">
                {notifications.map((notification) => (
                  <div key={notification.id} className="mb-4 border-b pb-4 last:border-b-0">
                    <p className="text-sm">{notification.content}</p>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}