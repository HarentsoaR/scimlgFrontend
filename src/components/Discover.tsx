import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Users, Briefcase, MapPin } from "lucide-react"

export default function Discover() {
  const [researchers, setResearchers] = useState([
    { id: 1, name: "Dr. Rakoto Andrianjafy", field: "Marine Biology", institution: "University of Antananarivo", location: "Antananarivo" },
    { id: 2, name: "Prof. Ratsimbazafy Jean", field: "Primatology", institution: "Madagascar Primate Study and Research Group", location: "Andasibe" },
    { id: 3, name: "Dr. Razafindrakoto Yves", field: "Sustainable Agriculture", institution: "National Center for Applied Research on Rural Development", location: "Toamasina" },
  ])

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
              // startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <ScrollArea className="h-[calc(100vh-250px)]">
            {researchers.map((researcher) => (
              <Card key={researcher.id} className="mb-4 hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{researcher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold">{researcher.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {researcher.field}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {researcher.institution}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {researcher.location}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}