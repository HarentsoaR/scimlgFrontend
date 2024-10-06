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
        <DialogTitle className="text-xl font-bold">Review Publication</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>{publication.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{publication.title}</h3>
            <p className="text-sm text-muted-foreground">
              {publication.author} • {new Date(publication.date).toLocaleDateString()} at {new Date(publication.date).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <ScrollArea className="mt-4 max-h-[60vh] p-4 border rounded-md border-gray-200">
          <div className="space-y-4">
            <p className="text-base">{publication.content}</p>
          </div>
        </ScrollArea>
      </div>
      <DialogFooter className="flex justify-between mt-4">
        {/* <Button variant="outline" className="text-red-600 underline-offset-4 hover:underline" onClick={() => onReject(publication.id)}>
          Reject
        </Button> */}
        <Button onClick={() => onApprove(publication.id)} className="bg-blue-600 text-white hover:bg-blue-700">
          Approve
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
}
export default ApprovalModal