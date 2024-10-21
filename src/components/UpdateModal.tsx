import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const updatePublicationSchema = z.object({
  title: z.string().min(2, { message: "Title is required." }),
  content: z.string().min(2, { message: "Description is required" }),
});

type UpdatePublicationValues = z.infer<typeof updatePublicationSchema>;

const UpdateModal = ({ publication, isOpen, onClose, token }) => {
  const { toast } = useToast();
  const form = useForm<UpdatePublicationValues>({
    resolver: zodResolver(updatePublicationSchema),
    defaultValues: publication || { title: "", content: "" },
  });

  useEffect(() => {
    if (publication) {
      form.reset(publication);
    }
  }, [publication, form]);

  const onSubmit = async (data: UpdatePublicationValues) => {
    try {
      await axios.put(`http://localhost:8080/articles/${publication.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Publication updated", description: "Your publication has been successfully updated." });
      onClose();
    } catch (error) {
      console.error("Failed to update publication:", error);
      toast({ title: "Update failed", description: "There was an error updating your publication.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this publication?");
    if (confirmed) {
      try {
        await axios.delete(`http://localhost:8080/articles/${publication.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: "Publication deleted", description: "Your publication has been successfully deleted." });
        onClose();
      } catch (error) {
        console.error("Failed to delete publication:", error);
        toast({ title: "Delete failed", description: "There was an error deleting your publication.", variant: "destructive" });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Publication</DialogTitle>
          <DialogDescription>
            Make changes to your publication here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Publication Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Publication Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-between">
              <Button variant="default" type="submit">Save</Button>
              <Button variant="error" onClick={handleDelete}>Delete</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateModal;
