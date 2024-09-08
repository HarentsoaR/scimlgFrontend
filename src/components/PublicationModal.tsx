import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Publication {
  id: number
  title: string
  author: string
  date: string
  content: string
  likes: number
  comments: number
}

interface PublicationModalProps {
  publication: Publication | null
  isOpen: boolean
  onClose: () => void
}

const PublicationModal: React.FC<PublicationModalProps> = ({ publication, isOpen, onClose }) => {
  if (!publication) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{publication.title}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center space-x-2 mt-2">
              <Avatar>
                <AvatarFallback>{publication.author[0]}</AvatarFallback>
              </Avatar>
              <span>{publication.author}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{publication.date}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[60vh]">
          <div className="space-y-4">
            <p>{publication.content}</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default PublicationModal