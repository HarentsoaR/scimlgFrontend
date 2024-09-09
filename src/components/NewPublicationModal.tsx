import React, { useState } from 'react';
import axios from 'axios'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { parseCookies } from 'nookies';

interface NewPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void; // New prop for refreshing the publications
}

const NewPublicationModal: React.FC<NewPublicationModalProps> = ({ isOpen, onClose, onPublish }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.post('http://localhost:8080/articles', {
        title,
        content,
        status: 'under_review'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Publication created:', response.data);
      onPublish(); // Call the onPublish function to refresh the list
    } catch (error) {
      console.error('Error creating publication:', error);
    } finally {
      setTitle('');
      setContent('');
      onClose(); // Close the modal
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Publication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Publish</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPublicationModal;
