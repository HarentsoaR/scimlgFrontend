"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, Home, User, Menu, BookOpen, Compass, Grid, Users } from "lucide-react";
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
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function Notification() {
    const router = useRouter();
    const [user, setUser] = useState('');
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

    //FOLOWING
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const [error, setError] = useState('');


    const [notifications, setNotifications] = useState([]);
    const [publications, setPublications] = useState([]);
    const { isAuthenticated } = useAuth();
    const [currentView, setCurrentView] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const selectedUserId = useRef(null);

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

    const ArticleLink = async (articleTitle: string | number | boolean) => {
        router.push(`/notification?title=${encodeURIComponent(articleTitle)}`);
    };

    const handleLinkClick = (view: string) => {
        router.push(`/dashboard?view=${view}`);
    };

    const UserLink = async (username) => {
        router.push(`/user?username=${encodeURIComponent(username)}`);
    };

    const cookies = parseCookies();
    const token = cookies.access_token;


    useEffect(() => {
        const username = searchParams.get('username');
        const fetchUserData = async (username: string | null) => {
            try {
                if (!token) throw new Error("No token found");
                const response = await axios.get(`http://localhost:8080/users/username/${username}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(response.data)
                setUser(response.data);
                selectedUserId = response.data.id
                fetchFollowersFollowing(selectedUserId)
                fetchUserPublications(selectedUserId)
                // console.log(response.data.id)
                // console.log(selectedUserId)
                console.log(publications)
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserPublications = async (selectedUserId: any) => {
            try {
                const publicationsResponse = await axios.get(`http://localhost:8080/articles/${selectedUserId}/user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPublications(publicationsResponse.data);
                console.log("Pub", publications)
            } catch (err) {
                console.error('Error fetching user publications:', err);
                setError('Failed to load publications.');
            }
        };

        const fetchFollowersFollowing = async (selectedUserId: any) => {
            try {
                const followersResponse = await axios.get(`http://localhost:8080/follow/${selectedUserId}/followers`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFollowers(followersResponse.data);

                const followingResponse = await axios.get(`http://localhost:8080/follow/${selectedUserId}/following`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFollowing(followingResponse.data);

                const followerCountResponse = await axios.get(`http://localhost:8080/follow/${selectedUserId}/followers/count`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFollowerCount(followerCountResponse.data);

                const followingCountResponse = await axios.get(`http://localhost:8080/follow/${selectedUserId}/following/count`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFollowingCount(followingCountResponse.data);
            } catch (error) {
                console.error("Failed to fetch followers and following:", error);
            }
        };
        fetchUserData(username)
        fetchNotifications();
    }, [isAuthenticated, searchParams, token]);



    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        const cookies = parseCookies();
        const token = cookies.access_token;
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const selectedUserId = decodedToken.id;

        try {
            const response = await axios.get(`http://localhost:8080/notifications/${selectedUserId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const unreadNotifications = response.data.filter((notification: { isRead: any; }) => !notification.isRead);
            setNotifications(unreadNotifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const renderMainContent = () => {
        return (
            <div className="max-w-4xl mx-auto space-y-8 p-4">
                <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-200 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                <Avatar className="relative h-32 w-32 rounded-full border-4 border-background shadow-xl group-hover:scale-105 transition duration-300">
                                    <AvatarImage src={user.avatar} alt={user.name} className="rounded-full" />
                                    <AvatarFallback className="text-2xl font-bold">
                                        {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <div className="flex justify-center md:justify-start space-x-4 mt-4">
                                    {/* <div><span className="font-bold">{publications.length}</span> publications</div> */}
                                    <div><span className="font-bold">{followerCount}</span> followers</div>
                                    <div><span className="font-bold">{followingCount}</span> following</div>
                                </div>
                                <p className="text-muted-foreground mt-2">{user.title}</p>
                                <p className="text-muted-foreground">{user.institution}</p>
                                <p className="mt-2">{user.bio}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="publications">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="publications" className="flex items-center">
                            <Grid className="h-4 w-4 mr-2" />
                            Publications
                        </TabsTrigger>
                        <TabsTrigger value="connections" className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Connections
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="publications">
                        <Card>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    {loading ? (
                                        <div>Loading...</div>
                                    ) : error ? (
                                        <div>{error}</div>
                                    ) : (
                                        publications.map((pub) => (
                                            <div key={pub.id} className="mb-4 p-4 border-b last:border-b-0">
                                                <h3 className="font-semibold">{pub.title}</h3>
                                                <p className="text-sm text-muted-foreground">{pub.date}</p>
                                            </div>
                                        ))
                                    )}
                                    {publications.length === 0 && !loading && <div>No publications available</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="connections">
                        <Card>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Followers</h3>
                                        <ScrollArea className="h-[300px]">
                                            {followers.length > 0 ? (
                                                followers.map((follower) => (
                                                    <div key={follower.id} className="flex items-center space-x-4 mb-4">
                                                        <div className="relative group">
                                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                                            <Avatar className="relative h-8 w-8 ring-2; ring-background">
                                                                <AvatarImage
                                                                    src={follower.avatar}
                                                                    alt={follower.name}
                                                                    className="object-cover"
                                                                />
                                                                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-medium">
                                                                    {follower.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {/* <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-2 ring-background transform translate-x-1/4 translate-y-1/4"></div> */}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{follower.name}</p>
                                                            <p className="text-sm text-muted-foreground">{follower.title}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>No followers available</div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Following</h3>
                                        <ScrollArea className="h-[300px]">
                                            {following.length > 0 ? (
                                                following.map((followed) => (
                                                    <div key={followed.id} className="flex items-center space-x-4 mb-4">
                                                        <div className="relative group">
                                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                                            <Avatar className="relative h-8 w-8 ring-2; ring-background">
                                                                <AvatarImage
                                                                    src={followed.avatar}
                                                                    alt={followed.name}
                                                                    className="object-cover"
                                                                />
                                                                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-medium">
                                                                    {followed.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{followed.name}</p>
                                                            <p className="text-sm text-muted-foreground">{followed.title}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>No following available</div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
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
            {/* <ProfileModal
                selectedUserId={selectedUserId}
                isOpen={isProfileModalOpen}
                onClose={() => {
                    setIsProfileModalOpen(false);
                    setselectedUserId(null);
                }}
            /> */}
        </div>
    );
}
