"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Award, Edit, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
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

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(30, {
    message: "Name must not be longer than 30 characters.",
  }),
  bio: z.string().max(160).min(4),
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }).max(50, {
    message: "Title must not be longer than 50 characters.",
  }),
  institution: z.string().min(2, {
    message: "Institution must be at least 2 characters.",
  }).max(100, {
    message: "Institution must not be longer than 100 characters.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast()
  const [error, setError] = useState('');

  const cookies = parseCookies();
  const token = cookies.access_token;


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookies = parseCookies();
        const token = cookies.access_token;

        if (!token) {
          throw new Error("No token found");
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.id;

        const response = await axios.get(`http://localhost:8080/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        form.reset(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.id;
    fetchUserPublications(userId);
  }, []);

  const fetchUserPublications = async (userId) => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.get(`http://localhost:8080/articles/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPublications(response.data);
    } catch (err) {
      console.error('Error fetching user publications:', err);
      setError('Failed to load publications.');
    } finally {
      setLoading(false);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    try {
      const cookies = parseCookies();
      const token = cookies.access_token;

      await axios.put(`http://localhost:8080/users/${user.id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser({ ...user, ...data });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.title}</p>
              <p className="text-muted-foreground">{user.institution}</p>
              <p className="mt-2">{user.bio}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
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
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Your title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="institution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input placeholder="Your institution" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save changes</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="publications">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="publications" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Publications
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Connections
          </TabsTrigger>
        </TabsList>
        <TabsContent value="publications">
          <Card>
            <CardHeader>
              <CardTitle>Publications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-450px)]">
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
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-450px)]">
                {user.connections?.map((connection) => (
                  <div key={connection.id} className="mb-4 p-4 border-b last:border-b-0 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span>{connection.name}</span>
                    </div>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                )) || <div>No connections available</div>}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function jwtDecode(token: string) {
  throw new Error("Function not implemented.");
}
