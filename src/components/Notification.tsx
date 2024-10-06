"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, Home, User, Search, Menu, BookOpen, Compass, Send, HeartIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/custom-scrollbar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UserProfile from "../components/UserProfile";
import { parseCookies } from "nookies";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useRouter } from "next/navigation";
import { useNotificationContext } from "@/context/NotificationContext";
import { useSearchParams } from 'next/navigation';
import { ProfileModal } from "./ProfileModal";

export default function Notification() {
  const router = useRouter();
  const { articleTitle, setArticleTitle } = useNotificationContext();
  const searchParams = useSearchParams();

  const [notifications, setNotifications] = useState([]);
  const [publications, setPublications] = useState(null);
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const commentInputRef = useRef(null);

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

  const ArticleLink = async (articleTitle) => {
    router.push(`/notification?title=${encodeURIComponent(articleTitle)}`);
  };

  const handleLinkClick = (view) => {
    router.push(`/dashboard?view=${view}`);
  };

  const UserLink = async (username) => {
    router.push(`/user?username=${encodeURIComponent(username)}`);
  };

  useEffect(() => {
    const title = searchParams.get('title');
    if (title) {
      setArticleTitle(title);
      fetchPublications(title);
    }
    fetchNotifications();
  }, [isAuthenticated, searchParams]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    const cookies = parseCookies();
    const token = cookies.access_token;
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.id;

    try {
      const response = await axios.get(`http://localhost:8080/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const unreadNotifications = response.data.filter((notification: { isRead: any; }) => !notification.isRead);
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchPublications = async (title) => {
    if (!isAuthenticated) return;
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.get(`http://localhost:8080/articles/search/title/${encodeURIComponent(title)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedPublication = response.data[0]; // Assuming you want the first publication
      setPublications(fetchedPublication);
      setComments(fetchedPublication.comments || []); // Set comments if available
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return; // Prevent empty comments
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.post(`http://localhost:8080/comments/${publications.id}/comments`, {
        content: newComment,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments([...comments, response.data]); // Update comments
      setNewComment(''); // Clear input
      commentInputRef.current.value = ''; // Reset input field
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const renderMainContent = () => {
    return (
      <div>
        <h2 className="text-lg font-semibold">Notification Details</h2>
        {articleTitle ? (
          <p>Article Title: {articleTitle}</p>
        ) : (
          <p>No article title provided.</p>
        )}

        {publications && (
          <div className="border rounded-md p-4 mt-4">
            <div className="flex items-center space-x-2 mt-2">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-emerald-200 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                <Avatar
                  className="relative w-12 h-12 border-2 border-background shadow-lg group-hover:scale-105 transition duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedUserId(publications.user.id.toString());
                    setIsProfileModalOpen(true);
                  }}
                >
                  <AvatarImage
                    src={publications.user.avatar}
                    alt={publications.user.name}
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-semibold">
                    {publications.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${publications.userStatus ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              </div>
              <span className="font-semibold">{publications.user.name}</span>
              <span className="text-muted-foreground">• {formatPublicationDate(new Date(publications.createdAt))}</span>
            </div>
            <p className="mt-2">{publications.content}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center space-x-1 ${publications.hasLiked ? 'bg-blue-100' : ''}`}
              // onClick={}
              >
                {/* <ThumbsUp className="w-4 h-4" /> */}
                <HeartIcon className="w-4 h-4" />
                <span>{publications.likeCounts} {publications.likeCounts === 1 ? 'Like' : 'Likes'}</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-1 cursor-default">
                <MessageSquare className="w-4 h-4" />
                <span>{publications.comments.length} {publications.comments.length === 1 ? 'Comment' : 'Comments'}</span>
              </Button>
            </div>

            <div className="mt-4 flex flex-col">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 border-b border-gray-200 pb-2 mb-2">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-emerald-200 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                    <Avatar
                      className="relative w-12 h-12 border-2 border-background shadow-lg group-hover:scale-105 transition duration-300 cursor-pointer"
                      onClick={() => {
                        setSelectedUserId(comment.user.id.toString());
                        setIsProfileModalOpen(true);
                      }}
                    >
                      <AvatarImage
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        className="rounded-full object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-semibold">
                        {comment.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${comment.user.userStatus ? 'bg-green-500' : 'bg-gray-500'}`}></div>
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
          </div>
        )}
      </div>
    );
  };

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
              <a className={`transition-colors hover:text-foreground/80 ${currentView === 'home' ? 'text-foreground' : 'text-foreground/60'}`} href="#" onClick={() => handleLinkClick('home')}>Home</a>
              <a className={`transition-colors hover:text-foreground/80 ${currentView === 'publications' ? 'text-foreground' : 'text-foreground/60'}`} href="#" onClick={() => handleLinkClick('publications')}>Publications</a>
              <a className={`transition-colors hover:text-foreground/80 ${currentView === 'discover' ? 'text-foreground' : 'text-foreground/60'}`} href="#" onClick={() => handleLinkClick('discover')}>Discover</a>
            </nav>
          </div>
          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2 md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4">
                <a className={`flex items-center space-x-2 ${currentView === 'home' ? 'text-primary' : ''}`} href="#" onClick={() => { handleLinkClick('home'); setIsMobileMenuOpen(false); }}>
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
                <a className={`flex items-center space-x-2 ${currentView === 'publications' ? 'text-primary' : ''}`} href="#" onClick={() => { handleLinkClick('publications'); setIsMobileMenuOpen(false); }}>
                  <BookOpen className="h-4 w-4" />
                  <span>Publications</span>
                </a>
                <a className={`flex items-center space-x-2 ${currentView === 'discover' ? 'text-primary' : ''}`} href="#" onClick={() => { handleLinkClick('discover'); setIsMobileMenuOpen(false); }}>
                  <Compass className="h-4 w-4" />
                  <span>Discover</span>
                </a>
                <a className={`flex items-center space-x-2 ${currentView === 'profile' ? 'text-primary' : ''}`} href="#" onClick={() => { handleLinkClick('profile'); setIsMobileMenuOpen(false); }}>
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
                              onClick={() => ArticleLink(articleTitle)}
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
                              onClick={() => UserLink(username)}
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
                            <span
                              onClick={() => UserLink(username)}
                              className="text-blue-500 hover:underline cursor-pointer"
                            >
                              {username}
                            </span>{" "}
                            liked your article:
                            <span
                              onClick={() => ArticleLink(articleTitle)}
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
                            <span
                              onClick={() => UserLink(username)}
                              className="text-blue-500 hover:underline cursor-pointer"
                            >
                              {username}
                            </span>{" "}
                            commented on your article about{" "}
                            <span
                              onClick={() => ArticleLink(articleTitle)}
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
                <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'home' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => handleLinkClick('home')}>
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
                <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'profile' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => handleLinkClick('profile')}>
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </a>
                <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'publications' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => handleLinkClick('publications')}>
                  <BookOpen className="h-4 w-4" />
                  <span>Publications</span>
                </a>
                <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'discover' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => handleLinkClick('discover')}>
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
      </main>
      {/* Profile Modal */}
      <ProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}
