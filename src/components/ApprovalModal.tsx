import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  status: 'pending' | 'approved' | 'rejected'
}

interface ApprovalModalProps {
  publication: Publication | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ publication, isOpen, onClose, onApprove, onReject }) => {
  if (!publication) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Review Publication</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>{publication.author[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{publication.title}</h3>
              <p className="text-sm text-muted-foreground">{publication.author} • {publication.date}</p>
            </div>
          </div>
          <ScrollArea className="mt-4 max-h-[60vh]">
            <div className="space-y-4">
              <p>{publication.content}</p>
            </div>
          </ScrollArea>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onReject(publication.id)}>Reject</Button>
          <Button onClick={() => onApprove(publication.id)}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ApprovalModal