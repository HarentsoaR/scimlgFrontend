"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Edit, Grid, Settings } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import PublicationModal from "./PublicationModal";
import UpdateModal from "./UpdateModal";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(30),
  bio: z.string().max(160).min(4),
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).max(50),
  institution: z.string().min(2, { message: "Institution must be at least 2 characters." }).max(100),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast()
  const [error, setError] = useState('');

  const [selectedPublication, setSelectedPublication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (publication) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPublication(null);
  };

  const cookies = parseCookies();
  const token = cookies.access_token;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) throw new Error("No token found");

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.id;

        const response = await axios.get(`http://localhost:8080/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        form.reset(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPublications = async (userId) => {
      try {
        const response = await axios.get(`http://localhost:8080/articles/${userId}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPublications(response.data);
      } catch (err) {
        console.error('Error fetching user publications:', err);
        setError('Failed to load publications.');
      }
    };

    const fetchFollowersFollowing = async (userId) => {
      try {
        const followersResponse = await axios.get(`http://localhost:8080/follow/${userId}/followers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowers(followersResponse.data);

        const followingResponse = await axios.get(`http://localhost:8080/follow/${userId}/following`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowing(followingResponse.data);

        const followerCountResponse = await axios.get(`http://localhost:8080/follow/${userId}/followers/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowerCount(followerCountResponse.data);

        const followingCountResponse = await axios.get(`http://localhost:8080/follow/${userId}/following/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowingCount(followingCountResponse.data);
      } catch (error) {
        console.error("Failed to fetch followers and following:", error);
      }
    };

    fetchUserData();
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.id;
    fetchUserPublications(userId);
    fetchFollowersFollowing(userId);
  }, [token]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      await axios.put(`http://localhost:8080/users/${user.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({ ...user, ...data });
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Your profile has been successfully updated." });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ title: "Update failed", description: "There was an error updating your profile.", variant: "destructive" });
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data available</div>;

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
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 md:mt-0">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="title" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Your title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="institution" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input placeholder="Your institution" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bio" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Tell us about yourself" className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit">Save changes</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex justify-center md:justify-start space-x-4 mt-4">
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
              <div className="grid grid-cols-3 gap-4">
                {loading ? (
                  <div>Loading...</div>
                ) : error ? (
                  <div>{error}</div>
                ) : (
                  publications.map((pub) => (
                    <div
                      key={pub.id}
                      className="mb-4 p-4 border-b last:border-b-0 cursor-pointer"
                      onClick={() => openModal(pub)} // Open modal on click
                    >
                      <h3 className="font-semibold">{pub.title}</h3>
                      <p className="text-sm text-muted-foreground">{pub.content}</p>
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
              <div className="grid md:grid-cols-2 sm:grid-cols-2">
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
      <UpdateModal
        publication={selectedPublication}
        isOpen={isModalOpen}
        onClose={closeModal}
        token={token}
      />
    </div>
  );
}