"use client";
import { useState } from "react"
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

export default function Dashboard() {
  const [notifications, setNotifications] = useState([
    { id: 1, content: "Your research paper has been approved for publication." },
    { id: 2, content: "New comment on your recent post about climate change." },
    { id: 3, content: "Upcoming webinar: 'Advances in Malagasy Biodiversity Research'" },
  ])

  const [posts, setPosts] = useState([
    { id: 1, author: "Dr. Rakoto", content: "Just published a new paper on Madagascar's unique ecosystems!", likes: 15, comments: 3 },
    { id: 2, author: "Prof. Ratsimbazafy", content: "Exciting discoveries in lemur behavior research!", likes: 22, comments: 7 },
    { id: 3, author: "Malagasy Science Team", content: "Join us for the upcoming virtual conference on sustainable agriculture in Madagascar.", likes: 10, comments: 1 },
  ])

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
                {posts.map((post) => (
                  <div key={post.id} className="mb-4 border-b pb-4">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{post.author}</span>
                    </div>
                    <p className="mt-2">{post.content}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{post.likes} Likes</span>
                      <span>{post.comments} Comments</span>
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
    <div className="min-h-screen bg-background">
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
            <UserProfile/>
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