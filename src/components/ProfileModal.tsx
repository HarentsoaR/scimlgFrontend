"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { parseCookies } from "nookies"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid, Users, Plus, Minus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"

interface ProfileModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ userId, isOpen, onClose }: ProfileModalProps) {
  const [user, setUser] = useState(null)
  const [publications, setPublications] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFollowing, setIsFollowing] = useState(false); // Track follow status

  const cookies = parseCookies()
  const token = cookies.access_token

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !isOpen) return
      setLoading(true)
      setError('')

      try {
        const [userResponse, publicationsResponse, followersResponse, followingResponse, followCheckResponse] = await Promise.all([
          axios.get(`http://localhost:8080/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/articles/${userId}/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/follow/${userId}/followers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/follow/${userId}/following`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/follow/check/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }), // Check if the current user is following
        ])

        setUser(userResponse.data)
        setPublications(publicationsResponse.data)
        setFollowers(followersResponse.data)
        setFollowing(followingResponse.data)
        setFollowerCount(followersResponse.data.length)
        setFollowingCount(followingResponse.data.length)
        setIsFollowing(followCheckResponse.data); // Set follow status
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        setError('Failed to load user data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId, isOpen, token])

  const handleFollowToggle = async () => {
    const cookies = parseCookies()
    const token = cookies.access_token

    try {
      if (isFollowing) {
        // Unfollow the user
        await axios.delete(`http://localhost:8080/follow/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsFollowing(false); // Update local state
        setFollowerCount((prev) => prev - 1); // Decrease follower count
      } else {
        // Follow the user
        await axios.post(`http://localhost:8080/follow/${userId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsFollowing(true); // Update local state
        setFollowerCount((prev) => prev + 1); // Increase follower count
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]"> {/* Increased width */}
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : user ? (
          <div className="space-y-6">
            <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-200 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <Avatar className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background shadow-xl group-hover:scale-105 transition duration-300">
                      <AvatarImage src={user.avatar} alt={user.name} className="rounded-full" />
                      <AvatarFallback className="text-2xl font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-grow text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <span className="flex justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={handleFollowToggle}
                      className="mt-4 flex justify-end"
                    >
                      {isFollowing ? (
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
                    </span>
                    <div className="flex justify-center sm:justify-start space-x-4 mt-2">
                      <div><span className="font-bold">{publications.length}</span> publications</div>
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
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-4">
                        {publications.length > 0 ? (
                          publications.map((pub) => (
                            <div key={pub.id} className="p-4 border-b last:border-b-0">
                              <h3 className="font-semibold">{pub.title}</h3>
                              <p className="text-sm text-muted-foreground">{new Date(pub.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground">No publications available</div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="connections">
                <Card>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Followers</h3>
                        <ScrollArea className="h-[200px]">
                          {followers.length > 0 ? (
                            followers.map((follower) => (
                              <div key={follower.id} className="flex items-center space-x-2 mb-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={follower.avatar} alt={follower.name} />
                                  <AvatarFallback>{follower.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-sm">{follower.name}</p>
                                  <p className="text-xs text-muted-foreground">{follower.title}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-muted-foreground">No followers</div>
                          )}
                        </ScrollArea>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Following</h3>
                        <ScrollArea className="h-[200px]">
                          {following.length > 0 ? (
                            following.map((followed) => (
                              <div key={followed.id} className="flex items-center space-x-2 mb-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={followed.avatar} alt={followed.name} />
                                  <AvatarFallback>{followed.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-sm">{followed.name}</p>
                                  <p className="text-xs text-muted-foreground">{followed.title}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-muted-foreground">Not following anyone</div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
