"use client";
import { useEffect, useState } from "react"
import { Bell, Home, User, Search, Menu, BookOpen, Compass, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/custom-scrollbar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import UserProfile from "../components/UserProfile"
import Publications from "../components/Publications"
import Discover from "../components/Discover"
import Profile from "../components/Profile"
import { parseCookies } from "nookies";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ProfileModal } from "./ProfileModal";
import { useRouter, useSearchParams } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [notifications, setNotifications] = useState([]);
  const [publications, setPublications] = useState([]);
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  function formatPublicationDate(publicationDate: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - publicationDate.getTime()) / 1000);
    const diffInDays = Math.floor(diffInSeconds / 86400);

    if (diffInSeconds < 60) return 'Now';
    if (diffInSeconds < 300) return `${Math.floor(diffInSeconds / 60)}m `;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m `;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h `;
    if (diffInDays < 30) return `${diffInDays}d `;
    return publicationDate.toLocaleDateString() + ' ' + publicationDate.toLocaleTimeString();
  }

  const handleLinkClick = async (articleTitle: string | number | boolean) => {
    router.push(`/notification?title=${encodeURIComponent(articleTitle)}`);
  };

  const ArticleLink = async (articleTitle: string | number | boolean, id: any) => {
    markNotificationAsRead(id)
    router.push(`/notification?title=${encodeURIComponent(articleTitle)}`);
  };

  const UserLink = async (username: string | number | boolean, id: any) => {
    markNotificationAsRead(id)
    router.push(`/user?username=${encodeURIComponent(username)}`);
  };

  const markNotificationAsRead = async (id: any) => {
    const cookies = parseCookies();
    const token = cookies.access_token;
    try {
      const response = await axios.put(`http://localhost:8080/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Notification marked as read:", response.data);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {

    const view = searchParams.get('view'); // Get the view parameter from the URL
    if (view) {
      setCurrentView(view); // Set the current view based on the URL parameter
    }

    const fetchNotifications = async () => {
      if (!isAuthenticated) {
        console.error("User is not authenticated.");
        return;
      }
      const cookies = parseCookies();
      const token = cookies.access_token;
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.id;

      try {
        const response = await axios.get(`http://localhost:8080/notifications/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data)
        const unreadNotifications = response.data.filter((notification: { isRead: any; }) => !notification.isRead);
        setNotifications(unreadNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const fetchPublications = async () => {
      if (!isAuthenticated) {
        console.error('User is not authenticated.');
        return;
      }
      const cookies = parseCookies();
      const token = cookies.access_token;

      try {
        const response = await axios.get('http://localhost:8080/articles/followed', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const publicationsWithDetails = await Promise.all(response.data.map(async (pub: { id: any; user: { id: any; }; likes: any; }) => {
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

        publicationsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const filteredPublications = publicationsWithDetails.filter(pub =>
          (pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.user.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (pub.status === 'accepted')
        );
        setPublications(filteredPublications);
      } catch (error) {
        console.error('Error fetching publications:', error);
      }
    };

    fetchPublications()
    fetchNotifications()
    const publicationsInterval = setInterval(fetchPublications, 30000);

    return () => clearInterval(publicationsInterval);
  }, [isAuthenticated]);

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
            <ScrollArea className="h-[calc(100vh-200px)] w-full rounded-md border">
              <CardContent>
                <div className="p-4">
                  {publications.map((pub) => (
                    <div key={pub.id} className="mb-4 border-b pb-4">
                      <div className="flex items-center space-x-2">
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-emerald-200 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                          <Avatar
                            className="relative w-12 h-12 border-2 border-background shadow-lg group-hover:scale-105 transition duration-300 cursor-pointer"
                            onClick={() => {
                              setSelectedUserId(pub.user.id.toString());
                              setIsProfileModalOpen(true);
                            }}
                          >
                            <AvatarImage
                              src={pub.user.avatar}
                              alt={pub.user.name}
                              className="rounded-full object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-semibold">
                              {pub.user.name.split(' ').map((n: any[]) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${pub.userStatus ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        </div>
                        <span className="font-semibold">{pub.user.name} • <span className="font-light">{formatPublicationDate(new Date(pub.createdAt))}</span></span>
                      </div>
                      <p className="mt-2">{pub.content}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{pub.likeCounts} {pub.likeCounts === 1 ? 'Like' : 'Likes'}</span>
                        <span>{pub.followerCount} {pub.followerCount === 1 ? 'Follower' : 'Followers'}</span>
                        <span>{pub.hasLiked ? 'You liked this' : 'You have not liked this'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <ScrollBar />
            </ScrollArea>
          </Card>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-background w-full ${isNotificationsOpen ? 'blur' : ''}`}>
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
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2 md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4">
                <a className={`flex items-center space-x-2 ${currentView === 'home' ? 'text-primary' : ''}`} href="#" onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }}>
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
                <a className={`flex items-center space-x-2 ${currentView === 'publications' ? 'text-primary' : ''}`} href="#" onClick={() => { setCurrentView('publications'); setIsMobileMenuOpen(false); }}>
                  <BookOpen className="h-4 w-4" />
                  <span>Publications</span>
                </a>
                <a className={`flex items-center space-x-2 ${currentView === 'discover' ? 'text-primary' : ''}`} href="#" onClick={() => { setCurrentView('discover'); setIsMobileMenuOpen(false); }}>
                  <Compass className="h-4 w-4" />
                  <span>Discover</span>
                </a>
                <a className={`flex items-center space-x-2 ${currentView === 'profile' ? 'text-primary' : ''}`} href="#" onClick={() => { setCurrentView('profile'); setIsMobileMenuOpen(false); }}>
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </a>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Input
                placeholder="Search Malagasy Science..."
                className="h-9 md:w-[300px] lg:w-[400px]"
              />
            </div>
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="link" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">
                      {notifications.length}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <ScrollArea className="h-[300px] w-full rounded-md border">
                  <div className="p-4">
                    <h3 className="mb-4 text-sm font-medium leading-none">Notifications</h3>
                    {notifications.map((notification) => {
                      const isArticleNotification = notification.message.includes("has posted a new article:");
                      const isFollowNotification = notification.message.includes("started following you");
                      const isLikeNotification = notification.message.includes("liked your article");
                      const isCommentNotification = notification.message.includes("commented on your article about");

                      let content;

                      if (isArticleNotification) {
                        const titleMatch = notification.message.match(/: (.+)$/);
                        const articleTitle = titleMatch ? titleMatch[1] : "Article";

                        // Extract username using regex
                        const usernameMatch = notification.message.match(/^(.*?) has posted a new article/);
                        const username = usernameMatch ? usernameMatch[1].trim() : "User";

                        content = (
                          <p className="text-sm">
                            {username} has posted a new article:{" "}
                            <span
                              onClick={() => ArticleLink(articleTitle, notification.id)}
                              className="text-blue-500 hover:underline cursor-pointer"
                            >
                              {articleTitle}
                            </span>
                          </p>
                        );
                      } else if (isFollowNotification) {
                        // Extract username using regex
                        const usernameMatch = notification.message.match(/^(.*?) started following you/);
                        const username = usernameMatch ? usernameMatch[1].trim() : "User";

                        content = (
                          <p className="text-sm">
                            <span
                              onClick={() => UserLink(username, notification.id)}
                              className="text-blue-500 hover:underline cursor-pointer"
                            >
                              {username}
                            </span>{" "}
                            has followed you.
                          </p>
                        );
                      } else if (isLikeNotification) {
                        const titleMatch = notification.message.match(/: (.+)$/);
                        const articleTitle = titleMatch ? titleMatch[1] : "Article";

                        const usernameMatch = notification.message.match(/^(.*?) liked your article:/);
                        const username = usernameMatch ? usernameMatch[1].trim() : "User";

                        content = (
                          <p className="text-sm">
                              {username}{""}
                            liked your article:
                            <span
                              onClick={() => ArticleLink(articleTitle, notification.id)}
                              className="text-blue-500 hover:underline cursor-pointer"
                            >
                              {articleTitle}
                            </span>
                          </p>
                        );
                      } else if (isCommentNotification) {
                        // Extract username using regex
                        const usernameMatch = notification.message.match(/^(.*?) commented on your article about/);
                        const username = usernameMatch ? usernameMatch[1].trim() : "User";

                        const titleMatch = notification.message.match(/about (.+)$/);
                        const articleTitle = titleMatch ? titleMatch[1] : "Article";

                        content = (
                          <p className="text-sm">
                              {username}{" "}
                            commented on your article about{" "}
                            <span
                              onClick={() => ArticleLink(articleTitle, notification.id)}
                              className="text-blue-500 hover:underline cursor-pointer"
                            >
                              {articleTitle}
                            </span>.
                          </p>
                        );
                      } else {
                        content = <p className="text-sm">{notification.message}</p>;
                      }

                      return (
                        <div key={notification.id} className="mb-4 border-b pb-4 last:border-b-0">
                          {content}
                          <p className="text-xs text-gray-500 mt-1">{formatPublicationDate(new Date(notification.createdAt))}</p>
                        </div>
                      );
                    })}

                  </div>
                  <ScrollBar />
                </ScrollArea>
              </PopoverContent>
            </Popover>
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
        {/* <aside className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-200px)] w-full rounded-md border">
                <div className="p-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="mb-4 border-b pb-4 last:border-b-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatPublicationDate(new Date(notification.createdAt))}</p>
                    </div>
                  ))}
                </div>
                <ScrollBar />
              </ScrollArea>
            </CardContent>
          </Card>
        </aside> */}
      </main>
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