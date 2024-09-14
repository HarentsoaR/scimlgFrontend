"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: number
  name: string
  avatar?: string
}

interface LikesModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
}

export default function LikesModal({ isOpen, onClose, users }: LikesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Users who liked this publication</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-4 py-2">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.name}</span>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}