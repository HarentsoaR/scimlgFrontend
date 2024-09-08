import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, BookOpen, ThumbsUp, MessageSquare, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import PublicationModal from "./PublicationModal"
import NewPublicationModal from "./NewPublicationModal"
import ApprovalModal from "./ApprovalModal"

interface Publication {
  id: number
  title: string
  author: string
  date: string
  content: string
  likes: number
  comments: number
  status: 'pending' | 'approved' | 'rejected'
}

export default function Publications() {
  const [publications, setPublications] = useState<Publication[]>([
    { id: 1, title: "Biodiversity in Madagascar's Rainforests", author: "Dr. Rakoto", date: "2023-05-15", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", likes: 45, comments: 12, status: 'approved' },
    { id: 2, title: "Climate Change Effects on Endemic Species", author: "Prof. Ratsimbazafy", date: "2023-06-02", content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", likes: 38, comments: 9, status: 'pending' },
    { id: 3, title: "Sustainable Agriculture Practices in Madagascar", author: "Dr. Razafindrakoto", date: "2023-06-20", content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.", likes: 52, comments: 15, status: 'pending' },
    { id: 4, title: "Conservation Efforts for Lemurs", author: "Dr. Rasoloarison", date: "2023-07-05", content: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.", likes: 60, comments: 20, status: 'approved' },
  ])

  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewPublicationModalOpen, setIsNewPublicationModalOpen] = useState(false)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const itemsPerPage = 3 // Changed from 5 to 3 to demonstrate pagination with 4 items

  const filteredPublications = publications.filter(pub =>
    (pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || pub.status === statusFilter)
  )

  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPublications = filteredPublications.slice(startIndex, endIndex)

  const handleReadClick = (publication: Publication) => {
    setSelectedPublication(publication)
    setIsModalOpen(true)
  }

  const handleApprovalClick = (publication: Publication) => {
    setSelectedPublication(publication)
    setIsApprovalModalOpen(true)
  }

  const handleNewPublication = (newPublication: { title: string; content: string }) => {
    const publication: Publication = {
      id: publications.length + 1,
      title: newPublication.title,
      author: "Current User", // Replace with actual user name
      date: new Date().toISOString().split('T')[0],
      content: newPublication.content,
      likes: 0,
      comments: 0,
      status: 'pending'
    }
    setPublications([publication, ...publications])
  }

  const handleApprove = (id: number) => {
    setPublications(publications.map(pub =>
      pub.id === id ? { ...pub, status: 'approved' } : pub
    ))
    setIsApprovalModalOpen(false)
  }

  const handleReject = (id: number) => {
    setPublications(publications.map(pub =>
      pub.id === id ? { ...pub, status: 'rejected' } : pub
    ))
    setIsApprovalModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Publications</CardTitle>
          <Button onClick={() => setIsNewPublicationModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Publication
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <Input
              placeholder="Search publications..."
              className="flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            {currentPublications.map((pub) => (
              <Card key={pub.id} className="mb-4 hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{pub.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold">{pub.title}</h3>
                      <p className="text-sm text-muted-foreground">{pub.author} • {pub.date}</p>
                    </div>
                    <Badge variant={pub.status === 'approved' ? 'default' : pub.status === 'pending' ? 'secondary' : 'destructive'}>
                      {pub.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleReadClick(pub)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read
                    </Button>
                    {pub.status === 'pending' && (
                      <Button variant="outline" size="sm" onClick={() => handleApprovalClick(pub)}>
                        Review
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {pub.likes} Likes
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {pub.comments} Comments
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
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
      <PublicationModal
        publication={selectedPublication}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <NewPublicationModal
        isOpen={isNewPublicationModalOpen}
        onClose={() => setIsNewPublicationModalOpen(false)}
        onSubmit={handleNewPublication}
      />
      <ApprovalModal
        publication={selectedPublication}
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}