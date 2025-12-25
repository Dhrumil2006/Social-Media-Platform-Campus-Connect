import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreatePost } from "@/hooks/use-campus";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Image as ImageIcon, 
  FileText, 
  Link as LinkIcon, 
  Send,
  X 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const createPost = useCreatePost();
  
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [attachmentType, setAttachmentType] = useState<'text' | 'image' | 'pdf' | 'link'>('text');
  const [attachmentUrl, setAttachmentUrl] = useState("");

  if (!user) return null;

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({ title: "Content required", variant: "destructive" });
      return;
    }

    try {
      await createPost.mutateAsync({
        content,
        type: attachmentType,
        mediaUrls: attachmentUrl ? [attachmentUrl] : [],
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      
      toast({ title: "Post created successfully!" });
      setIsOpen(false);
      setContent("");
      setTags("");
      setAttachmentType("text");
      setAttachmentUrl("");
    } catch (error) {
      toast({ title: "Failed to create post", variant: "destructive" });
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-4 mb-6">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profileImageUrl || undefined} />
          <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
        </Avatar>
        <div 
          onClick={() => setIsOpen(true)}
          className="flex-1 bg-muted/50 hover:bg-muted/80 transition-colors rounded-xl px-4 py-2.5 text-muted-foreground cursor-pointer text-sm"
        >
          What's happening on campus, {user.firstName}?
        </div>
      </div>
      
      <div className="flex gap-2 mt-4 ml-14">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => setIsOpen(true)}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Photo
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => setIsOpen(true)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Document
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea 
                  placeholder="Share your thoughts, questions, or updates..." 
                  className="min-h-[120px] resize-none border-none focus-visible:ring-0 p-0 text-base"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            {/* Attachment Preview/Input Area */}
            {attachmentType !== 'text' && (
              <div className="relative bg-muted/30 rounded-xl p-4 border border-dashed border-border group">
                <button 
                  onClick={() => {
                    setAttachmentType('text');
                    setAttachmentUrl('');
                  }}
                  className="absolute top-2 right-2 p-1 bg-background rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <Input 
                  placeholder={
                    attachmentType === 'image' ? "Enter image URL..." : 
                    attachmentType === 'pdf' ? "Enter PDF document URL..." : 
                    "Enter link URL..."
                  }
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="bg-background"
                />
                
                {attachmentUrl && attachmentType === 'image' && (
                  <div className="mt-3 rounded-lg overflow-hidden h-32 w-full">
                    <img src={attachmentUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button 
                type="button"
                variant={attachmentType === 'image' ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setAttachmentType('image')}
                className="gap-2 rounded-full"
              >
                <ImageIcon className="h-4 w-4" /> Photo
              </Button>
              <Button 
                type="button"
                variant={attachmentType === 'pdf' ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setAttachmentType('pdf')}
                className="gap-2 rounded-full"
              >
                <FileText className="h-4 w-4" /> PDF
              </Button>
              <Button 
                type="button"
                variant={attachmentType === 'link' ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setAttachmentType('link')}
                className="gap-2 rounded-full"
              >
                <LinkIcon className="h-4 w-4" /> Link
              </Button>
            </div>

            <Input 
              placeholder="Add tags (comma separated)... e.g. #Exam, #Event" 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-muted/30 border-transparent focus:border-primary focus:bg-background"
            />
          </div>

          <DialogFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={createPost.isPending || !content.trim()}
              className="w-full sm:w-auto rounded-full px-8"
            >
              {createPost.isPending ? "Posting..." : "Post Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
